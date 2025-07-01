
-- Drop and recreate everything to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the enum type (drop first if exists to avoid conflicts)
DROP TYPE IF EXISTS public.user_status CASCADE;
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'suspended');

-- Ensure the profiles table has the correct column type
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS user_status;

ALTER TABLE public.profiles 
ADD COLUMN user_status public.user_status DEFAULT 'pending'::public.user_status NOT NULL;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  is_first_user BOOLEAN := FALSE;
  is_predefined_admin BOOLEAN := FALSE;
BEGIN
  -- Check if this is the first user (make them admin)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles LIMIT 1
  ) INTO is_first_user;
  
  -- Check if this is the predefined admin email
  SELECT NEW.email = 'whiteshadow1136@gmail.com' INTO is_predefined_admin;
  
  -- If no users exist yet OR this is the predefined admin email, make them admin with active status
  IF is_first_user OR is_predefined_admin THEN
    INSERT INTO public.profiles (id, email, full_name, user_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
      'active'::public.user_status
    );
    
    -- Make them admin (handle case where admin_users table might not exist)
    INSERT INTO public.admin_users (user_id) 
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Regular user - pending approval
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
