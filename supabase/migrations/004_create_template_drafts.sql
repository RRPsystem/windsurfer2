-- Create template_drafts table for auto-save functionality
-- Migration: 004_create_template_drafts

-- Create table
CREATE TABLE IF NOT EXISTS template_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    template TEXT NOT NULL,
    pages JSONB DEFAULT '[]'::jsonb,
    current_page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, template)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_template_drafts_brand_id ON template_drafts(brand_id);
CREATE INDEX IF NOT EXISTS idx_template_drafts_template ON template_drafts(template);
CREATE INDEX IF NOT EXISTS idx_template_drafts_updated_at ON template_drafts(updated_at);

-- Add RLS policies
ALTER TABLE template_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own brand's drafts
CREATE POLICY "Users can view own brand drafts"
    ON template_drafts
    FOR SELECT
    USING (
        brand_id IN (
            SELECT brand_id 
            FROM brand_user_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert drafts for their brands
CREATE POLICY "Users can insert own brand drafts"
    ON template_drafts
    FOR INSERT
    WITH CHECK (
        brand_id IN (
            SELECT brand_id 
            FROM brand_user_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own brand's drafts
CREATE POLICY "Users can update own brand drafts"
    ON template_drafts
    FOR UPDATE
    USING (
        brand_id IN (
            SELECT brand_id 
            FROM brand_user_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own brand's drafts
CREATE POLICY "Users can delete own brand drafts"
    ON template_drafts
    FOR DELETE
    USING (
        brand_id IN (
            SELECT brand_id 
            FROM brand_user_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_template_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_drafts_updated_at
    BEFORE UPDATE ON template_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_template_drafts_updated_at();

-- Add comments
COMMENT ON TABLE template_drafts IS 'Auto-save drafts for template editor';
COMMENT ON COLUMN template_drafts.brand_id IS 'Brand that owns this draft';
COMMENT ON COLUMN template_drafts.template IS 'Template name (gotur, tripix, etc)';
COMMENT ON COLUMN template_drafts.pages IS 'Array of page modifications';
COMMENT ON COLUMN template_drafts.current_page IS 'Currently edited page path';
