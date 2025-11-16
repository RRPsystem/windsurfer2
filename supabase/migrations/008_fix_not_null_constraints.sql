-- Fix NOT NULL constraints for template_drafts and websites
-- Migration: 008_fix_not_null_constraints

-- Fix template_drafts - make id auto-generated
ALTER TABLE template_drafts 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Fix websites - make id auto-generated and name nullable or default
ALTER TABLE websites 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make name nullable (or add default)
ALTER TABLE websites 
ALTER COLUMN name DROP NOT NULL;

-- Add default for name if needed
ALTER TABLE websites 
ALTER COLUMN name SET DEFAULT 'Website';

-- Verify columns
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name IN ('template_drafts', 'websites')
AND column_name IN ('id', 'name')
ORDER BY table_name, column_name;
