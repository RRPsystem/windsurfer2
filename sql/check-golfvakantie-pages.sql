-- STAP 2: Check pages voor "golfvakantie-planner" brand
-- BELANGRIJK: Vervang 'YOUR_BRAND_ID' hieronder met de echte UUID uit stap 1!

-- Alle pages voor deze brand
SELECT 
  id,
  title,
  slug,
  status,
  show_in_menu,
  menu_order,
  created_at
FROM pages
WHERE brand_id = 'YOUR_BRAND_ID'  -- <-- VERVANG DIT!
ORDER BY menu_order ASC, created_at ASC;

-- Check specifiek voor "home" pagina
SELECT 
  id,
  title,
  slug,
  status
FROM pages
WHERE brand_id = 'YOUR_BRAND_ID'  -- <-- VERVANG DIT!
  AND slug = 'home';

-- Als geen "home" pagina: kijk welke pagina's er WEL zijn
SELECT 
  slug,
  title,
  status,
  show_in_menu
FROM pages
WHERE brand_id = 'YOUR_BRAND_ID'  -- <-- VERVANG DIT!
  AND status = 'published'
ORDER BY menu_order ASC;
