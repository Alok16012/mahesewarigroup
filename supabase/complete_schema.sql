-- ============================================================
-- MAHESEWARI GROUP CRM - COMPLETE SCHEMA
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'associate', 'sub-associate')) DEFAULT 'associate',
  referral_code TEXT,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 2. PROPERTIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK (type IN ('residential', 'commercial', 'plot')) NOT NULL,
  price_range TEXT,
  status TEXT CHECK (status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  map_image TEXT,
  associate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  associate_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 3. PLOT UNITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS plot_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
  buyer_name TEXT,
  price NUMERIC,
  size TEXT,
  facing TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 4. LEADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_name TEXT,
  budget NUMERIC,
  status TEXT CHECK (status IN ('new', 'contacted', 'site_visit', 'negotiation', 'converted', 'lost')) DEFAULT 'new',
  source TEXT,
  associate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  associate_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 5. SALES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_name TEXT,
  associate_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  sale_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. POLICIES
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Only admins can edit properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can edit properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON properties;

CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert properties" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can edit properties" ON properties FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete properties" ON properties FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Plot Units
DROP POLICY IF EXISTS "Plot units viewable by authenticated" ON plot_units;
DROP POLICY IF EXISTS "Authenticated can manage plot units" ON plot_units;

CREATE POLICY "Plot units viewable by authenticated" ON plot_units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage plot units" ON plot_units FOR ALL USING (auth.role() = 'authenticated');

-- Leads
DROP POLICY IF EXISTS "Leads are viewable by authenticated users" ON leads;
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update leads they manage" ON leads;

CREATE POLICY "Leads are viewable by authenticated users" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert leads" ON leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update leads they manage" ON leads FOR UPDATE USING (
  auth.uid() = associate_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sales
DROP POLICY IF EXISTS "Sales viewable by authenticated" ON sales;
DROP POLICY IF EXISTS "Authenticated can manage sales" ON sales;

CREATE POLICY "Sales viewable by authenticated" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage sales" ON sales FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'associate'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 9. DEMO DATA
-- ============================================================
INSERT INTO properties (name, location, type, price_range, status) VALUES
('Royal Meadows — Plot A-204', 'Sector 12, Gurgaon', 'plot', '85L', 'available'),
('Green Valley — Villa B-12', 'Baner, Pune', 'residential', '2.2Cr', 'sold'),
('Sunrise Heights — Flat 301', 'Andheri West, Mumbai', 'residential', '1.5Cr', 'reserved')
ON CONFLICT DO NOTHING;
