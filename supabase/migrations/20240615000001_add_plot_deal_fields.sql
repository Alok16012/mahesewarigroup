-- Optional structured deal fields for plot-level reserved/sold records.
-- The app remains backward compatible with older databases.

ALTER TABLE plot_units ADD COLUMN IF NOT EXISTS telecaller_name TEXT;
ALTER TABLE plot_units ADD COLUMN IF NOT EXISTS final_amount NUMERIC;
