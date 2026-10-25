-- ====================================================================
-- Apon Somaj — Migration 007: Labour Marketplace (“কাজ চাই / শ্রমিক চাই”)
-- Categories, Skills, Worker/Employer Profiles, Job Posts,
-- Applications, Secure Contact Requests, Safety Reports
-- ====================================================================

-- 1. Labour Categories
CREATE TABLE IF NOT EXISTS public.labour_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'wrench',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Standard Categories
INSERT INTO public.labour_categories (id, name, bn_name, icon, sort_order) VALUES
('construction', 'Construction & Masonry', 'নির্মাণ ও রাজমিস্ত্রি', 'building-2', 1),
('carpentry', 'Carpentry & Woodwork', 'ছুতার ও কাঠের কাজ', 'hammer', 2),
('electrical', 'Electrical & Wiring', 'ইলেকট্রিশিয়ান ও ওয়্যারিং', 'zap', 3),
('plumbing', 'Plumbing & Pipe Fitting', 'প্লাম্বিং ও পাইপ ফিটিং', 'droplets', 4),
('painting', 'Painting & Decorating', 'রংমিস্ত্রি ও ডেকোরেশন', 'paint-brush', 5),
('agriculture', 'Agriculture & Farming', 'কৃষি ও খামার শ্রমিক', 'sprout', 6),
('transport', 'Transport & Drivers', 'ড্রাইভার ও পরিবহন', 'truck', 7),
('welding', 'Welding & Fabrication', 'ওয়েল্ডিং ও গ্রিল মিস্ত্রি', 'flame', 8),
('day_labour', 'General Day Labour', 'সাধারণ দিনমজুর ও মাটিকাটা', 'hard-hat', 9),
('mechanic', 'Auto & Machine Mechanic', 'মেকানিক ও মেরামত', 'wrench', 10),
('home_service', 'Home Care & Cleaning', 'গৃহপরিচারিকা ও পরিচ্ছন্নতাকর্মী', 'sparkles', 11),
('tailoring', 'Tailoring & Garments', 'দর্জি ও সেলাই কর্মী', 'scissors', 12)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    bn_name = EXCLUDED.bn_name,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- 2. Labour Skills
CREATE TABLE IF NOT EXISTS public.labour_skills (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES public.labour_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial Skills
INSERT INTO public.labour_skills (id, category_id, name, bn_name) VALUES
('mason', 'construction', 'Mason', 'রাজমিস্ত্রি'),
('mason_helper', 'construction', 'Mason Helper / Jogali', 'রাজমিস্ত্রির জোগালী'),
('tile_fitter', 'construction', 'Tiles & Marble Fitter', 'টাইলস ও মার্বেল মিস্ত্রি'),
('rod_binder', 'construction', 'Rod Binder', 'রড মিস্ত্রি'),
('shuttering', 'construction', 'Shuttering Carpenter', 'শাটারিং মিস্ত্রি'),
('carpenter', 'carpentry', 'Furniture Carpenter', 'ফার্নিচার ছুতার'),
('door_fitter', 'carpentry', 'Door/Window Fitter', 'দরজা-জানালা ফিটিংস'),
('electrician', 'electrical', 'House Wiring Electrician', 'হাউজ ওয়্যারিং ইলেকট্রিশিয়ান'),
('appliance_repair', 'electrical', 'Appliance Repair', 'বৈদ্যুতিক যন্ত্রপাতি মেরামত'),
('plumber', 'plumbing', 'Sanitary Plumber', 'স্যানিটারি ও পাইপ ফিটার'),
('motor_fitter', 'plumbing', 'Water Motor Fitter', 'পানির মোটর ফিটিং'),
('wall_painter', 'painting', 'Wall Painter', 'দেওয়াল রংমিস্ত্রি'),
('wood_polisher', 'painting', 'Wood Polisher', 'কাঠের পলিশ মিস্ত্রি'),
('paddy_harvest', 'agriculture', 'Harvesting Labour', 'ধান কাটা ও মাড়াই শ্রমিক'),
('farming_labour', 'agriculture', 'Field Labour', 'জমির চাষ ও পরিচর্যা শ্রমিক'),
('gardener', 'agriculture', 'Gardener', 'মালী ও বাগান পরিচর্যা'),
('easybike_driver', 'transport', 'Easybike/Auto Driver', 'ইজিবাইক/অটো চালক'),
('pickup_driver', 'transport', 'Pickup/Truck Driver', 'পিকআপ/ট্রাক ড্রাইভার'),
('van_puller', 'transport', 'Van/Rickshaw Puller', 'ভ্যান/রিকশা চালক'),
('welder', 'welding', 'Welder / Grill Maker', 'ওয়েল্ডার ও গ্রিল কারিগর'),
('day_earthwork', 'day_labour', 'Earth Digging / Moti-kata', 'মাটিকাটা শ্রমিক'),
('loading_unloading', 'day_labour', 'Loading & Shifting Labour', 'মালামাল ওঠানো-নামানো শ্রমিক'),
('bike_mechanic', 'mechanic', 'Motorcycle Mechanic', 'মোটরসাইকেল মেকানিক'),
('housekeeper', 'home_service', 'House Cleaner / Cook', 'বাসাবাড়ির কাজ ও রান্না')
ON CONFLICT (id) DO NOTHING;

-- 3. Labour Profiles
CREATE TABLE IF NOT EXISTS public.labour_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_type VARCHAR(30) NOT NULL CHECK (user_type IN ('looking_for_work', 'hiring_workers', 'both')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_phone_verified BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    category_id VARCHAR(50) REFERENCES public.labour_categories(id) ON DELETE SET NULL,
    skill_id VARCHAR(50) REFERENCES public.labour_skills(id) ON DELETE SET NULL,
    specific_skill VARCHAR(150),
    experience_years INT NOT NULL DEFAULT 1,
    experience_level VARCHAR(50) NOT NULL DEFAULT 'দক্ষ কারিগর',
    expected_daily_wage NUMERIC NOT NULL DEFAULT 700,
    expected_monthly_wage NUMERIC NOT NULL DEFAULT 18000,
    availability VARCHAR(30) NOT NULL DEFAULT 'available_today' CHECK (availability IN ('available_today', 'available_this_week', 'busy', 'not_available')),
    max_travel_distance VARCHAR(50) NOT NULL DEFAULT 'same_upazila',
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    union_id TEXT REFERENCES public.unions(id) ON DELETE SET NULL,
    ward_id TEXT REFERENCES public.wards(id) ON DELETE SET NULL,
    location_custom TEXT,
    bio TEXT,
    work_history TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'busy', 'suspended', 'temporarily_unavailable')),
    completed_jobs_count INT NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_labour_profile UNIQUE (user_id)
);

