
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const defaultIngredients = [
  { name: 'Maize', protein_percentage: 8.5, energy_kcal_per_kg: 3350, fat_percentage: 3.8, fiber_percentage: 2.2, moisture_percentage: 14.0, ash_percentage: 1.3 },
  { name: 'Soya DOC', protein_percentage: 44.0, energy_kcal_per_kg: 2230, fat_percentage: 0.8, fiber_percentage: 7.0, moisture_percentage: 12.0, ash_percentage: 6.5 },
  { name: 'Rice Bran', protein_percentage: 12.5, energy_kcal_per_kg: 2650, fat_percentage: 15.0, fiber_percentage: 12.0, moisture_percentage: 12.0, ash_percentage: 12.0 },
  { name: 'Vegetable Oil', protein_percentage: 0.0, energy_kcal_per_kg: 8800, fat_percentage: 99.0, fiber_percentage: 0.0, moisture_percentage: 0.2, ash_percentage: 0.0 },
  { name: 'DCP', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 8.0, ash_percentage: 95.0 },
  { name: 'Limestone Powder', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 2.0, ash_percentage: 98.0 },
  { name: 'Salt', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 2.0, ash_percentage: 98.0 },
  { name: 'Broiler Premix', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 10.0, ash_percentage: 80.0 },
  { name: 'Layer Premix', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 10.0, ash_percentage: 80.0 },
  { name: 'Toxin Binder', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 12.0, ash_percentage: 85.0 },
  { name: 'Coccidiostat', protein_percentage: 0.0, energy_kcal_per_kg: 0, fat_percentage: 0.0, fiber_percentage: 0.0, moisture_percentage: 5.0, ash_percentage: 90.0 },
];

export const useDefaultIngredients = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeDefaultIngredients = async () => {
      if (!user) return;

      try {
        // Check if default ingredients already exist
        const { data: existingDefaults } = await supabase
          .from('feed_ingredients')
          .select('id')
          .eq('is_default', true)
          .limit(1);

        if (existingDefaults && existingDefaults.length > 0) {
          return; // Default ingredients already exist
        }

        // Insert default ingredients with current user's ID
        const ingredientsToInsert = defaultIngredients.map(ingredient => ({
          ...ingredient,
          user_id: user.id,
          is_default: true,
        }));

        const { error } = await supabase
          .from('feed_ingredients')
          .insert(ingredientsToInsert);

        if (error) {
          console.error('Error inserting default ingredients:', error);
        }
      } catch (error) {
        console.error('Error initializing default ingredients:', error);
      }
    };

    initializeDefaultIngredients();
  }, [user]);
};
