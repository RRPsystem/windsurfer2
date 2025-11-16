-- Fix RLS for template_drafts table
-- Migration: 005_fix_template_drafts_rls

-- Enable RLS on template_drafts
ALTER TABLE template_drafts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own brand drafts" ON template_drafts;
DROP POLICY IF EXISTS "Users can insert own brand drafts" ON template_drafts;
DROP POLICY IF EXISTS "Users can update own brand drafts" ON template_drafts;
DROP POLICY IF EXISTS "Users can delete own brand drafts" ON template_drafts;

-- Create new policies with service role bypass
CREATE POLICY "Enable all access for service role"
    ON template_drafts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users"
    ON template_drafts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE template_drafts IS 'Template drafts with RLS enabled - accessible by authenticated users and service role';
