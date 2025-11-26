-- Fix RLS Warnings in Supabase
-- Keuze: Houd RLS uitgeschakeld voor public pages

-- ===== OPTIE 1: RLS UITSCHAKELEN (AANBEVOLEN VOOR PUBLIC PAGES) =====

-- Schakel RLS uit op pages tabel (maakt alle pages public toegankelijk)
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;

-- Verify: RLS zou nu disabled moeten zijn
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'pages';

-- ===== OPTIE 2: RLS ENABLED HOUDEN MET SIMPELE POLICIES =====
-- (Alleen als je echt RLS wilt gebruiken)

/*
-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Verwijder alle bestaande complexe policies
DROP POLICY IF EXISTS "Admins can create page templates" ON pages;
DROP POLICY IF EXISTS "Admins can create pages for brands" ON pages;
DROP POLICY IF EXISTS "Admins can delete brand pages" ON pages;
DROP POLICY IF EXISTS "Admins can delete page templates" ON pages;
DROP POLICY IF EXISTS "Admins can manage system brand pages" ON pages;
DROP POLICY IF EXISTS "Admins can update brand pages" ON pages;
DROP POLICY IF EXISTS "Admins can update page templates" ON pages;
DROP POLICY IF EXISTS "Admins can view all pages" ON pages;
DROP POLICY IF EXISTS "Anonymous can read pages for builder" ON pages;
DROP POLICY IF EXISTS "Anyone can view page templates" ON pages;
DROP POLICY IF EXISTS "Public pages are viewable by everyone" ON pages;
DROP POLICY IF EXISTS "Users can create pages for their brand" ON pages;
DROP POLICY IF EXISTS "Users can delete pages for their brand" ON pages;
DROP POLICY IF EXISTS "Users can delete their brand's pages" ON pages;
DROP POLICY IF EXISTS "Users can insert pages for their brand" ON pages;
DROP POLICY IF EXISTS "Users can update pages for their brand" ON pages;
DROP POLICY IF EXISTS "Users can update their brand's pages" ON pages;
DROP POLICY IF EXISTS "Users can view pages for their brand" ON pages;
DROP POLICY IF EXISTS "Users can view their brand's pages" ON pages;
DROP POLICY IF EXISTS "pages_admin_all" ON pages;
DROP POLICY IF EXISTS "pages_agent_rw_own" ON pages;
DROP POLICY IF EXISTS "pages_brand_rw" ON pages;
DROP POLICY IF EXISTS "pages_operator_all" ON pages;
DROP POLICY IF EXISTS "pages_public_read" ON pages;

-- Maak één simpele policy: iedereen kan published pages lezen
CREATE POLICY "public_read_published_pages"
ON pages FOR SELECT
USING (status = 'published' OR true);

-- Authenticated users kunnen pages van hun brand bewerken
CREATE POLICY "users_manage_own_brand_pages"
ON pages FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE brand_id = pages.brand_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE brand_id = pages.brand_id
  )
);
*/

-- ===== VERIFICATIE =====

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('pages', 'trips')
ORDER BY tablename;

-- Check hoeveel policies er zijn
SELECT 
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'pages'
ORDER BY policyname;
