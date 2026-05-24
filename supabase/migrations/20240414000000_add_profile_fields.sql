-- Add phone, status columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active';

-- Add buyer_phone to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS buyer_phone TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS associate_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_date DATE;

-- Allow associates to insert their own leads
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
CREATE POLICY "Users can insert leads" ON leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow associates to delete their own leads
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE USING (
  auth.uid() = associate_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sales policies
DROP POLICY IF EXISTS "Authenticated can manage sales" ON sales;
CREATE POLICY "Sales insert by authenticated" ON sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sales update by admin or associate" ON sales FOR UPDATE USING (
  auth.uid() = associate_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Sales select by authenticated" ON sales FOR SELECT USING (auth.role() = 'authenticated');

-- Update trigger to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, referral_code, referred_by, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'associate'),
    new.raw_user_meta_data->>'referral_code',
    new.raw_user_meta_data->>'referred_by',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    referral_code = EXCLUDED.referral_code,
    referred_by = EXCLUDED.referred_by,
    phone = EXCLUDED.phone;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
