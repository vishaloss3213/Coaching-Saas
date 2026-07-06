-- Fix circular RLS recursion on profiles table
-- The profiles_select policy was calling current_center_id(), which queries
-- profiles, triggering RLS again → infinite recursion.

-- 1. Make the helper function SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION public.current_center_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT center_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Fix profiles_select to allow users to see their own profile directly,
--    breaking the circular dependency
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
USING (id = auth.uid() OR center_id = public.current_center_id());
