
-- First, let's create the ingredient_category enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ingredient_category') THEN
        CREATE TYPE ingredient_category AS ENUM ('Energy Sources', 'Protein Sources', 'Minerals', 'Additives', 'Other');
    END IF;
END $$;

-- Check if category column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feed_ingredients' AND column_name = 'category'
    ) THEN
        ALTER TABLE feed_ingredients ADD COLUMN category ingredient_category DEFAULT 'Other'::ingredient_category;
    END IF;
END $$;

-- Ensure RLS is enabled on feed_ingredients
ALTER TABLE feed_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    -- Policy for selecting ingredients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feed_ingredients' AND policyname = 'Users can view their ingredients'
    ) THEN
        CREATE POLICY "Users can view their ingredients" ON feed_ingredients
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    -- Policy for inserting ingredients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feed_ingredients' AND policyname = 'Users can create their ingredients'
    ) THEN
        CREATE POLICY "Users can create their ingredients" ON feed_ingredients
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    -- Policy for updating ingredients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feed_ingredients' AND policyname = 'Users can update their ingredients'
    ) THEN
        CREATE POLICY "Users can update their ingredients" ON feed_ingredients
            FOR UPDATE USING (user_id = auth.uid());
    END IF;

    -- Policy for deleting ingredients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feed_ingredients' AND policyname = 'Users can delete their ingredients'
    ) THEN
        CREATE POLICY "Users can delete their ingredients" ON feed_ingredients
            FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Clean up any existing default ingredients so they can be re-inserted with correct categories
DELETE FROM feed_ingredients WHERE is_default = true;
