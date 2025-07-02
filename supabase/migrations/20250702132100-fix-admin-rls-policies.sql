
-- Fix RLS policies to allow predefined admin and admin_users table access
DROP POLICY IF EXISTS "Allow admin access" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin insert" ON public.admin_users;

-- Create a better RLS policy for admin_users table
CREATE POLICY "Admin users access" ON public.admin_users
  FOR ALL USING (
    -- Allow the predefined admin email full access
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
    OR
    -- Allow existing admins to access
    user_id = auth.uid()
  );

-- Ensure the handle_new_user function correctly sets status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  is_predefined_admin BOOLEAN := FALSE;
BEGIN
  -- Check if this is the predefined admin email
  SELECT NEW.email = 'whiteshadow1136@gmail.com' INTO is_predefined_admin;
  
  -- If this is the predefined admin email, make them admin with active status
  IF is_predefined_admin THEN
    INSERT INTO public.profiles (id, email, full_name, user_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
      'active'::public.user_status
    );
    
    -- Make them admin
    INSERT INTO public.admin_users (user_id) 
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- All other users - pending approval by default
    INSERT INTO public.profiles (id, email, full_name, user_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
      'pending'::public.user_status
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Update the RLS functions to be security definer to avoid recursion
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
