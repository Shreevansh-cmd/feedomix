
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutrientPieChart } from '@/components/NutrientPieChart';
import { Badge } from '@/components/ui/badge';

interface NutrientAnalysisProps {
  ingredients: Array<{
    name: string;
    quantity: number;
    protein_percentage: number;
    fat_percentage: number;
    fiber_percentage: number;
    ash_percentage: number;
    moisture_percentage: number;
  }>;
  totalFeedWeight: number;
}

export const NutrientAnalysis = ({ ingredients, totalFeedWeight }: NutrientAnalysisProps) => {
  // Calculate weighted nutrient composition
  const calculateNutrientComposition = () => {
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalAsh = 0;
    let totalMoisture = 0;

    ingredients.forEach(ingredient => {
      const proportion = ingredient.quantity / totalFeedWeight;
      totalProtein += (ingredient.protein_percentage || 0) * proportion;
      totalFat += (ingredient.fat_percentage || 0) * proportion;
      totalFiber += (ingredient.fiber_percentage || 0) * proportion;
      totalAsh += (ingredient.ash_percentage || 0) * proportion;
      totalMoisture += (ingredient.moisture_percentage || 0) * proportion;
    });

    const totalKnownNutrients = totalProtein + totalFat + totalFiber + totalAsh + totalMoisture;
    const carbohydrates = Math.max(0, 100 - totalKnownNutrients);

    return {
      protein: totalProtein,
      fat: totalFat,
      fiber: totalFiber,
      ash: totalAsh,
      moisture: totalMoisture,
      carbohydrates: carbohydrates
    };
  };

  const nutrients = calculateNutrientComposition();

  const nutritionData = [
    { label: 'Crude Protein', value: nutrients.protein, color: '#8b5cf6' },
    { label: 'Crude Fat', value: nutrients.fat, color: '#f59e0b' },
    { label: 'Crude Fiber', value: nutrients.fiber, color: '#10b981' },
    { label: 'Ash', value: nutrients.ash, color: '#6b7280' },
    { label: 'Moisture', value: nutrients.moisture, color: '#3b82f6' },
    { label: 'Carbohydrates', value: nutrients.carbohydrates, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Nutrition Table */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-green-100">
          <CardTitle className="text-green-800">Nutritional Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {nutritionData.map((nutrient, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: nutrient.color }}
                  />
                  <span className="font-medium">{nutrient.label}</span>
                </div>
                <Badge variant="secondary" className="text-sm font-bold">
                  {nutrient.value.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Feed Quality Indicators</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600">Total Feed:</span> {totalFeedWeight.toFixed(1)} kg
              </div>
              <div>
                <span className="text-blue-600">Dry Matter:</span> {(100 - nutrients.moisture).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <NutrientPieChart data={nutrients} />
    </div>
  );
};
