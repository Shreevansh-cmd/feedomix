
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

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

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  selectedIngredients,
  onIngredientsChange,
}) => {
  const { user } = useAuth();

  const { data: ingredients, isLoading, error } = useQuery({
    queryKey: ['ingredients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Ingredient[];
    },
    enabled: !!user,
  });

  const handleIngredientToggle = (ingredientId: string) => {
    const newSelected = selectedIngredients.includes(ingredientId)
      ? selectedIngredients.filter(id => id !== ingredientId)
      : [...selectedIngredients, ingredientId];
    
    onIngredientsChange(newSelected);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading ingredients...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading ingredients: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Group ingredients by category
  const groupedIngredients = ingredients?.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>) || {};

  // Define category order
  const categoryOrder = ['Energy Sources', 'Protein Sources', 'Minerals', 'Additives', 'Other'];
  
  // Sort categories according to defined order
  const sortedCategories = categoryOrder.filter(category => groupedIngredients[category]);
  
  // Add any remaining categories not in the predefined order
  Object.keys(groupedIngredients).forEach(category => {
    if (!categoryOrder.includes(category)) {
      sortedCategories.push(category);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Ingredients</CardTitle>
        <p className="text-sm text-gray-600">
          Select ingredients to include in your feed formulation
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {sortedCategories.map((category, categoryIndex) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-medium">
                    {category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ({groupedIngredients[category].length} items)
                  </span>
                </div>
                <div className="space-y-2 ml-2">
                  {groupedIngredients[category].map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <Checkbox
                        id={ingredient.id}
                        checked={selectedIngredients.includes(ingredient.id)}
                        onCheckedChange={() => handleIngredientToggle(ingredient.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <label
                          htmlFor={ingredient.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {ingredient.name}
                        </label>
                        <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                          <span>Protein: {ingredient.protein_percentage}%</span>
                          <span>Energy: {ingredient.energy_kcal_per_kg} kcal/kg</span>
                          <span>Fat: {ingredient.fat_percentage}%</span>
                          <span>Fiber: {ingredient.fiber_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {categoryIndex < sortedCategories.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
