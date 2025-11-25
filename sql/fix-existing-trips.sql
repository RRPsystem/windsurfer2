-- Fix existing trips from Travel Compositor imports

-- 1. Update brand_id for trips with wrong brand_id
UPDATE trips
SET brand_id = 'e9c1a630-2d8f-4594-9b4b-08e3e6e0d209'
WHERE brand_id = '0766a61a-8f37-4a83-bf28-e15084d764fb'
  AND slug IN ('34712012', 'rondreis-ponta-delgada-azores-furnas-sao-miguel-island', 'rondreis-kitzbuhel-istria-salzburg');

-- 2. Update source field for TC imported trips (recognizable by numeric slug or 'rondreis' title)
UPDATE trips
SET source = 'travel-compositor'
WHERE (
    slug ~ '^[0-9]+$'  -- Slug is purely numeric (IFD number)
    OR title LIKE 'Rondreis%'  -- Title starts with Rondreis
    OR title LIKE 'Land & Cruise%'
)
AND source IS NULL;

-- 3. Verify the updates
SELECT 
    id,
    title,
    slug,
    brand_id,
    source,
    created_at
FROM trips
ORDER BY created_at DESC
LIMIT 10;
