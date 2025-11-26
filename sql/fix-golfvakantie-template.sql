-- Fix template_category voor Golfvakantie Planner brand
-- Van "general" naar "gowild"

UPDATE pages
SET template_category = 'gowild'
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
  AND template_category = 'general';

-- Verify
SELECT 
  id,
  title,
  slug,
  template_category
FROM pages
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
ORDER BY menu_order ASC;
