
-- Function to promote whiteshadow1136@gmail.com to admin if they already exist
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if whiteshadow1136@gmail.com exists in profiles
  SELECT id INTO admin_user_id 
  FROM public.profiles 
  WHERE email = 'whiteshadow1136@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Update their status to active
    UPDATE public.profiles 
    SET user_status = 'active'::user_status, updated_at = now()
    WHERE id = admin_user_id;
    
    -- Make them admin if not already
    INSERT INTO public.admin_users (user_id) 
    VALUES (admin_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
