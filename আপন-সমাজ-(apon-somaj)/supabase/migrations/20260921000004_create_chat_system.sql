-- ====================================================================
-- Apon Somaj — Migration 004: Chat & Messenger System
-- Conversations, Conversation Members, Direct & Group Messages
-- ====================================================================

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN NOT NULL DEFAULT false,
    title VARCHAR(255),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Conversation Members Table
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_conversation_member UNIQUE (conversation_id, user_id)
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- Indexes for Realtime & Messenger Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- Enforces that ONLY conversation participants can see conversations and messages
-- ====================================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view conversations they are part of"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = conversations.id
            AND conversation_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Conversation Members Policies
CREATE POLICY "Members can view other members of their conversations"
    ON public.conversation_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members AS cm
            WHERE cm.conversation_id = conversation_members.conversation_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add members or join conversations"
    ON public.conversation_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Messages Policies
CREATE POLICY "Members can read messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can insert messages into their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = auth.uid()
        )
    );
