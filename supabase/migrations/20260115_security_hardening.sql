-- Security Hardening Migration (2026-01-15)

-- 1. Enable Row Level Security (RLS) on all relevant tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 2. Define Row Level Security Policies
-- (Adjust these based on your specific application logic if needed)

-- Projects: Users can only see/edit their own projects
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can manage their own projects') THEN
        CREATE POLICY "Users can manage their own projects" ON public.projects
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Profiles: Users can see all profiles but only edit their own
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone') THEN
        CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
        FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Feedbacks: Users can only see/edit their own feedbacks
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedbacks' AND policyname = 'Users can manage their own feedbacks') THEN
        CREATE POLICY "Users can manage their own feedbacks" ON public.feedbacks
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Subscriptions: Users can only see their own subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
        CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Files: Users can only manage their own files
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'Users can manage their own files') THEN
        CREATE POLICY "Users can manage their own files" ON public.files
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Secure the team_members_with_email View
-- This prevents the view from bypassing RLS when accessing auth.users
-- Note: Requires PostgreSQL 15+ for SECURITY INVOKER on views.
-- If you are on an older version, you may need to recreate the view without SECURITY DEFINER.
ALTER VIEW IF EXISTS public.team_members_with_email SET (security_invoker = true);

-- 4. Fix Function Search Paths
-- This prevents search path hijacking exploits
ALTER FUNCTION IF EXISTS public.check_project_limit() SET search_path = public;
ALTER FUNCTION IF EXISTS public.handle_new_user_subscription() SET search_path = public;
