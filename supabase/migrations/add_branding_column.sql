-- Migration: Add branding column to projects table
-- This column will store the Brand Kit data (colors and fonts) as JSON

-- Add the branding column to the projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT NULL;

-- Optional: Add a comment describing the column
COMMENT ON COLUMN projects.branding IS 'Stores brand kit information including colors and fonts as JSON';

-- Example structure for the branding JSONB:
-- {
--   "colors": ["#3b82f6", "#10b981", "#f59e0b"],
--   "fonts": [
--     {"name": "Inter", "weight": "Bold"},
--     {"name": "Roboto", "weight": "Regular"}
--   ]
-- }
