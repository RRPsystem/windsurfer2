-- Check if brand "golfvakantie-planner" exists and has pages

-- Step 1: Check if brand exists
SELECT 
  id,
  name,
  slug,
  created_at
FROM brands
WHERE slug = 'golfvakantie-planner';

-- Step 2: Check pages for this brand (if brand exists, replace BRAND_ID)
-- Replace 'BRAND_ID_HERE' with the actual ID from step 1
SELECT 
  id,
  title,
  slug,
  status,
  show_in_menu,
  menu_order,
  created_at
FROM pages
WHERE brand_id = 'BRAND_ID_HERE'
ORDER BY menu_order ASC, created_at ASC;

-- Step 3: Check specifically for "home" page
SELECT 
  id,
  title,
  slug,
  status
FROM pages
WHERE brand_id = 'BRAND_ID_HERE'
  AND slug = 'home';

-- Step 4: If no "home" page, check what pages DO exist
SELECT 
  slug,
  title,
  status,
  show_in_menu
FROM pages
WHERE brand_id = 'BRAND_ID_HERE'
  AND status = 'published'
ORDER BY 
  CASE WHEN slug = 'index' THEN 1
       WHEN slug = 'home' THEN 2
       WHEN show_in_menu = true THEN 3
       ELSE 4
  END,
  menu_order ASC;
