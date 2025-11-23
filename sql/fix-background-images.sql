-- Fix background images in inline styles for GoWild templates
-- These are used in hero sections and other background elements

UPDATE website_page_templates
SET 
  cached_html = REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(cached_html,
            'background-image: url(''images/', 'background-image: url(''https://www.ai-websitestudio.nl/templates/Gowild/images/'
          ),
          'background-image: url("images/', 'background-image: url("https://www.ai-websitestudio.nl/templates/Gowild/images/'
        ),
        'background-image:url(''images/', 'background-image:url(''https://www.ai-websitestudio.nl/templates/Gowild/images/'
      ),
      'background-image:url("images/', 'background-image:url("https://www.ai-websitestudio.nl/templates/Gowild/images/'
    ),
    'background: url(''images/', 'background: url(''https://www.ai-websitestudio.nl/templates/Gowild/images/'
  ),
  updated_at = NOW()
WHERE category = 'gowild';

-- Also fix data-background attributes used by sliders
UPDATE website_page_templates
SET 
  cached_html = REPLACE(
    REPLACE(cached_html,
      'data-background="images/', 'data-background="https://www.ai-websitestudio.nl/templates/Gowild/images/'
    ),
    'data-bg="images/', 'data-bg="https://www.ai-websitestudio.nl/templates/Gowild/images/'
  ),
  updated_at = NOW()
WHERE category = 'gowild';

-- Update pages too
UPDATE pages
SET 
  body_html = (
    SELECT cached_html 
    FROM website_page_templates 
    WHERE category = 'gowild' 
      AND template_name = pages.title
    LIMIT 1
  ),
  updated_at = NOW()
WHERE template_category = 'gowild';

-- Verify the fixes
SELECT 
  template_name,
  (cached_html LIKE '%background-image: url("images/%' OR cached_html LIKE '%data-background="images/%') as has_relative_bg,
  (cached_html LIKE '%https://www.ai-websitestudio.nl/templates/Gowild/images/%') as has_absolute_urls
FROM website_page_templates
WHERE category = 'gowild'
ORDER BY template_name;
