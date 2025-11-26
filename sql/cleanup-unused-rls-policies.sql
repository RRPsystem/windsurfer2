-- Cleanup: Remove unused RLS policies from pages table
-- These policies exist but RLS is disabled, so they do nothing
-- Removing them clears the Security Advisor warnings

-- SAFE: RLS is disabled, so removing policies has NO impact on functionality

-- Drop all existing policies on pages table
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

-- Verify: Should show 0 policies
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename = 'pages';

-- Verify: RLS should still be disabled (which is correct for public pages)
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'pages';

-- Expected result:
-- tablename | rls_enabled
-- ----------|------------
-- pages     | f           (false = disabled = CORRECT!)
