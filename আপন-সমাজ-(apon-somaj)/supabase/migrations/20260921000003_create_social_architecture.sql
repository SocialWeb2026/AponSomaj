-- ====================================================================
-- Apon Somaj — Migration 003: Social Architecture
-- Posts, Media, Comments, Reactions, Friendships, Follows, Notifications, Saved, Reports
-- ====================================================================

-- 1. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    privacy VARCHAR(30) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
    feeling VARCHAR(100),
    is_poll BOOLEAN NOT NULL DEFAULT false,
    poll_question TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    union_id TEXT REFERENCES public.unions(id) ON DELETE SET NULL,
    ward_id TEXT REFERENCES public.wards(id) ON DELETE SET NULL,
    location_name VARCHAR(255),
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Post Media Table
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_type VARCHAR(30) NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
    url TEXT NOT NULL,
    caption TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Reactions Table
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type VARCHAR(30) NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id)
);

-- 5. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_friendship UNIQUE (requester_id, receiver_id),
    CONSTRAINT check_not_self_friend CHECK (requester_id <> receiver_id)
);

-- 6. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT check_not_self_follow CHECK (follower_id <> following_id)
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Saved Posts Table
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_saved_post UNIQUE (user_id, post_id)
);

-- 9. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('post', 'comment', 'user', 'group', 'page', 'job', 'marketplace')),
    target_id VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    action_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- Indexes for Social Queries & Feed Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_division_id ON public.posts(division_id);
CREATE INDEX IF NOT EXISTS idx_posts_district_id ON public.posts(district_id);
CREATE INDEX IF NOT EXISTS idx_posts_upazila_id ON public.posts(upazila_id);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Posts Policies
CREATE POLICY "Public posts are visible to all users"
    ON public.posts FOR SELECT
    USING (privacy = 'public' OR author_id = auth.uid());

CREATE POLICY "Users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts or admin can delete"
    ON public.posts FOR DELETE
    USING (auth.uid() = author_id OR public.is_moderator_or_admin(auth.uid()));

-- Post Media Policies
CREATE POLICY "Post media is visible to all who can see the post"
    ON public.post_media FOR SELECT
    USING (true);

CREATE POLICY "Users can attach media to their posts"
    ON public.post_media FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));

-- Comments Policies
CREATE POLICY "Comments are visible to all"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or admins can delete comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = author_id OR public.is_moderator_or_admin(auth.uid()));

-- Reactions Policies
CREATE POLICY "Reactions are viewable by everyone"
    ON public.reactions FOR SELECT
    USING (true);

CREATE POLICY "Users can add or change their own reactions"
    ON public.reactions FOR ALL
    USING (auth.uid() = user_id);

-- Friendships Policies
CREATE POLICY "Users can view friendships involving them"
    ON public.friendships FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send and respond to friend requests"
    ON public.friendships FOR ALL
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Follows Policies
CREATE POLICY "Follows are viewable"
    ON public.follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow/unfollow"
    ON public.follows FOR ALL
    USING (auth.uid() = follower_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update read status on their notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Saved Posts Policies
CREATE POLICY "Users can view their own saved posts"
    ON public.saved_posts FOR ALL
    USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view and manage all reports"
    ON public.reports FOR ALL
    USING (public.is_moderator_or_admin(auth.uid()));
