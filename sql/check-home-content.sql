-- Check Home page content voor Golfvakantie Planner

SELECT 
  id,
  title,
  slug,
  status,
  LENGTH(content) as content_length,
  LEFT(content, 200) as content_preview
FROM pages
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
  AND slug = 'home';
