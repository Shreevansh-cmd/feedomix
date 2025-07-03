-- First, remove all existing duplicated default ingredients
DELETE FROM public.feed_ingredients WHERE is_default = true;

-- Create a system user for default ingredients
-- We'll use a special UUID for system-owned ingredients
DO $$ 
DECLARE
    system_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Insert global default ingredients with system user ID
    INSERT INTO public.feed_ingredients (
        name, category, protein_percentage, energy_kcal_per_kg, fat_percentage, 
        fiber_percentage, moisture_percentage, ash_percentage, calcium_percentage, 
        phosphorus_percentage, cost_per_kg, is_default, user_id
    ) VALUES 
    -- Energy Sources
    ('Maize (Corn)', 'Energy Sources', 8.5, 3350, 3.8, 2.2, 14.0, 1.3, 0.02, 0.28, 0, true, system_user_id),
    ('Wheat', 'Energy Sources', 11.5, 3200, 1.8, 2.8, 13.0, 1.8, 0.05, 0.35, 0, true, system_user_id),
    ('Rice Bran', 'Energy Sources', 12.5, 2650, 15.0, 12.0, 12.0, 12.0, 0.12, 1.6, 0, true, system_user_id),
    ('Vegetable Oil', 'Energy Sources', 0.0, 8800, 99.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0, true, system_user_id),
    ('Barley', 'Energy Sources', 10.5, 2900, 1.8, 5.5, 12.0, 2.8, 0.06, 0.34, 0, true, system_user_id),
    ('Sorghum', 'Energy Sources', 9.2, 3200, 2.8, 2.5, 13.0, 1.6, 0.03, 0.28, 0, true, system_user_id),
    ('Millet', 'Energy Sources', 11.0, 3100, 4.2, 8.5, 12.0, 3.3, 0.13, 0.28, 0, true, system_user_id),
    ('Oats', 'Energy Sources', 10.6, 2800, 4.6, 10.6, 13.0, 3.0, 0.08, 0.31, 0, true, system_user_id),
    ('Broken Rice', 'Energy Sources', 7.5, 3300, 0.5, 0.4, 13.0, 0.6, 0.01, 0.11, 0, true, system_user_id),
    ('Cassava Meal', 'Energy Sources', 2.0, 3100, 0.3, 2.0, 12.0, 2.2, 0.16, 0.06, 0, true, system_user_id),
    
    -- Protein Sources
    ('Soybean Meal (44% CP)', 'Protein Sources', 44.0, 2230, 0.8, 7.0, 12.0, 6.5, 0.27, 0.65, 0, true, system_user_id),
    ('Soybean Meal (48% CP)', 'Protein Sources', 48.0, 2200, 0.5, 3.9, 12.0, 6.2, 0.29, 0.71, 0, true, system_user_id),
    ('Fish Meal (65% CP)', 'Protein Sources', 65.0, 2800, 8.5, 1.0, 10.0, 15.0, 3.8, 2.4, 0, true, system_user_id),
    ('Fish Meal (60% CP)', 'Protein Sources', 60.0, 2650, 9.0, 1.2, 10.0, 16.0, 4.0, 2.2, 0, true, system_user_id),
    ('Groundnut Cake', 'Protein Sources', 45.0, 2400, 8.0, 12.0, 10.0, 5.5, 0.15, 0.58, 0, true, system_user_id),
    ('Sunflower Seed Meal', 'Protein Sources', 38.0, 2100, 1.5, 22.0, 12.0, 7.2, 0.35, 1.1, 0, true, system_user_id),
    ('Meat and Bone Meal', 'Protein Sources', 50.0, 2200, 10.0, 2.5, 8.0, 28.0, 8.5, 4.2, 0, true, system_user_id),
    ('Canola Meal', 'Protein Sources', 36.0, 2000, 3.5, 12.0, 12.0, 7.5, 0.65, 1.0, 0, true, system_user_id),
    ('Cotton Seed Meal', 'Protein Sources', 41.0, 2100, 1.5, 13.0, 12.0, 6.8, 0.17, 1.2, 0, true, system_user_id),
    ('Blood Meal', 'Protein Sources', 80.0, 2600, 1.0, 1.0, 8.0, 4.5, 0.35, 0.25, 0, true, system_user_id),
    
    -- Minerals
    ('Limestone Powder', 'Minerals', 0.0, 0, 0.0, 0.0, 2.0, 98.0, 38.0, 0.02, 0, true, system_user_id),
    ('Dicalcium Phosphate (DCP)', 'Minerals', 0.0, 0, 0.0, 0.0, 8.0, 95.0, 18.0, 21.0, 0, true, system_user_id),
    ('Salt (Sodium Chloride)', 'Minerals', 0.0, 0, 0.0, 0.0, 2.0, 98.0, 0.0, 0.0, 0, true, system_user_id),
    ('Oyster Shell', 'Minerals', 0.0, 0, 0.0, 0.0, 1.5, 96.0, 36.0, 0.01, 0, true, system_user_id),
    ('Bone Meal', 'Minerals', 4.0, 500, 2.0, 0.0, 6.0, 85.0, 24.0, 12.0, 0, true, system_user_id),
    
    -- Additives
    ('Broiler Vitamin Premix', 'Additives', 0.0, 0, 0.0, 0.0, 10.0, 80.0, 0.0, 0.0, 0, true, system_user_id),
    ('Layer Vitamin Premix', 'Additives', 0.0, 0, 0.0, 0.0, 10.0, 80.0, 0.0, 0.0, 0, true, system_user_id),
    ('Lysine HCL', 'Additives', 78.0, 0, 0.0, 0.0, 1.0, 20.0, 0.0, 0.0, 0, true, system_user_id),
    ('DL-Methionine', 'Additives', 59.0, 0, 0.0, 0.0, 0.3, 0.1, 0.0, 0.0, 0, true, system_user_id);
    
END $$;

-- Update RLS policy to allow all users to view default ingredients (but not modify them)
DROP POLICY IF EXISTS "Users can view all ingredients" ON public.feed_ingredients;

CREATE POLICY "Users can view all ingredients including defaults" ON public.feed_ingredients
  FOR SELECT USING (
    is_default = true OR user_id = auth.uid()
  );