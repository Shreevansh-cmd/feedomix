
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SelectedInputs } from '@/pages/Index';
import { birdTypes } from '@/data/feedData';
import { Download, Scale, Target } from 'lucide-react';
import { NutrientAnalysis } from '@/components/NutrientAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedPlanResultsProps {
  selectedInputs: SelectedInputs;
}

interface IngredientData {
  id: string;
  name: string;
  protein_percentage: number;
  fat_percentage: number;
  fiber_percentage: number;
  ash_percentage: number;
  moisture_percentage: number;
  energy_kcal_per_kg: number;
}

export const FeedPlanResults = ({ selectedInputs }: FeedPlanResultsProps) => {
  const { toast } = useToast();
  const [ingredientsData, setIngredientsData] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredientsData();
  }, [selectedInputs.selectedIngredients]);

  const fetchIngredientsData = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('*')
        .in('name', selectedInputs.selectedIngredients);

      if (error) throw error;
      setIngredientsData(data || []);
    } catch (error) {
      console.error('Error fetching ingredients data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBird = birdTypes.find(bird => bird.id === selectedInputs.birdType);
  const selectedPhase = selectedBird?.phases.find(phase => phase.id === selectedInputs.phase);
  
  // Calculate daily feed requirements (example: 120g per bird for broilers, 130g for layers)
  const dailyFeedPerBird = selectedInputs.birdType === 'broiler' ? 120 : 130; // grams
  const totalDailyFeed = (selectedInputs.birdCount * dailyFeedPerBird) / 1000; // kg
  
  // Calculate ingredient proportions based on formula and available ingredients
  const getIngredientQuantities = () => {
    if (!selectedPhase?.formula) return [];
    
    const availableFromFormula = Object.entries(selectedPhase.formula)
      .filter(([ingredient]) => selectedInputs.selectedIngredients.includes(ingredient));
    
    const totalAvailableWeight = availableFromFormula.reduce((sum, [, weight]) => sum + weight, 0);
    
    return availableFromFormula.map(([ingredient, formulaWeight]) => {
      const proportion = formulaWeight / totalAvailableWeight;
      const dailyQuantity = totalDailyFeed * proportion;
      const ingredientData = ingredientsData.find(ing => ing.name === ingredient);
      
      return {
        ingredient,
        quantity: dailyQuantity,
        unit: 'kg',
        percentage: ((proportion * 100)).toFixed(1),
        name: ingredient,
        protein_percentage: ingredientData?.protein_percentage || 0,
        fat_percentage: ingredientData?.fat_percentage || 0,
        fiber_percentage: ingredientData?.fiber_percentage || 0,
        ash_percentage: ingredientData?.ash_percentage || 0,
        moisture_percentage: ingredientData?.moisture_percentage || 0
      };
    });
  };

  const ingredientQuantities = getIngredientQuantities();
  
  // Prepare chart data
  const chartData = ingredientQuantities.map(item => ({
    name: item.ingredient.length > 12 ? item.ingredient.substring(0, 12) + '...' : item.ingredient,
    quantity: parseFloat(item.quantity.toFixed(2)),
    percentage: parseFloat(item.percentage)
  }));

  const handleDownloadPDF = () => {
    try {
      // Create a comprehensive report text
      const reportData = {
        feedPlan: {
          birdType: selectedBird?.name,
          phase: selectedPhase?.name,
          birdCount: selectedInputs.birdCount,
          totalDailyFeed: totalDailyFeed.toFixed(1)
        },
        ingredients: ingredientQuantities,
        nutritionalRequirements: {
          protein: selectedPhase?.protein,
          energy: selectedPhase?.energy,
          ageRange: selectedPhase?.ageRange
        }
      };

      // Convert to JSON string for download
      const reportContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `feed-plan-${selectedBird?.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Feed plan report downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download feed plan report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading feed plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-green-100">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Feed Plan Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Bird Type</p>
              <p className="font-semibold">{selectedBird?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phase</p>
              <p className="font-semibold">{selectedPhase?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Birds</p>
              <p className="font-semibold">{selectedInputs.birdCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Feed Requirement</p>
              <p className="font-semibold">{totalDailyFeed.toFixed(1)} kg</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Nutritional Requirements</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-600">Protein:</span> {selectedPhase?.protein}
              </div>
              <div>
                <span className="text-blue-600">Energy:</span> {selectedPhase?.energy}
              </div>
              <div>
                <span className="text-blue-600">Age Range:</span> {selectedPhase?.ageRange}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Breakdown */}
      <Card className="shadow-lg border-orange-200">
        <CardHeader className="bg-orange-100">
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Daily Ingredient Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3 mb-6">
            {ingredientQuantities.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.ingredient}</p>
                  <p className="text-sm text-gray-600">{item.percentage}% of total feed</p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {item.quantity.toFixed(2)} {item.unit}
                </Badge>
              </div>
            ))}
          </div>

          {ingredientQuantities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No matching ingredients found in the formula.</p>
              <p className="text-sm mt-1">Try selecting different ingredients or phase.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutritional Analysis with Pie Chart */}
      {ingredientQuantities.length > 0 && (
        <NutrientAnalysis 
          ingredients={ingredientQuantities}
          totalFeedWeight={totalDailyFeed}
        />
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-lg border-purple-200">
          <CardHeader className="bg-purple-100">
            <CardTitle className="text-purple-800">Ingredient Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} kg`, 'Daily Quantity']}
                    labelFormatter={(label) => `Ingredient: ${label}`}
                  />
                  <Bar dataKey="quantity" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Button */}
      <div className="text-center">
        <Button 
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Feed Plan Report
        </Button>
      </div>
    </div>
  );
};