-- 4. Labour Job Posts (“শ্রমিক চাই”)
CREATE TABLE IF NOT EXISTS public.labour_job_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES public.labour_categories(id) ON DELETE SET NULL,
    skill_id VARCHAR(50) REFERENCES public.labour_skills(id) ON DELETE SET NULL,
    specific_skill VARCHAR(150),
    workers_needed INT NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    wage_amount NUMERIC NOT NULL DEFAULT 700,
    wage_type VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (wage_type IN ('daily', 'monthly', 'contract')),
    duration VARCHAR(100) NOT NULL DEFAULT '১ দিন',
    work_date DATE,
    required_availability VARCHAR(30) NOT NULL DEFAULT 'immediate',
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    union_id TEXT REFERENCES public.unions(id) ON DELETE SET NULL,
    ward_id TEXT REFERENCES public.wards(id) ON DELETE SET NULL,
    address_details TEXT,
    contact_method VARCHAR(50) NOT NULL DEFAULT 'in_app',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'applications_received', 'worker_selected', 'closed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Labour Applications
CREATE TABLE IF NOT EXISTS public.labour_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.labour_job_posts(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposed_wage NUMERIC,
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_labour_application UNIQUE (job_id, worker_id)
);

-- 6. Labour Contact Requests (Secure Privacy Contact)
CREATE TABLE IF NOT EXISTS public.labour_contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('worker', 'job')),
    target_id UUID NOT NULL,
    request_type VARCHAR(30) NOT NULL DEFAULT 'contact_request' CHECK (request_type IN ('contact_request', 'call_request', 'hire_request')),
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    phone_shared BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Labour Safety Reports
CREATE TABLE IF NOT EXISTS public.labour_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('worker_profile', 'job_post', 'contact_request')),
    target_id UUID NOT NULL,
    reason VARCHAR(150) NOT NULL,
    details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for Speed & Fast Proximity Matching
