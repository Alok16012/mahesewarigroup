-- REBRANDING: Broker -> Associate
-- Run this in your Supabase SQL Editor

-- 1. Update roles and constraints in profiles table
DO $$ 
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
END $$;

UPDATE profiles SET role = 'associate' WHERE role = 'broker';
UPDATE profiles SET role = 'sub-associate' WHERE role = 'sub-broker';

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'associate', 'sub-associate'));
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'associate';

-- 2. Rename columns in leads table
ALTER TABLE leads RENAME COLUMN broker_id TO associate_id;
ALTER TABLE leads RENAME COLUMN broker_name TO associate_name;

-- 3. Rename columns in sales table
ALTER TABLE sales RENAME COLUMN broker_id TO associate_id;

-- 4. Update the trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'associate');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
