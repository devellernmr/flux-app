-- Migration: Add agency_name column to projects table
-- This allows each project to have its own agency branding

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS agency_name TEXT DEFAULT NULL;

COMMENT ON COLUMN projects.agency_name IS 'Custom agency name to display in public client-facing views (White-Label feature)';
