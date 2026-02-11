
-- Create password reset logs table for admin visibility
CREATE TABLE public.password_reset_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  ip_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view reset logs
CREATE POLICY "Admins can view reset logs"
ON public.password_reset_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Edge function (service role) can insert logs
CREATE POLICY "Service role can insert reset logs"
ON public.password_reset_logs
FOR INSERT
WITH CHECK (true);

-- Create index for rate limiting queries
CREATE INDEX idx_reset_logs_email_created ON public.password_reset_logs (email, created_at);
