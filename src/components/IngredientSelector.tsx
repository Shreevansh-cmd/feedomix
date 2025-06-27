
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
      
      // Auto-expand all categories initially
      const categories = [...new Set((data || []).map(ing => ing.category || 'Other'))];
      setExpandedCategories(new Set(categories));
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

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">Loading ingredients...</div>
      </div>
    );
  }

  // Group ingredients by category with proper sorting
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Sort categories by priority (common categories first)
  const categoryOrder = ['Protein Sources', 'Energy Sources', 'Minerals', 'Additives', 'Other'];
  const sortedCategories = Object.keys(groupedIngredients).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    
    // If both categories are in the priority list, sort by their index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the priority list, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the priority list, sort alphabetically
    return a.localeCompare(b);
  });

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
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedCategories.map((category) => (
              <Collapsible
                key={category}
                open={expandedCategories.has(category)}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors">
                  <h4 className="font-medium text-orange-800 flex items-center gap-2">
                    {expandedCategories.has(category) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    {category}
                    <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">
                      {groupedIngredients[category].length}
                    </span>
                  </h4>
                  <span className="text-xs text-orange-600">
                    {groupedIngredients[category].filter(ing => selectedIngredients.includes(ing.name)).length} selected
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                    {groupedIngredients[category].map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center space-x-3 p-2 hover:bg-orange-50 rounded">
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
                            <div className="text-xs text-gray-500 text-right">
                              <div>{ingredient.protein_percentage}% protein</div>
                              <div>{ingredient.energy_kcal_per_kg} kcal/kg</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
