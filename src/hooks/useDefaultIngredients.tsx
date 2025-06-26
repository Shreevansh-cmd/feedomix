
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type IngredientCategory = Database['public']['Enums']['ingredient_category'];

const defaultIngredients: Array<{
  name: string;
  category: IngredientCategory;
  protein_percentage: number;
  energy_kcal_per_kg: number;
  fat_percentage: number;
  fiber_percentage: number;
  moisture_percentage: number;
  ash_percentage: number;
  calcium_percentage: number;
  phosphorus_percentage: number;
}> = [
  { 
    name: 'Maize', 
    category: 'Energy Sources' as IngredientCategory,
    protein_percentage: 8.5, 
    energy_kcal_per_kg: 3350, 
    fat_percentage: 3.8, 
    fiber_percentage: 2.2, 
    moisture_percentage: 14.0, 
    ash_percentage: 1.3,
    calcium_percentage: 0.02,
    phosphorus_percentage: 0.28
  },
  { 
    name: 'Soya DOC', 
    category: 'Protein Sources' as IngredientCategory,
    protein_percentage: 44.0, 
    energy_kcal_per_kg: 2230, 
    fat_percentage: 0.8, 
    fiber_percentage: 7.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 6.5,
    calcium_percentage: 0.27,
    phosphorus_percentage: 0.65
  },
  { 
    name: 'Rice Bran', 
    category: 'Energy Sources' as IngredientCategory,
    protein_percentage: 12.5, 
    energy_kcal_per_kg: 2650, 
    fat_percentage: 15.0, 
    fiber_percentage: 12.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 12.0,
    calcium_percentage: 0.12,
    phosphorus_percentage: 1.6
  },
  { 
    name: 'Vegetable Oil', 
    category: 'Energy Sources' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 8800, 
    fat_percentage: 99.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 0.2, 
    ash_percentage: 0.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'DCP', 
    category: 'Minerals' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 8.0, 
    ash_percentage: 95.0,
    calcium_percentage: 18.0,
    phosphorus_percentage: 21.0
  },
  { 
    name: 'Limestone Powder', 
    category: 'Minerals' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 2.0, 
    ash_percentage: 98.0,
    calcium_percentage: 38.0,
    phosphorus_percentage: 0.02
  },
  { 
    name: 'Salt', 
    category: 'Minerals' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 2.0, 
    ash_percentage: 98.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Broiler Premix', 
    category: 'Additives' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 10.0, 
    ash_percentage: 80.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Layer Premix', 
    category: 'Additives' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 10.0, 
    ash_percentage: 80.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Toxin Binder', 
    category: 'Additives' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 85.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Coccidiostat', 
    category: 'Additives' as IngredientCategory,
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 5.0, 
    ash_percentage: 90.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
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
