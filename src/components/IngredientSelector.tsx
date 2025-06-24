
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { availableIngredients } from '@/data/feedData';

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export const IngredientSelector = ({ selectedIngredients, onIngredientsChange }: IngredientSelectorProps) => {
  const handleIngredientToggle = (ingredient: string, checked: boolean) => {
    if (checked) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    } else {
      onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableIngredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center space-x-3">
                <Checkbox
                  id={ingredient}
                  checked={selectedIngredients.includes(ingredient)}
                  onCheckedChange={(checked) => handleIngredientToggle(ingredient, checked as boolean)}
                  className="border-orange-400 data-[state=checked]:bg-orange-600"
                />
                <Label
                  htmlFor={ingredient}
                  className="text-sm font-medium cursor-pointer text-gray-700 hover:text-orange-700"
                >
                  {ingredient}
                </Label>
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
