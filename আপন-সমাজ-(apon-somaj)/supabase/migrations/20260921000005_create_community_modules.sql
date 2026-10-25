-- ====================================================================
-- Apon Somaj — Migration 005: Community & Specialized Modules
-- Groups, Pages, Jobs, Job Applications, Matrimony, Marketplace
-- ====================================================================

-- 1. Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    privacy VARCHAR(30) NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    cover_url TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    members_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

-- 3. Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    followers_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Page Members / Followers Table
CREATE TABLE IF NOT EXISTS public.page_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'follower' CHECK (role IN ('follower', 'editor', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_page_member UNIQUE (page_id, user_id)
);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_text TEXT,
    contact_phone VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'viewed', 'shortlisted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_job_applicant UNIQUE (job_id, applicant_id)
);

-- 7. Matrimony Profiles Table
CREATE TABLE IF NOT EXISTS public.matrimony_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    age INT NOT NULL,
    religion VARCHAR(50) DEFAULT 'Islam',
    height VARCHAR(20),
    marital_status VARCHAR(50) DEFAULT 'Never Married',
    education VARCHAR(255),
    profession VARCHAR(255),
    family_background TEXT,
    expectations TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_matrimony_user UNIQUE (user_id)
);

-- 8. Marketplace Items Table
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL DEFAULT 'Used',
    description TEXT NOT NULL,
    image_url TEXT,
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- Indexes for Community Modules
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_groups_district_id ON public.groups(district_id);
CREATE INDEX IF NOT EXISTS idx_pages_district_id ON public.pages(district_id);
CREATE INDEX IF NOT EXISTS idx_jobs_district_id ON public.jobs(district_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_matrimony_district_id ON public.matrimony_profiles(district_id);
CREATE INDEX IF NOT EXISTS idx_matrimony_gender ON public.matrimony_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_marketplace_district_id ON public.marketplace_items(district_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_items(status);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimony_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Groups Policies
CREATE POLICY "Public groups are viewable by all"
    ON public.groups FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create groups"
    ON public.groups FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators or admins can update groups"
    ON public.groups FOR UPDATE
    USING (auth.uid() = creator_id OR public.is_moderator_or_admin(auth.uid()));

-- Group Members Policies
CREATE POLICY "Members list is public"
    ON public.group_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join or leave groups"
    ON public.group_members FOR ALL
    USING (auth.uid() = user_id);

-- Pages Policies
CREATE POLICY "Public pages are viewable by all"
    ON public.pages FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create pages"
    ON public.pages FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Page owners or admins can update pages"
    ON public.pages FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_moderator_or_admin(auth.uid()));

-- Page Members Policies
CREATE POLICY "Page followers are viewable"
    ON public.page_members FOR SELECT
    USING (true);

CREATE POLICY "Users can follow or unfollow pages"
    ON public.page_members FOR ALL
    USING (auth.uid() = user_id);

-- Jobs Policies
CREATE POLICY "Active jobs are viewable by all"
    ON public.jobs FOR SELECT
    USING (is_active = true OR poster_id = auth.uid());

CREATE POLICY "Authenticated users can post jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Job posters or admins can manage jobs"
    ON public.jobs FOR ALL
    USING (auth.uid() = poster_id OR public.is_moderator_or_admin(auth.uid()));

-- Job Applications Policies
CREATE POLICY "Applicants and job posters can view applications"
    ON public.job_applications FOR SELECT
    USING (
        auth.uid() = applicant_id OR
        EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND poster_id = auth.uid())
    );

CREATE POLICY "Authenticated users can apply for jobs"
    ON public.job_applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

-- Matrimony Profiles Policies
CREATE POLICY "Matrimony profiles are viewable by authenticated users"
    ON public.matrimony_profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own matrimony profile"
    ON public.matrimony_profiles FOR ALL
    USING (auth.uid() = user_id);

-- Marketplace Policies
CREATE POLICY "Available marketplace items are viewable by all"
    ON public.marketplace_items FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can post marketplace items"
    ON public.marketplace_items FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers or admins can update or delete marketplace items"
    ON public.marketplace_items FOR ALL
    USING (auth.uid() = seller_id OR public.is_moderator_or_admin(auth.uid()));
