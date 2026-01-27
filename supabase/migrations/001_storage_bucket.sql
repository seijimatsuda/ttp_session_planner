-- Migration: Create drill-media storage bucket with RLS policies
-- Phase 4, Plan 01: Storage bucket infrastructure for media uploads

-- Create the drill-media bucket (private, with file restrictions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'drill-media',
  'drill-media',
  false,
  104857600, -- 100MB in bytes
  ARRAY[
    'video/mp4',
    'video/quicktime',
    'video/x-m4v',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects (may already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their own folder
-- Path pattern: {user_id}/{timestamp}_{uuid}_{filename}
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'drill-media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'drill-media'
  AND owner_id = (SELECT auth.uid())
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'drill-media'
  AND owner_id = (SELECT auth.uid())
);
