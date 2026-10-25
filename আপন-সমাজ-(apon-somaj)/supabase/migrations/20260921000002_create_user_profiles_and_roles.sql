-- ====================================================================
-- Apon Somaj — Migration 002: User Profiles, Roles, Locations & Privacy
-- Relates directly to Supabase Auth (auth.users)
-- ====================================================================

-- 1. User Roles Table (Server-side Role-Based Access Control - RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    bn_name VARCHAR(200),
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    work VARCHAR(255),
    education VARCHAR(255),
    blood_group VARCHAR(10),
    hometown VARCHAR(255),
    current_district VARCHAR(255),
    phone VARCHAR(30),
    website TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Locations Table (Specific 5-tier Bangladesh Administrative Hierarchy Link)
CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_type VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (location_type IN ('permanent', 'current', 'workplace')),
    division_id TEXT REFERENCES public.divisions(id) ON DELETE SET NULL,
    district_id TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    upazila_id TEXT REFERENCES public.upazilas(id) ON DELETE SET NULL,
    union_id TEXT REFERENCES public.unions(id) ON DELETE SET NULL,
    ward_id TEXT REFERENCES public.wards(id) ON DELETE SET NULL,
    custom_address TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_location_type UNIQUE (user_id, location_type)
);

-- 4. Privacy Settings Table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(50) NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    show_phone BOOLEAN NOT NULL DEFAULT false,
    show_email BOOLEAN NOT NULL DEFAULT false,
    show_location_hierarchy BOOLEAN NOT NULL DEFAULT true,
    location_visibility_level VARCHAR(50) NOT NULL DEFAULT 'ward' CHECK (location_visibility_level IN ('division', 'district', 'upazila', 'union', 'ward')),
    who_can_message VARCHAR(50) NOT NULL DEFAULT 'everyone' CHECK (who_can_message IN ('everyone', 'friends')),
    who_can_friend VARCHAR(50) NOT NULL DEFAULT 'everyone' CHECK (who_can_friend IN ('everyone', 'friends_of_friends')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- Helper Functions for Server-Side Security & Roles
-- ====================================================================
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role IN ('moderator', 'admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role IN ('moderator', 'admin', 'super_admin')
  );
$$;

-- Trigger: Automatically handle profile creation on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'নতুন সদস্য'),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- Indexes for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_district ON public.user_locations(district_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (is_banned = false);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Locations Policies
CREATE POLICY "Public can view non-private user locations"
    ON public.user_locations FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own locations"
    ON public.user_locations FOR ALL
    USING (auth.uid() = user_id);

-- Privacy Settings Policies
CREATE POLICY "Users can view their own privacy settings"
    ON public.privacy_settings FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own privacy settings"
    ON public.privacy_settings FOR ALL
    USING (auth.uid() = user_id);

-- User Roles Policies (Server-side admin only)
CREATE POLICY "Admins can view and manage user roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);
