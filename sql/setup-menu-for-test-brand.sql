-- Setup Menu Items voor TEST brand
-- Brand ID: e9c1a630-2d8f-4594-9b4b-08e3e6e0d209

-- 1. Zet show_in_menu = true voor relevante pagina's
UPDATE pages
SET show_in_menu = true
WHERE brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209'
  AND slug IN ('home', 'about', 'tour-grid', 'contact', 'tours', 'destinations-1');

-- 2. Zet menu order (bepaalt volgorde in menu)
UPDATE pages SET menu_order = 1 WHERE slug LIKE '%home%' AND brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209';
UPDATE pages SET menu_order = 2 WHERE slug LIKE '%about%' AND brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209';
UPDATE pages SET menu_order = 3 WHERE slug LIKE '%tour%' AND brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209';
UPDATE pages SET menu_order = 4 WHERE slug LIKE '%destination%' AND brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209';
UPDATE pages SET menu_order = 5 WHERE slug LIKE '%contact%' AND brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209';

-- 3. Zorg dat pagina's published zijn
UPDATE pages
SET status = 'published'
WHERE brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209'
  AND show_in_menu = true;

-- 4. Verify setup
SELECT 
  id,
  title,
  slug,
  menu_order,
  show_in_menu,
  status
FROM pages
WHERE brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209'
ORDER BY menu_order ASC NULLS LAST;
