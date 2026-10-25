-- ====================================================================
-- Apon Somaj — Migration 009: Storage Buckets, Media Policies & Post Extensions
-- Provisions production storage buckets, Storage RLS policies,
-- and schema support for photos, videos, and reels.
-- ====================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-images', 'post-images', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('post-videos', 'post-videos', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/webm']),
  ('reels', 'reels', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/webm']),
  ('thumbnails', 'thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('audio', 'audio', true, 20971520, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies for storage.objects
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting existing policies
DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users update own media objects" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own media objects" ON storage.objects;
DROP POLICY IF EXISTS "Anon upload media objects" ON storage.objects;

-- Policy A: Public read access for all approved media buckets
CREATE POLICY "Public read media objects" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('post-images', 'post-videos', 'reels', 'thumbnails', 'audio'));

-- Policy B: Authenticated users can upload to their own user folder
CREATE POLICY "Authenticated users upload media" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('post-images', 'post-videos', 'reels', 'thumbnails', 'audio')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy C: Users can update their own objects
CREATE POLICY "Users update own media objects" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('post-images', 'post-videos', 'reels', 'thumbnails', 'audio')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy D: Users can delete their own objects (or admins)
CREATE POLICY "Users delete own media objects" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('post-images', 'post-videos', 'reels', 'thumbnails', 'audio')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_moderator_or_admin(auth.uid()))
  );

-- Policy E: Development/testing upload access for anon role
CREATE POLICY "Anon upload media objects" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id IN ('post-images', 'post-videos', 'reels', 'thumbnails', 'audio'));

-- 3. Extend posts table with media/reels fields if not already present
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS post_type VARCHAR(30) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS duration NUMERIC,
  ADD COLUMN IF NOT EXISTS reel_duration INT DEFAULT 30,
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
  ADD COLUMN IF NOT EXISTS processing_status VARCHAR(30) NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS editing_metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Extend post_media table with thumbnails and duration
ALTER TABLE IF EXISTS public.post_media
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS duration NUMERIC,
  ADD COLUMN IF NOT EXISTS width INT,
  ADD COLUMN IF NOT EXISTS height INT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT;
