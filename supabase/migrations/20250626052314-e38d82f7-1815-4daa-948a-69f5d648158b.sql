
-- Create profiles table first
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view and update own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- Create enum for ingredient categories
CREATE TYPE public.ingredient_category AS ENUM (
  'Protein Sources',
  'Energy Sources', 
  'Minerals',
  'Additives',
  'Other'
);

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'suspended');

-- Create feed_ingredients table with all required columns
CREATE TABLE public.feed_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category ingredient_category DEFAULT 'Other',
  protein_percentage DECIMAL(5,2) DEFAULT 0,
  energy_kcal_per_kg INTEGER DEFAULT 0,
  fat_percentage DECIMAL(5,2) DEFAULT 0,
  fiber_percentage DECIMAL(5,2) DEFAULT 0,
  moisture_percentage DECIMAL(5,2) DEFAULT 0,
  ash_percentage DECIMAL(5,2) DEFAULT 0,
  calcium_percentage DECIMAL(5,2) DEFAULT 0,
  phosphorus_percentage DECIMAL(5,2) DEFAULT 0,
  cost_per_kg DECIMAL(8,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feed_ingredients
ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for feed_ingredients
CREATE POLICY "Users can view all ingredients" 
  ON public.feed_ingredients 
  FOR SELECT 
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can create their own ingredients" 
  ON public.feed_ingredients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients" 
  ON public.feed_ingredients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients" 
  ON public.feed_ingredients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add user_status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_status user_status DEFAULT 'pending';

-- Create admin_users table to manage admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users (only admins can see this table)
CREATE POLICY "Only admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  is_first_user BOOLEAN := FALSE;
BEGIN
  -- Check if this is the first user (make them admin)
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles LIMIT 1
  ) INTO is_first_user;
  
  -- If no users exist yet, make this user an admin with active status
  IF is_first_user THEN
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to approve users (admin only)
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;
  
  -- Update user status to active
  UPDATE public.profiles 
  SET user_status = 'active'::user_status, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to get pending users (admin only)
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can view pending users';
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.created_at
  FROM public.profiles p
  WHERE p.user_status = 'pending'::user_status
  ORDER BY p.created_at DESC;
END;
$$;
