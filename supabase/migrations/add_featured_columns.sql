-- Migration: Add featured and priority columns for trip management
-- Purpose: Enable featured trips functionality per brand
-- Date: 2025-01-11

-- =====================================================
-- 1. Add columns to trip_brand_assignments table
-- =====================================================

-- Add is_featured column (per brand featured status)
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add priority column (lower number = higher priority)
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- Add comment for documentation
COMMENT ON COLUMN trip_brand_assignments.is_featured IS 
'Indicates if this trip is featured for this specific brand. Featured trips appear at the top of listings with special styling.';

COMMENT ON COLUMN trip_brand_assignments.priority IS 
'Display priority for this trip (1 = highest priority, 999 = default). Lower numbers appear first in listings.';

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================

-- Index for featured trips queries
CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_featured 
ON trip_brand_assignments(is_featured) 
WHERE is_featured = true;

-- Index for priority sorting
CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_priority 
ON trip_brand_assignments(priority);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_published_featured 
ON trip_brand_assignments(brand_id, is_published, is_featured, priority) 
WHERE is_published = true;

-- =====================================================
-- 3. Add columns to trips table (fallback/default)
-- =====================================================

-- Add featured column to trips table (global featured status)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Add priority column to trips table (global priority)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- Add comments
COMMENT ON COLUMN trips.featured IS 
'Global featured status for this trip. Can be overridden by trip_brand_assignments.is_featured.';

COMMENT ON COLUMN trips.priority IS 
'Global priority for this trip. Can be overridden by trip_brand_assignments.priority.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trips_featured 
ON trips(featured) 
WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_trips_priority 
ON trips(priority);

-- =====================================================
-- 4. Update existing data (optional)
-- =====================================================

-- Set priority based on created_at (newer trips get slightly higher priority)
-- This is optional and can be commented out if not desired
UPDATE trip_brand_assignments 
SET priority = CASE 
  WHEN is_featured = true THEN 1
  ELSE 999
END
WHERE priority = 999;

-- =====================================================
-- 5. Create helper function for toggling featured status
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_trip_featured(
  p_assignment_id UUID,
  p_is_featured BOOLEAN
)
RETURNS trip_brand_assignments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result trip_brand_assignments;
BEGIN
  -- Update the assignment
  UPDATE trip_brand_assignments
  SET 
    is_featured = p_is_featured,
    priority = CASE 
      WHEN p_is_featured THEN 1 
      ELSE 999 
    END,
    updated_at = NOW()
  WHERE id = p_assignment_id
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION toggle_trip_featured IS 
'Helper function to toggle featured status and automatically set priority. When featured=true, priority is set to 1. When featured=false, priority is set to 999.';

-- =====================================================
-- 6. Verification queries
-- =====================================================

-- Verify columns exist
DO $$
BEGIN
  -- Check trip_brand_assignments columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trip_brand_assignments' 
    AND column_name = 'is_featured'
  ) THEN
    RAISE EXCEPTION 'Column is_featured not found in trip_brand_assignments';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trip_brand_assignments' 
    AND column_name = 'priority'
  ) THEN
    RAISE EXCEPTION 'Column priority not found in trip_brand_assignments';
  END IF;
  
  -- Check trips columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'featured'
  ) THEN
    RAISE EXCEPTION 'Column featured not found in trips';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'priority'
  ) THEN
    RAISE EXCEPTION 'Column priority not found in trips';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully! All columns and indexes created.';
END $$;

-- =====================================================
-- 7. Example usage
-- =====================================================

-- Example: Make a trip featured
-- UPDATE trip_brand_assignments 
-- SET is_featured = true, priority = 1 
-- WHERE id = 'your-assignment-id';

-- Example: Using the helper function
-- SELECT toggle_trip_featured('your-assignment-id', true);

-- Example: Query featured trips for a brand
-- SELECT t.*, tba.is_featured, tba.priority
-- FROM trip_brand_assignments tba
-- JOIN trips t ON t.id = tba.trip_id
-- WHERE tba.brand_id = 'your-brand-id'
--   AND tba.is_published = true
--   AND tba.is_featured = true
-- ORDER BY tba.priority ASC;
