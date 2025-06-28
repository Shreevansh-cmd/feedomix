
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
  // Energy Sources
  { 
    name: 'Maize (Corn)', 
    category: 'Energy Sources',
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
    name: 'Wheat', 
    category: 'Energy Sources',
    protein_percentage: 11.5, 
    energy_kcal_per_kg: 3200, 
    fat_percentage: 1.8, 
    fiber_percentage: 2.8, 
    moisture_percentage: 13.0, 
    ash_percentage: 1.8,
    calcium_percentage: 0.05,
    phosphorus_percentage: 0.35
  },
  { 
    name: 'Rice Bran', 
    category: 'Energy Sources',
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
    category: 'Energy Sources',
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
    name: 'Barley', 
    category: 'Energy Sources',
    protein_percentage: 10.5, 
    energy_kcal_per_kg: 2900, 
    fat_percentage: 1.8, 
    fiber_percentage: 5.5, 
    moisture_percentage: 12.0, 
    ash_percentage: 2.8,
    calcium_percentage: 0.06,
    phosphorus_percentage: 0.34
  },
  { 
    name: 'Sorghum', 
    category: 'Energy Sources',
    protein_percentage: 9.2, 
    energy_kcal_per_kg: 3200, 
    fat_percentage: 2.8, 
    fiber_percentage: 2.5, 
    moisture_percentage: 13.0, 
    ash_percentage: 1.6,
    calcium_percentage: 0.03,
    phosphorus_percentage: 0.28
  },
  { 
    name: 'Millet', 
    category: 'Energy Sources',
    protein_percentage: 11.0, 
    energy_kcal_per_kg: 3100, 
    fat_percentage: 4.2, 
    fiber_percentage: 8.5, 
    moisture_percentage: 12.0, 
    ash_percentage: 3.3,
    calcium_percentage: 0.13,
    phosphorus_percentage: 0.28
  },
  { 
    name: 'Oats', 
    category: 'Energy Sources',
    protein_percentage: 10.6, 
    energy_kcal_per_kg: 2800, 
    fat_percentage: 4.6, 
    fiber_percentage: 10.6, 
    moisture_percentage: 13.0, 
    ash_percentage: 3.0,
    calcium_percentage: 0.08,
    phosphorus_percentage: 0.31
  },
  { 
    name: 'Broken Rice', 
    category: 'Energy Sources',
    protein_percentage: 7.5, 
    energy_kcal_per_kg: 3300, 
    fat_percentage: 0.5, 
    fiber_percentage: 0.4, 
    moisture_percentage: 13.0, 
    ash_percentage: 0.6,
    calcium_percentage: 0.01,
    phosphorus_percentage: 0.11
  },
  { 
    name: 'Cassava Meal', 
    category: 'Energy Sources',
    protein_percentage: 2.0, 
    energy_kcal_per_kg: 3100, 
    fat_percentage: 0.3, 
    fiber_percentage: 2.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 2.2,
    calcium_percentage: 0.16,
    phosphorus_percentage: 0.06
  },

  // Protein Sources
  { 
    name: 'Soybean Meal (44% CP)', 
    category: 'Protein Sources',
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
    name: 'Soybean Meal (48% CP)', 
    category: 'Protein Sources',
    protein_percentage: 48.0, 
    energy_kcal_per_kg: 2200, 
    fat_percentage: 0.5, 
    fiber_percentage: 3.9, 
    moisture_percentage: 12.0, 
    ash_percentage: 6.2,
    calcium_percentage: 0.29,
    phosphorus_percentage: 0.71
  },
  { 
    name: 'Fish Meal (65% CP)', 
    category: 'Protein Sources',
    protein_percentage: 65.0, 
    energy_kcal_per_kg: 2800, 
    fat_percentage: 8.5, 
    fiber_percentage: 1.0, 
    moisture_percentage: 10.0, 
    ash_percentage: 15.0,
    calcium_percentage: 3.8,
    phosphorus_percentage: 2.4
  },
  { 
    name: 'Fish Meal (60% CP)', 
    category: 'Protein Sources',
    protein_percentage: 60.0, 
    energy_kcal_per_kg: 2650, 
    fat_percentage: 9.0, 
    fiber_percentage: 1.2, 
    moisture_percentage: 10.0, 
    ash_percentage: 16.0,
    calcium_percentage: 4.0,
    phosphorus_percentage: 2.2
  },
  { 
    name: 'Groundnut Cake', 
    category: 'Protein Sources',
    protein_percentage: 45.0, 
    energy_kcal_per_kg: 2400, 
    fat_percentage: 8.0, 
    fiber_percentage: 12.0, 
    moisture_percentage: 10.0, 
    ash_percentage: 5.5,
    calcium_percentage: 0.15,
    phosphorus_percentage: 0.58
  },
  { 
    name: 'Sunflower Seed Meal', 
    category: 'Protein Sources',
    protein_percentage: 38.0, 
    energy_kcal_per_kg: 2100, 
    fat_percentage: 1.5, 
    fiber_percentage: 22.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 7.2,
    calcium_percentage: 0.35,
    phosphorus_percentage: 1.1
  },
  { 
    name: 'Meat and Bone Meal', 
    category: 'Protein Sources',
    protein_percentage: 50.0, 
    energy_kcal_per_kg: 2200, 
    fat_percentage: 10.0, 
    fiber_percentage: 2.5, 
    moisture_percentage: 8.0, 
    ash_percentage: 28.0,
    calcium_percentage: 8.5,
    phosphorus_percentage: 4.2
  },
  { 
    name: 'Canola Meal', 
    category: 'Protein Sources',
    protein_percentage: 36.0, 
    energy_kcal_per_kg: 2000, 
    fat_percentage: 3.5, 
    fiber_percentage: 12.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 7.5,
    calcium_percentage: 0.65,
    phosphorus_percentage: 1.0
  },
  { 
    name: 'Cotton Seed Meal', 
    category: 'Protein Sources',
    protein_percentage: 41.0, 
    energy_kcal_per_kg: 2100, 
    fat_percentage: 1.5, 
    fiber_percentage: 13.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 6.8,
    calcium_percentage: 0.17,
    phosphorus_percentage: 1.2
  },
  { 
    name: 'Blood Meal', 
    category: 'Protein Sources',
    protein_percentage: 80.0, 
    energy_kcal_per_kg: 2600, 
    fat_percentage: 1.0, 
    fiber_percentage: 1.0, 
    moisture_percentage: 8.0, 
    ash_percentage: 4.5,
    calcium_percentage: 0.35,
    phosphorus_percentage: 0.25
  },
  { 
    name: 'Feather Meal', 
    category: 'Protein Sources',
    protein_percentage: 85.0, 
    energy_kcal_per_kg: 2400, 
    fat_percentage: 7.0, 
    fiber_percentage: 1.5, 
    moisture_percentage: 8.0, 
    ash_percentage: 3.0,
    calcium_percentage: 0.4,
    phosphorus_percentage: 0.7
  },
  { 
    name: 'Poultry By-Product Meal', 
    category: 'Protein Sources',
    protein_percentage: 58.0, 
    energy_kcal_per_kg: 2500, 
    fat_percentage: 12.0, 
    fiber_percentage: 2.5, 
    moisture_percentage: 10.0, 
    ash_percentage: 14.0,
    calcium_percentage: 2.2,
    phosphorus_percentage: 1.8
  },
  { 
    name: 'Sesame Meal', 
    category: 'Protein Sources',
    protein_percentage: 35.0, 
    energy_kcal_per_kg: 1900, 
    fat_percentage: 6.0, 
    fiber_percentage: 18.0, 
    moisture_percentage: 12.0, 
    ash_percentage: 13.5,
    calcium_percentage: 2.1,
    phosphorus_percentage: 1.1
  },

  // Minerals
  { 
    name: 'Limestone Powder', 
    category: 'Minerals',
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
    name: 'Dicalcium Phosphate (DCP)', 
    category: 'Minerals',
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
    name: 'Salt (Sodium Chloride)', 
    category: 'Minerals',
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
    name: 'Oyster Shell', 
    category: 'Minerals',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 1.5, 
    ash_percentage: 96.0,
    calcium_percentage: 36.0,
    phosphorus_percentage: 0.01
  },
  { 
    name: 'Bone Meal', 
    category: 'Minerals',
    protein_percentage: 4.0, 
    energy_kcal_per_kg: 500, 
    fat_percentage: 2.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 6.0, 
    ash_percentage: 85.0,
    calcium_percentage: 24.0,
    phosphorus_percentage: 12.0
  },
  { 
    name: 'Rock Phosphate', 
    category: 'Minerals',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 3.0, 
    ash_percentage: 95.0,
    calcium_percentage: 32.0,
    phosphorus_percentage: 14.5
  },

  // Additives
  { 
    name: 'Broiler Vitamin Premix', 
    category: 'Additives',
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
    name: 'Layer Vitamin Premix', 
    category: 'Additives',
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
    category: 'Additives',
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
    category: 'Additives',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 5.0, 
    ash_percentage: 90.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Enzyme Complex', 
    category: 'Additives',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 8.0, 
    ash_percentage: 85.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Probiotic', 
    category: 'Additives',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 6.0, 
    ash_percentage: 88.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Lysine HCL', 
    category: 'Additives',
    protein_percentage: 78.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 1.0, 
    ash_percentage: 20.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'DL-Methionine', 
    category: 'Additives',
    protein_percentage: 59.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 0.3, 
    ash_percentage: 0.1,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Choline Chloride', 
    category: 'Additives',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 2.0, 
    ash_percentage: 95.0,
    calcium_percentage: 0.0,
    phosphorus_percentage: 0.0
  },
  { 
    name: 'Antioxidant (BHT)', 
    category: 'Additives',
    protein_percentage: 0.0, 
    energy_kcal_per_kg: 0, 
    fat_percentage: 0.0, 
    fiber_percentage: 0.0, 
    moisture_percentage: 0.5, 
    ash_percentage: 99.0,
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
        // Check if default ingredients already exist for this user
        const { data: existingDefaults } = await supabase
          .from('feed_ingredients')
          .select('id')
          .eq('is_default', true)
          .eq('user_id', user.id)
          .limit(1);

        if (existingDefaults && existingDefaults.length > 0) {
          return; // Default ingredients already exist for this user
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
        } else {
          console.log('Default ingredients inserted successfully');
        }
      } catch (error) {
        console.error('Error initializing default ingredients:', error);
      }
    };

    initializeDefaultIngredients();
  }, [user]);
};
