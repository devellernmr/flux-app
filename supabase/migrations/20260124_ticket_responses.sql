-- Migration for Ticket Responses
-- 1. Add admin response columns
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- 2. Ensure users can see their own tickets including the admin response
-- (The existing "Users and admins can view tickets" policy already covers SELECT)

-- 3. Trigger or logic for responded_at
CREATE OR REPLACE FUNCTION public.handle_ticket_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.admin_response IS NOT NULL AND (OLD.admin_response IS NULL OR NEW.admin_response <> OLD.admin_response) THEN
        NEW.responded_at = now();
        NEW.status = 'in_progress'; -- Auto set to in_progress when responded if not resolved
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_responded_at ON public.support_tickets;
CREATE TRIGGER set_ticket_responded_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.handle_ticket_responded_at();
