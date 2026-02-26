-- Create contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (anyone can send a message)
CREATE POLICY "Allow public insert" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Allow admins to read (optional, adjustment might be needed based on admin role)
CREATE POLICY "Allow admins to read" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'service_role');
