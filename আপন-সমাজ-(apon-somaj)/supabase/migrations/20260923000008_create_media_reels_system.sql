-- ====================================================================
-- Apon Somaj — Migration 008: Media, Reels & Storage Architecture
-- Production-ready schema extensions for Photo Posts, Video Posts,
-- Reels (TikTok style), Audio/Music, Storage Policies & Moderation
-- ====================================================================

-- 1. Extend posts table with rich media, reels and audio fields
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS post_type VARCHAR(30) NOT NULL DEFAULT 'standard' CHECK (post_type IN ('standard', 'reel', 'story')),
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(30) CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS duration NUMERIC,
  ADD COLUMN IF NOT EXISTS reel_duration INT DEFAULT 30 CHECK (reel_duration IN (15, 30, 60, 90, 180)),
  ADD COLUMN IF NOT EXISTS music_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS music_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS music_artist VARCHAR(255),
  ADD COLUMN IF NOT EXISTS music_url TEXT,
  ADD COLUMN IF NOT EXISTS original_audio BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS original_audio_volume NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS music_volume NUMERIC DEFAULT 0.8,
  ADD COLUMN IF NOT EXISTS audio_start NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS audio_duration NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS processing_status VARCHAR(30) NOT NULL DEFAULT 'ready' CHECK (processing_status IN ('uploading', 'processing', 'generating_thumbnail', 'ready', 'failed')),
  ADD COLUMN IF NOT EXISTS editing_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Extend post_media table with thumbnails and duration
ALTER TABLE IF EXISTS public.post_media
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS duration NUMERIC,
  ADD COLUMN IF NOT EXISTS width INT,
  ADD COLUMN IF NOT EXISTS height INT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- 3. Create approved music/audio library table
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  duration NUMERIC NOT NULL DEFAULT 30,
  genre VARCHAR(100) DEFAULT 'traditional',
  license_type VARCHAR(100) NOT NULL DEFAULT 'Royalty-Free / Platform Licensed',
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  play_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial copyright-free & royalty-free music
INSERT INTO public.audio_tracks (id, title, artist, duration, genre, license_type, audio_url, cover_url)
VALUES
  ('music-1', 'মন মাঝি রে (Acoustic Dotara)', 'গ্রামবাংলা সুরকার দল', 45, 'folk', 'Royalty-Free / CC-BY', 'https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'),
  ('music-2', 'নদীর বাঁকে বাঁকে (Banshi & Flute)', 'পল্লী সুর একাডেমি', 60, 'traditional', 'Royalty-Free / CC-BY', 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200'),
  ('music-3', 'উৎসবের ঢোল (Festive Celebration)', 'লোক বাদ্যযন্ত্র শিল্পী সংঘ', 30, 'festive', 'Royalty-Free / CC-BY', 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'),
  ('music-4', 'সকালের স্নিগ্ধ আলো (Morning Calm)', 'আপন সমাজ স্টুডিও', 90, 'ambient', 'Platform Licensed', 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'),
  ('music-5', 'আধুনিক লফি ছন্দ (Dhaka Lofi Beat)', 'আর্বান সুর ট্র্যাকার', 60, 'lofi', 'Royalty-Free / CC-BY', 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200')
ON CONFLICT (id) DO NOTHING;

-- 4. Create Media Reports Table for copyright and content safety
CREATE TABLE IF NOT EXISTS public.media_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('post', 'reel', 'media', 'audio')),
  target_id TEXT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for fast feed and reels querying
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_media_type ON public.posts(media_type);
CREATE INDEX IF NOT EXISTS idx_posts_processing_status ON public.posts(processing_status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at_post_type ON public.posts(created_at DESC, post_type);
CREATE INDEX IF NOT EXISTS idx_media_reports_target ON public.media_reports(target_type, target_id);

-- 6. Row Level Security Policies
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_reports ENABLE ROW LEVEL SECURITY;

-- Audio tracks: everyone can read active tracks
CREATE POLICY "Public read active audio tracks" ON public.audio_tracks
  FOR SELECT USING (is_active = true);

-- Media reports: users can insert their own reports
CREATE POLICY "Users can submit media reports" ON public.media_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Media reports: users can see their own reports
CREATE POLICY "Users can view own media reports" ON public.media_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Storage buckets provisioning instructions:
-- Bucket IDs: 'post-images', 'post-videos', 'reels', 'thumbnails', 'audio'
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('post-images', 'post-images', true),
--   ('post-videos', 'post-videos', true),
--   ('reels', 'reels', true),
--   ('thumbnails', 'thumbnails', true),
--   ('audio', 'audio', true)
-- ON CONFLICT (id) DO NOTHING;
