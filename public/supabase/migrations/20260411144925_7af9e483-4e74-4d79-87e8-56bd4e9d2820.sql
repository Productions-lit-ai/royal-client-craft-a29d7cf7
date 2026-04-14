-- Fix password_reset_logs: drop permissive INSERT and restrict to service_role
DROP POLICY IF EXISTS "Service role can insert reset logs" ON public.password_reset_logs;
CREATE POLICY "Service role can insert reset logs"
ON public.password_reset_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix contact_submissions: drop permissive INSERT and restrict to service_role
DROP POLICY IF EXISTS "Service role can insert submissions" ON public.contact_submissions;
CREATE POLICY "Service role can insert submissions"
ON public.contact_submissions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix user_roles: add explicit INSERT policy restricted to service_role only
CREATE POLICY "Only service role can insert roles"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);