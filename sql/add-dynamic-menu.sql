-- Add Dynamic Menu to GoWild Pages
-- This script:
-- 1. Adds brand_id meta tag to <head>
-- 2. Adds dynamic menu script to end of <body>
-- 3. Simplifies existing menu structure (removes sub-menus)

-- Step 1: Add brand_id meta tag to <head>
UPDATE pages
SET body_html = REPLACE(
    body_html,
    '<head>',
    E'<head>\n        <meta name="brand-id" content="0766a61a-8f37-4a83-bf28-e15084d764fb">'
)
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
  AND body_html NOT LIKE '%<meta name="brand-id"%';

-- Step 2: Add dynamic menu script before </body>
UPDATE pages
SET body_html = REPLACE(
    body_html,
    '</body>',
    E'    <!-- Dynamic Menu Widget -->\n    <script src="https://www.ai-websitestudio.nl/widgets/dynamic-menu.js"></script>\n</body>'
)
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
  AND body_html NOT LIKE '%dynamic-menu.js%';

-- Step 3: Simplify menu structure - Remove all sub-menus and complex structure
-- This creates a clean slate for the dynamic menu to fill

UPDATE pages
SET body_html = REGEXP_REPLACE(
    body_html,
    '<nav class="main-menu">.*?</nav>',
    E'<nav class="main-menu">\n                                <ul>\n                                    <!-- Menu items loaded dynamically -->\n                                </ul>\n                            </nav>',
    'gs'
)
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb';

-- Verify changes
SELECT 
  title,
  (body_html LIKE '%<meta name="brand-id"%') as has_brand_meta,
  (body_html LIKE '%dynamic-menu.js%') as has_dynamic_script,
  (body_html LIKE '%Menu items loaded dynamically%') as has_clean_menu,
  LENGTH(body_html) as html_size
FROM pages
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
ORDER BY menu_order;
