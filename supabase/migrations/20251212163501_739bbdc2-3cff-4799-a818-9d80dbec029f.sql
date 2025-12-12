-- Fix profiles table RLS policies
-- Convert RESTRICTIVE policies to PERMISSIVE for proper defense-in-depth

-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Deny profile deletions" ON public.profiles;

-- Create PERMISSIVE policies (default behavior)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Keep DELETE as RESTRICTIVE to prevent any deletions
CREATE POLICY "Deny profile deletions"
ON public.profiles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (false);