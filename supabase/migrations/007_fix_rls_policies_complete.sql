-- Complete RLS fix for template_drafts and websites tables
-- Migration: 007_fix_rls_policies_complete

-- ============================================
-- FIX TEMPLATE_DRAFTS TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON template_drafts;
DROP POLICY IF EXISTS "Enable all for service role" ON template_drafts;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON template_drafts;
DROP POLICY IF EXISTS "Allow service role full access" ON template_drafts;

-- Disable RLS temporarily
ALTER TABLE template_drafts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE template_drafts ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policies
CREATE POLICY "Allow all authenticated operations on template_drafts"
ON template_drafts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all anon operations on template_drafts"
ON template_drafts
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- FIX WEBSITES TABLE
-- ============================================

-- Add template column if missing
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON websites;
DROP POLICY IF EXISTS "Enable all for service role" ON websites;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON websites;
DROP POLICY IF EXISTS "Allow service role full access" ON websites;

-- Disable RLS temporarily
ALTER TABLE websites DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policies
CREATE POLICY "Allow all authenticated operations on websites"
ON websites
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all anon operations on websites"
ON websites
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- FIX BRANDS TABLE
-- ============================================

-- Make sure brands table allows reads
DROP POLICY IF EXISTS "Allow read access to brands" ON brands;

CREATE POLICY "Allow all authenticated read on brands"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all anon read on brands"
ON brands
FOR SELECT
TO anon
USING (true);

-- ============================================
-- ADD UNIQUE CONSTRAINTS
-- ============================================

-- Add unique constraint for template_drafts
ALTER TABLE template_drafts 
DROP CONSTRAINT IF EXISTS template_drafts_brand_id_template_key;

ALTER TABLE template_drafts 
ADD CONSTRAINT template_drafts_brand_id_template_key 
UNIQUE (brand_id, template);

-- Add unique constraint for websites
ALTER TABLE websites 
DROP CONSTRAINT IF EXISTS websites_brand_id_template_key;

ALTER TABLE websites 
ADD CONSTRAINT websites_brand_id_template_key 
UNIQUE (brand_id, template);

-- ============================================
-- VERIFY
-- ============================================

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('template_drafts', 'websites', 'brands')
ORDER BY tablename, policyname;
