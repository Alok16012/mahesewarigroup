-- Storage policies for 'properties' bucket
-- Run this in Supabase SQL Editor after creating the bucket

-- Allow anyone to read/view property images (public bucket)
CREATE POLICY "Public read property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'properties' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/replace images
CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'properties' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'properties' AND auth.role() = 'authenticated');
