-- Check when "Land% cruise" was saved (last working trip)
SELECT 
    id,
    title,
    slug,
    created_at,
    updated_at,
    source,
    tc_idea_id
FROM trips 
WHERE title ILIKE '%land%cruise%' 
   OR title ILIKE '%cruise%'
ORDER BY created_at DESC
LIMIT 10;

-- Also check all recent trips to see timeline
SELECT 
    id,
    title,
    slug,
    created_at,
    updated_at,
    source
FROM trips 
ORDER BY created_at DESC
LIMIT 20;
