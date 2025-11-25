-- Check if pages have brand_id set
SELECT 
    id,
    title,
    slug,
    brand_id,
    CASE 
        WHEN brand_id IS NULL THEN '❌ MISSING'
        WHEN brand_id = '' THEN '❌ EMPTY'
        ELSE '✅ OK'
    END as brand_id_status
FROM pages
WHERE slug LIKE '%tour%' OR slug LIKE '%reis%' OR title LIKE '%Tour%' OR title LIKE '%Reis%'
ORDER BY updated_at DESC
LIMIT 10;

-- Fix: Update pages with missing brand_id
-- NOTE: Replace 'YOUR_BRAND_ID' with the actual brand_id from the URL
-- UPDATE pages 
-- SET brand_id = 'YOUR_BRAND_ID'
-- WHERE brand_id IS NULL OR brand_id = '';
