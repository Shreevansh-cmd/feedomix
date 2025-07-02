
-- Fix the get_pending_users function to properly check admin status
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE(id uuid, email text, full_name text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is the predefined admin or in admin_users table
  IF NOT (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can view pending users';
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.created_at
  FROM public.profiles p
  WHERE p.user_status = 'pending'::user_status
  ORDER BY p.created_at DESC;
END;
$$;

-- Also fix the approve_user function
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is the predefined admin or in admin_users table
  IF NOT (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;
  
  -- Update user status to active
  UPDATE public.profiles 
  SET user_status = 'active'::user_status, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Fix the RLS policy on admin_users to prevent infinite recursion
DROP POLICY IF EXISTS "Admin users access" ON public.admin_users;

CREATE POLICY "Admin users access" ON public.admin_users
  FOR ALL USING (
    -- Allow the predefined admin email full access
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
    OR
    -- Allow users to see their own admin record
    user_id = auth.uid()
  );
