-- Seed Uchauri Naubatpur plot site and map inventory.
-- Idempotent: existing plot status/buyer data is not overwritten.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

ALTER TABLE plot_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plot units viewable by authenticated" ON plot_units;
DROP POLICY IF EXISTS "Authenticated can manage plot units" ON plot_units;

CREATE POLICY "Plot units viewable by authenticated"
ON plot_units FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage plot units"
ON plot_units FOR ALL
USING (auth.role() = 'authenticated');

INSERT INTO properties (
  id,
  name,
  location,
  type,
  price_range,
  status,
  images,
  map_image,
  associate_id,
  associate_name
) VALUES (
  '7816a111-373a-4aff-bb6d-91eb30270c63',
  'Uchauri Naubatpur Plot Site',
  'Uchauri, Naubatpur, Bihar',
  'plot',
  'Rs 1,199/sqft',
  'available',
  '{}',
  '/property-maps/uchauri-naubatpur-plot-map.png',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  price_range = EXCLUDED.price_range,
  images = EXCLUDED.images,
  map_image = EXCLUDED.map_image;

WITH seed_plots(unit_number, sqft, facing) AS (
  VALUES
    ('A1', 1680, 'East'),
    ('A2', 1495, 'West'),
    ('B1', 2736, 'East'),
    ('B2', 1440, 'East'),
    ('B3', 1440, 'East'),
    ('B4', 1440, 'East'),
    ('B5', 1470, 'East'),
    ('B6', 1440, 'East'),
    ('C1', 2784, 'West'),
    ('C2', 1400, 'West'),
    ('C3', 1400, 'West'),
    ('C4', 1400, 'West'),
    ('C5', 1428, 'West'),
    ('C6', 1400, 'West'),
    ('C7', 1421, 'West'),
    ('D', 1080, 'East')
)
INSERT INTO plot_units (
  property_id,
  unit_number,
  status,
  price,
  size,
  facing
)
SELECT
  '7816a111-373a-4aff-bb6d-91eb30270c63',
  seed_plots.unit_number,
  'available',
  seed_plots.sqft * 1199,
  seed_plots.sqft || ' sqft',
  seed_plots.facing
FROM seed_plots
WHERE NOT EXISTS (
  SELECT 1
  FROM plot_units existing
  WHERE existing.property_id = '7816a111-373a-4aff-bb6d-91eb30270c63'
    AND existing.unit_number = seed_plots.unit_number
);
