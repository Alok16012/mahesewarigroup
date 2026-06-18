-- Store marketing staff identity details separately from the login marker.
ALTER TABLE telecallers
  ADD COLUMN IF NOT EXISTS staff_role TEXT
    CHECK (staff_role IN ('telecaller', 'marketing-manager'))
    DEFAULT 'telecaller',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_last_four TEXT
    CHECK (aadhaar_last_four IS NULL OR aadhaar_last_four ~ '^[0-9]{4}$'),
  ADD COLUMN IF NOT EXISTS aadhaar_front_path TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_back_path TEXT;

-- Existing marketing-manager rows used the phone column as a role marker.
UPDATE telecallers
SET
  staff_role = 'marketing-manager',
  phone = NULL
WHERE phone = '__marketing_manager__';

UPDATE telecallers
SET staff_role = 'telecaller'
WHERE staff_role IS NULL;

-- Aadhaar documents must remain private. The service-role route creates this
-- bucket too, but keeping it here makes a fresh environment reproducible.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-documents',
  'staff-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
