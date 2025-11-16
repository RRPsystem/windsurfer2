-- Fix unique constraints for template_drafts and websites
-- Migration: 006_fix_unique_constraints

-- Fix template_drafts table
ALTER TABLE template_drafts 
DROP CONSTRAINT IF EXISTS template_drafts_brand_id_template_key;

-- Add proper unique constraint
ALTER TABLE template_drafts 
ADD CONSTRAINT template_drafts_brand_id_template_key 
UNIQUE (brand_id, template);

-- Fix websites table - add template column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'websites' 
        AND column_name = 'template'
    ) THEN
        ALTER TABLE websites ADD COLUMN template TEXT;
    END IF;
END $$;

-- Add unique constraint for websites
ALTER TABLE websites 
DROP CONSTRAINT IF EXISTS websites_brand_id_template_key;

ALTER TABLE websites 
ADD CONSTRAINT websites_brand_id_template_key 
UNIQUE (brand_id, template);

-- Add comment
COMMENT ON TABLE template_drafts IS 'Template drafts with proper unique constraints';
COMMENT ON TABLE websites IS 'Published websites with template column';
