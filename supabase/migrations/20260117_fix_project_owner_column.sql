-- Migration: Fix project owner column naming (owner_id -> user_id)
-- 2026-01-17

-- 1. Rename the column
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'owner_id') THEN
        ALTER TABLE projects RENAME COLUMN owner_id TO user_id;
    END IF;
END $$;

-- 2. Update RLS policies for projects
-- Drop existing policies that might use auth.uid() = owner_id or user_id
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Re-create the standard policy using user_id
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

-- 3. Verify other relevant tables already use user_id (based on grep analysis)
-- feedbacks, files, subscriptions, etc. appear to already use user_id.

COMMENT ON COLUMN projects.user_id IS 'The ID of the user who owns the project';
