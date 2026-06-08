-- Add 'nr' (No Response / Not Reachable) as a valid lead status
-- so telecallers/employees can mark leads they couldn't reach.

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'nr', 'site_visit', 'negotiation', 'converted', 'lost'));
