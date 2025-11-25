-- Create trip_brand_assignments for imported Travel Compositor trips
-- This makes them visible on the website

-- First, check which trips don't have assignments yet
SELECT 
    t.id,
    t.title,
    t.slug,
    t.brand_id,
    t.source,
    CASE 
        WHEN tba.trip_id IS NULL THEN 'Missing assignment'
        ELSE 'Has assignment'
    END as assignment_status
FROM trips t
LEFT JOIN trip_brand_assignments tba ON t.id = tba.trip_id AND t.brand_id = tba.brand_id
WHERE t.source = 'travel-compositor'
ORDER BY t.created_at DESC;

-- Create assignments for trips without them
-- NOTE: Replace 'YOUR_BRAND_ID' with actual brand_id from URL
INSERT INTO trip_brand_assignments (
    trip_id,
    brand_id,
    is_published,
    priority,
    featured
)
SELECT 
    t.id as trip_id,
    t.brand_id,
    true as is_published,  -- Make visible on website
    999 as priority,       -- Low priority (high numbers = low priority)
    false as featured      -- Not featured by default
FROM trips t
LEFT JOIN trip_brand_assignments tba ON t.id = tba.trip_id AND t.brand_id = tba.brand_id
WHERE t.source = 'travel-compositor'
  AND tba.trip_id IS NULL  -- Only insert if assignment doesn't exist yet
  AND t.brand_id IS NOT NULL;

-- Verify the assignments were created
SELECT 
    t.title,
    t.slug,
    tba.is_published,
    tba.priority,
    tba.featured,
    tba.created_at
FROM trips t
JOIN trip_brand_assignments tba ON t.id = tba.trip_id
WHERE t.source = 'travel-compositor'
ORDER BY tba.created_at DESC;
