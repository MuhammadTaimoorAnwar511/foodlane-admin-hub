
-- Create the shop profile tables structure
-- 1. Primary shop profile table
CREATE TABLE shop_profile (
  id             uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name      text     NOT NULL,
  tagline        text,
  short_desc     text,
  about_desc     text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 2. Contact numbers table (phone & whatsapp)
CREATE TABLE contact_numbers (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid     REFERENCES shop_profile(id) ON DELETE CASCADE,
  type        text     CHECK (type IN ('phone','whatsapp')),
  label       text,     -- e.g. "Main", "Support"
  number      text     NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 3. Social links table
CREATE TABLE social_links (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid     REFERENCES shop_profile(id) ON DELETE CASCADE,
  platform    text     NOT NULL,        -- e.g. 'facebook','instagram','twitter'
  url         text     NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 4. Locations table
CREATE TABLE locations (
  id              uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid     REFERENCES shop_profile(id) ON DELETE CASCADE,
  address         text     NOT NULL,
  latitude        numeric,               -- e.g. 40.7128
  longitude       numeric,               -- e.g. -74.0060
  google_maps_url text,
  created_at      timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE shop_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations (since this is admin-only functionality)
CREATE POLICY "Allow all operations on shop_profile" ON shop_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contact_numbers" ON contact_numbers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on social_links" ON social_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on locations" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Insert default shop profile data
INSERT INTO shop_profile (shop_name, tagline, short_desc, about_desc) 
VALUES (
  'FastFood Delight',
  'Delicious food delivered fast',
  'Best fast food in town',
  'We serve the best fast food in town with fresh ingredients and quick delivery. Our commitment to quality and customer satisfaction has made us a favorite among food lovers.'
);

-- Get the profile_id for default data
DO $$ 
DECLARE 
    profile_id_var uuid;
BEGIN
    SELECT id INTO profile_id_var FROM shop_profile LIMIT 1;
    
    -- Insert default contact numbers
    INSERT INTO contact_numbers (profile_id, type, label, number) VALUES
    (profile_id_var, 'phone', 'Main', '+92-300-1234567'),
    (profile_id_var, 'whatsapp', 'Support', '+92-300-1234567');
    
    -- Insert default location
    INSERT INTO locations (profile_id, address, latitude, longitude) VALUES
    (profile_id_var, '123 Main Street, City Center, Karachi, Pakistan', 24.8607, 67.0011);
END $$;
