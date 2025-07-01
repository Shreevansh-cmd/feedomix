
-- First, let's check if the user_status enum exists and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');
    END IF;
END $$;

-- Ensure the profiles table has the user_status column with the correct type
DO $$
BEGIN
    -- Check if the column exists and has the wrong type, then fix it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_status'
    ) THEN
        -- Update the column to use the correct enum type
        ALTER TABLE public.profiles ALTER COLUMN user_status TYPE user_status USING user_status::user_status;
    ELSE
        -- Add the column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN user_status user_status DEFAULT 'pending'::user_status;
    END IF;
END $$;

-- Recreate the handle_new_user function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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
      'active'::user_status
    );
    
    -- Make them admin
    INSERT INTO public.admin_users (user_id) VALUES (NEW.id);
  ELSE
    -- Regular user - pending approval
    INSERT INTO public.profiles (id, email, full_name, user_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
      'pending'::user_status
    );
  END IF;
  
  RETURN NEW;
END;
$$;
