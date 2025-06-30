
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
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [ingredientsData, setIngredientsData] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedInputs.selectedIngredients.length > 0) {
      fetchIngredientsData();
    } else {
      setLoading(false);
    }
  }, [selectedInputs.selectedIngredients, user]);

  const fetchIngredientsData = async () => {
    try {
      console.log('Fetching ingredients data for IDs:', selectedInputs.selectedIngredients);
      
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('*')
        .in('id', selectedInputs.selectedIngredients)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
      }
      
      console.log('Fetched ingredients data:', data);
      setIngredientsData(data || []);
    } catch (error) {
      console.error('Error fetching ingredients data:', error);
      toast({
        title: "Error",
        description: "Failed to load ingredients data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBird = birdTypes.find(bird => bird.id === selectedInputs.birdType);
  const selectedPhase = selectedBird?.phases.find(phase => phase.id === selectedInputs.phase);
  
  // Calculate daily feed requirements (example: 120g per bird for broilers, 130g for layers)
  const dailyFeedPerBird = selectedInputs.birdType === 'broiler' ? 120 : 130; // grams
  const totalDailyFeed = (selectedInputs.birdCount * dailyFeedPerBird) / 1000; // kg
  
  // Calculate ingredient proportions based on available ingredients
  const getIngredientQuantities = () => {
    if (ingredientsData.length === 0) return [];
    
    // For simplicity, distribute equally among selected ingredients
    // In a real application, this would use proper feed formulation algorithms
    const equalProportion = 1 / ingredientsData.length;
    
    return ingredientsData.map((ingredient) => {
      const dailyQuantity = totalDailyFeed * equalProportion;
      
      return {
        ingredient: ingredient.name,
        quantity: dailyQuantity,
        unit: 'kg',
        percentage: ((equalProportion * 100)).toFixed(1),
        name: ingredient.name,
        protein_percentage: Number(ingredient.protein_percentage) || 0,
        fat_percentage: Number(ingredient.fat_percentage) || 0,
        fiber_percentage: Number(ingredient.fiber_percentage) || 0,
        ash_percentage: Number(ingredient.ash_percentage) || 0,
        moisture_percentage: Number(ingredient.moisture_percentage) || 0
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
      const reportLines = [
        "=== FEED PLAN REPORT ===",
        `Generated: ${new Date().toLocaleDateString()}`,
        "",
        "=== BASIC INFORMATION ===",
        `Bird Type: ${selectedBird?.name}`,
        `Phase: ${selectedPhase?.name}`,
        `Number of Birds: ${selectedInputs.birdCount.toLocaleString()}`,
        `Daily Feed Requirement: ${totalDailyFeed.toFixed(1)} kg`,
        "",
        "=== NUTRITIONAL REQUIREMENTS ===",
        `Protein: ${selectedPhase?.protein}`,
        `Energy: ${selectedPhase?.energy}`,
        `Age Range: ${selectedPhase?.ageRange}`,
        "",
        "=== INGREDIENT BREAKDOWN ===",
        ...ingredientQuantities.map(item => 
          `${item.ingredient}: ${item.quantity.toFixed(2)} kg (${item.percentage}%)`
        ),
        "",
        "=== NUTRITIONAL ANALYSIS ===",
        ...ingredientQuantities.map(item => 
          `${item.ingredient}: Protein ${item.protein_percentage}%, Fat ${item.fat_percentage}%, Fiber ${item.fiber_percentage}%`
        )
      ];

      const reportContent = reportLines.join('\n');
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `feed-plan-${selectedBird?.name}-${new Date().toISOString().split('T')[0]}.txt`;
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
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-blue-100">
          <CardTitle className="text-blue-800">Feed Plan Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-lg">Loading feed plan...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedBird || !selectedPhase) {
    return (
      <Card className="shadow-lg border-blue-200">
        <CardHeader className="bg-blue-100">
          <CardTitle className="text-blue-800">Feed Plan Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🐔</div>
            <p className="text-lg">Please select bird type and phase to continue</p>
          </div>
        </CardContent>
      </Card>
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
              <p>No ingredients selected.</p>
              <p className="text-sm mt-1">Please select ingredients to see the feed plan.</p>
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
      {ingredientQuantities.length > 0 && (
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
      )}
    </div>
  );
};
