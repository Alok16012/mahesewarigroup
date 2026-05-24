-- telecallers table
CREATE TABLE IF NOT EXISTS telecallers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- lead followups table
CREATE TABLE IF NOT EXISTS lead_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL,
  lead_name TEXT,
  telecaller_id TEXT,
  telecaller_name TEXT,
  follow_up_date DATE NOT NULL,
  notes TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'called', 'no_answer', 'interested', 'not_interested', 'callback')),
  next_followup_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add telecaller + followup columns to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telecaller_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telecaller_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup_date DATE;

-- RLS
ALTER TABLE telecallers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read telecallers" ON telecallers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read followups" ON lead_followups
  FOR SELECT USING (auth.role() = 'authenticated');
