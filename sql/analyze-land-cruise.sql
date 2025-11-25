-- Analyze the "Land cruise" trip that DID work
-- To understand how price and duration were saved

SELECT 
    id,
    brand_id,
    title,
    slug,
    price,
    duration_days,
    description,
    featured_image,
    source,
    tc_idea_id,
    status,
    created_at,
    updated_at,
    -- Show content structure
    jsonb_typeof(content) as content_type,
    jsonb_pretty(content) as content_pretty
FROM trips 
WHERE title ILIKE '%land%cruise%' 
   OR title ILIKE '%cruise%'
ORDER BY created_at DESC
LIMIT 3;

-- Also check recent trips to compare
SELECT 
    id,
    title,
    price,
    duration_days,
    source,
    tc_idea_id,
    created_at
FROM trips 
ORDER BY created_at DESC
LIMIT 10;