CREATE INDEX IF NOT EXISTS idx_labour_prof_location ON public.labour_profiles (district_id, upazila_id, union_id, ward_id);
CREATE INDEX IF NOT EXISTS idx_labour_prof_skill ON public.labour_profiles (category_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_labour_prof_status ON public.labour_profiles (status, availability);
CREATE INDEX IF NOT EXISTS idx_labour_job_location ON public.labour_job_posts (district_id, upazila_id, union_id, ward_id);
CREATE INDEX IF NOT EXISTS idx_labour_job_status ON public.labour_job_posts (status, expires_at);
CREATE INDEX IF NOT EXISTS idx_labour_contact_receiver ON public.labour_contact_requests (receiver_id, status);

-- Enable RLS
ALTER TABLE public.labour_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories & Skills: Everyone can read
CREATE POLICY "labour_categories_select" ON public.labour_categories FOR SELECT USING (true);
CREATE POLICY "labour_skills_select" ON public.labour_skills FOR SELECT USING (true);

-- Profiles: Public active profiles readable by all authenticated users
CREATE POLICY "labour_profiles_select" ON public.labour_profiles
    FOR SELECT USING (status != 'suspended' OR auth.uid() = user_id);

CREATE POLICY "labour_profiles_insert" ON public.labour_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "labour_profiles_update" ON public.labour_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "labour_profiles_delete" ON public.labour_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Job Posts: Open and unexpired posts visible to all; owner can see all their posts
CREATE POLICY "labour_jobs_select" ON public.labour_job_posts
    FOR SELECT USING (
        (status != 'expired' AND expires_at > now()) OR auth.uid() = employer_id
    );

CREATE POLICY "labour_jobs_insert" ON public.labour_job_posts
    FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "labour_jobs_update" ON public.labour_job_posts
    FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "labour_jobs_delete" ON public.labour_job_posts
    FOR DELETE USING (auth.uid() = employer_id);

-- Applications: Worker who applied or employer of the job can see
CREATE POLICY "labour_applications_select" ON public.labour_applications
    FOR SELECT USING (
        auth.uid() = worker_id OR
        auth.uid() IN (SELECT employer_id FROM public.labour_job_posts WHERE id = job_id)
    );

CREATE POLICY "labour_applications_insert" ON public.labour_applications
    FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "labour_applications_update" ON public.labour_applications
    FOR UPDATE USING (
        auth.uid() = worker_id OR
        auth.uid() IN (SELECT employer_id FROM public.labour_job_posts WHERE id = job_id)
    );

-- Contact Requests: Sender and receiver can see
CREATE POLICY "labour_contact_select" ON public.labour_contact_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "labour_contact_insert" ON public.labour_contact_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "labour_contact_update" ON public.labour_contact_requests
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Reports: Reporter can create and see own reports
CREATE POLICY "labour_reports_insert" ON public.labour_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "labour_reports_select" ON public.labour_reports
    FOR SELECT USING (auth.uid() = reporter_id);
