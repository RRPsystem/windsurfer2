-- Setup Menu Items voor BOLT Websites
-- Run dit na het importeren van template pagina's

-- 1. Zet show_in_menu = true voor relevante pagina's
UPDATE pages
SET show_in_menu = true
WHERE brand_id = 'YOUR_BRAND_ID'
  AND slug IN ('home', 'about', 'tour-grid', 'contact', 'tours', 'destinations-1');

-- 2. Zet menu order (bepaalt volgorde in menu)
UPDATE pages SET menu_order = 1 WHERE slug = 'home' AND brand_id = 'YOUR_BRAND_ID';
UPDATE pages SET menu_order = 2 WHERE slug = 'about' AND brand_id = 'YOUR_BRAND_ID';
UPDATE pages SET menu_order = 3 WHERE slug = 'tour-grid' AND brand_id = 'YOUR_BRAND_ID';
UPDATE pages SET menu_order = 4 WHERE slug = 'destinations-1' AND brand_id = 'YOUR_BRAND_ID';
UPDATE pages SET menu_order = 5 WHERE slug = 'contact' AND brand_id = 'YOUR_BRAND_ID';

-- 3. Zorg dat pagina's published zijn
UPDATE pages
SET status = 'published'
WHERE brand_id = 'YOUR_BRAND_ID'
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
WHERE brand_id = 'YOUR_BRAND_ID'
  AND show_in_menu = true
ORDER BY menu_order ASC;

-- ===== AUTOMATISCH SETUP (ALTERNATIEF) =====
-- Als je automatisch de eerste 5 pagina's in het menu wilt:

-- Zet show_in_menu = false voor alle pagina's
UPDATE pages
SET show_in_menu = false
WHERE brand_id = 'YOUR_BRAND_ID';

-- Selecteer de belangrijkste pagina's automatisch
WITH ranked_pages AS (
  SELECT 
    id,
    slug,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE 
          WHEN slug LIKE '%home%' OR slug LIKE '%index%' THEN 1
          WHEN slug LIKE '%about%' THEN 2
          WHEN slug LIKE '%tour%' THEN 3
          WHEN slug LIKE '%destination%' THEN 4
          WHEN slug LIKE '%contact%' THEN 5
          ELSE 10
        END,
        created_at ASC
    ) as menu_rank
  FROM pages
  WHERE brand_id = 'YOUR_BRAND_ID'
    AND status = 'published'
)
UPDATE pages
SET 
  show_in_menu = true,
  menu_order = ranked_pages.menu_rank
FROM ranked_pages
WHERE pages.id = ranked_pages.id
  AND ranked_pages.menu_rank <= 5;

-- Verify
SELECT 
  title,
  slug,
  menu_order,
  show_in_menu
FROM pages
WHERE brand_id = 'YOUR_BRAND_ID'
  AND show_in_menu = true
ORDER BY menu_order ASC;
