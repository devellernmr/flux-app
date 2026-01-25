-- Migration to support Admin features
-- 1. Add is_admin to profiles
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Update support_tickets policies to allow admins to see everything
-- First, drop existing visibility policy if it exists to replace it
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;

CREATE POLICY "Users and admins can view tickets" ON public.support_tickets
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 3. Allow admins to update status/messages
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );
