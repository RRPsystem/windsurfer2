-- Brand Settings Table
-- Stores design settings per brand (logo, fonts, colors)
-- One row per brand_id for consistency across all pages

CREATE TABLE IF NOT EXISTS brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL UNIQUE,
    
    -- Logo
    logo_url TEXT,
    
    -- Typography
    font_family VARCHAR(100) DEFAULT 'inter',
    
    -- Colors
    color_palette VARCHAR(50) DEFAULT 'original',
    color_primary VARCHAR(7),
    color_secondary VARCHAR(7),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_brand_settings_brand_id ON brand_settings(brand_id);

-- RLS Policies
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Simpele policy: Allow all authenticated users to read/write
-- (We can make this more restrictive later if needed)
CREATE POLICY "Allow authenticated users to manage brand settings"
    ON brand_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_brand_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_settings_updated_at
    BEFORE UPDATE ON brand_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_settings_updated_at();
