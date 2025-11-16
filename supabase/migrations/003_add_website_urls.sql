-- Add preview and live URL columns to websites table
-- Migration: 003_add_website_urls

-- Add URL columns
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS live_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'preview', 'live'));

-- Add indexes for fast URL lookups
CREATE INDEX IF NOT EXISTS idx_websites_preview_url ON websites(preview_url);
CREATE INDEX IF NOT EXISTS idx_websites_live_url ON websites(live_url);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);

-- Add comment
COMMENT ON COLUMN websites.preview_url IS 'Preview URL: brand-slug.ai-websitestudio.nl';
COMMENT ON COLUMN websites.live_url IS 'Live URL: www.custom-domain.nl';
COMMENT ON COLUMN websites.status IS 'Website status: draft, preview, or live';
