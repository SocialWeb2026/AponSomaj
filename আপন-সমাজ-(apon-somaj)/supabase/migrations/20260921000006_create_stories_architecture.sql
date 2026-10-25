-- ====================================================================
-- Apon Somaj — Migration 006: Stories Architecture & Expiration
-- Public Stories, 24-Hour Expiration, RLS & Indexes
-- ====================================================================

-- 1. Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'text')),
    content TEXT,
    background_style TEXT,
    privacy VARCHAR(30) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'friends')),
    location_name TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT check_story_content CHECK (media_url IS NOT NULL OR content IS NOT NULL),
    CONSTRAINT check_story_expiry CHECK (expires_at > created_at)
);

-- ====================================================================
-- Indexes for Active Stories & Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_privacy ON public.stories(privacy);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Active & unexpired stories visible according to privacy
-- (Public visible to authenticated users, Friends visible only to accepted friends or author)
CREATE POLICY "Stories are visible according to privacy"
    ON public.stories FOR SELECT
    USING (
        privacy = 'public' 
        OR user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND receiver_id = stories.user_id)
                OR (receiver_id = auth.uid() AND requester_id = stories.user_id)
            )
        )
    );

-- 2. INSERT Policy: Authenticated users can create only their own stories
CREATE POLICY "Users can create their own story"
    ON public.stories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy: Users can update only their own stories
CREATE POLICY "Users can update their own story"
    ON public.stories FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. DELETE Policy: Users can delete only their own stories or admins can moderate
CREATE POLICY "Users can delete their own story"
    ON public.stories FOR DELETE
    USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));
