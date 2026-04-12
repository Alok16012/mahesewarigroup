-- Add property images and map image columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS map_image text;

-- Create storage bucket for properties if it doesn't exist (Note: This might need to be done via UI or specialized API, but adding here as a reminder)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('properties', 'properties', true)
-- ON CONFLICT (id) DO NOTHING;

-- Policies for public access to property images
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'properties');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'properties' AND auth.role() = 'authenticated');
