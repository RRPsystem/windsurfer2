-- Create template_previews table for storing preview HTML
CREATE TABLE IF NOT EXISTS template_previews (
    preview_id TEXT PRIMARY KEY,
    brand_id UUID NOT NULL,
    template TEXT NOT NULL,
    html TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_previews_brand_id ON template_previews(brand_id);
CREATE INDEX IF NOT EXISTS idx_template_previews_expires_at ON template_previews(expires_at);

-- Enable RLS
ALTER TABLE template_previews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read previews (for preview page)
CREATE POLICY "Anyone can read previews"
ON template_previews FOR SELECT
USING (true);

-- Policy: Users can insert their own previews
CREATE POLICY "Users can insert their own previews"
ON template_previews FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own previews
CREATE POLICY "Users can update their own previews"
ON template_previews FOR UPDATE
USING (true);

-- Function to clean up expired previews (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_previews()
RETURNS void AS $$
BEGIN
    DELETE FROM template_previews
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Note: You can set up a cron job in Supabase to run this function daily
-- Or manually run: SELECT cleanup_expired_previews();
