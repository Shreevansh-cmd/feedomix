
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  protein_percentage: number;
  energy_kcal_per_kg: number;
  fat_percentage: number;
  fiber_percentage: number;
  moisture_percentage: number;
  ash_percentage: number;
  calcium_percentage: number;
  phosphorus_percentage: number;
}

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export const IngredientSelector = ({ selectedIngredients, onIngredientsChange }: IngredientSelectorProps) => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIngredients();
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientToggle = (ingredient: string, checked: boolean) => {
    if (checked) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    } else {
      onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">Loading ingredients...</div>
      </div>
    );
  }

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const categories = Object.keys(groupedIngredients).sort();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Feed Ingredients</h3>
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 text-base">
            Select Ingredients ({selectedIngredients.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-orange-700 border-b border-orange-200 pb-1">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                  {groupedIngredients[category].map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={ingredient.name}
                        checked={selectedIngredients.includes(ingredient.name)}
                        onCheckedChange={(checked) => handleIngredientToggle(ingredient.name, checked as boolean)}
                        className="border-orange-400 data-[state=checked]:bg-orange-600"
                      />
                      <Label
                        htmlFor={ingredient.name}
                        className="text-sm font-medium cursor-pointer text-gray-700 hover:text-orange-700 flex-1"
                      >
                        <div className="flex justify-between items-center">
                          <span>{ingredient.name}</span>
                          <span className="text-xs text-gray-500">
                            {ingredient.protein_percentage}% protein
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {selectedIngredients.length === 0 && (
            <p className="text-orange-600 text-sm mt-3">
              Select at least one ingredient to generate a feed plan
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
