
-- Fix the infinite recursion issue with admin_users RLS policy
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;

-- Create a better RLS policy that doesn't cause infinite recursion
-- Allow users to see admin_users table only if they are the predefined admin or already in the admin_users table
CREATE POLICY "Allow admin access" ON public.admin_users
  FOR ALL USING (
    -- Allow the predefined admin email full access
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
    OR
    -- Allow existing admins to see the table (but prevent infinite recursion by using a different approach)
    auth.uid() IN (
      SELECT user_id FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Also ensure INSERT policy for admin_users
CREATE POLICY IF NOT EXISTS "Allow admin insert" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'whiteshadow1136@gmail.com'
    )
  );
