-- Fix property edit policy to allow authenticated users to edit properties
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can edit properties" ON properties;

-- Create new policy that allows all authenticated users to edit properties
CREATE POLICY "Authenticated users can edit properties" ON properties FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- Also allow insert for authenticated users
CREATE POLICY "Authenticated users can insert properties" ON properties FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);