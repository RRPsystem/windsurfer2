-- Check welke background/slider images nog relatieve paden hebben
SELECT 
  template_name,
  CASE 
    WHEN cached_html LIKE '%background-image: url("images/%' 
      OR cached_html LIKE '%background-image: url(''images/%'
      OR cached_html LIKE '%data-background="images/%'
      OR cached_html LIKE '%data-bg="images/%'
    THEN '❌ Heeft relatieve paden'
    ELSE '✅ Allemaal absoluut'
  END as image_status,
  -- Toon voorbeeld van eerste gevonden relatief pad
  CASE 
    WHEN cached_html LIKE '%background-image: url("images/%' THEN 
      substring(cached_html from 'background-image: url\("images/[^")]+')
    WHEN cached_html LIKE '%data-background="images/%' THEN 
      substring(cached_html from 'data-background="images/[^"]+')
    ELSE 'Geen gevonden'
  END as example_path
FROM website_page_templates
WHERE category = 'gowild'
ORDER BY template_name;
