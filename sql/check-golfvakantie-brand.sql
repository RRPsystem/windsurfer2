-- STAP 1: Check of brand "golfvakantie-planner" bestaat
-- Run deze query EERST

SELECT 
  id,
  name,
  slug,
  created_at
FROM brands
WHERE slug = 'golfvakantie-planner';

-- Als deze query een result geeft:
-- - Kopieer de "id" waarde (dit is een UUID)
-- - Gebruik die UUID in de volgende query hieronder
-- 
-- Als deze query GEEN result geeft:
-- - Brand bestaat niet in database
-- - Maak brand eerst aan in BOLT of database
