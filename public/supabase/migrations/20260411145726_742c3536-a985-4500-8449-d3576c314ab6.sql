-- 1. Add explicit restrictive UPDATE policy on user_roles (admin-only)
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Restrict story_likes SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view likes" ON public.story_likes;
CREATE POLICY "Authenticated users can view likes"
ON public.story_likes
FOR SELECT
TO authenticated
USING (true);