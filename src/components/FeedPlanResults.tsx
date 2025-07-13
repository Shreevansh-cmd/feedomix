
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SelectedInputs } from '@/pages/Index';

interface OptimizedResult {
  ingredientId: string;
  name: string;
  quantity: number;
  cost: number;
}
import { birdTypes } from '@/data/feedData';
import { Download, Scale, Target, TrendingUp, Clock, Award } from 'lucide-react';
import broilerImage from '@/assets/broiler-chickens.jpg';
import layerImage from '@/assets/layer-chickens.jpg';
import { NutrientAnalysis } from '@/components/NutrientAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FeedPlanResultsProps {
  selectedInputs: SelectedInputs;
  optimizationEnabled?: boolean;
  optimizedResults?: OptimizedResult[];
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

export const FeedPlanResults = ({ selectedInputs, optimizationEnabled, optimizedResults }: FeedPlanResultsProps) => {
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
        .in('id', selectedInputs.selectedIngredients);

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
  
  // Calculate ingredient proportions based on nutritional requirements
  const getIngredientQuantities = () => {
    if (ingredientsData.length === 0) return [];
    
    // Deduplicate ingredients by name (keep first occurrence)
    const uniqueIngredients = ingredientsData.filter((ingredient, index, self) => 
      index === self.findIndex(i => i.name === ingredient.name)
    );
    
    if (uniqueIngredients.length === 0) return [];
    
    // Parse target requirements from phase
    const targetProteinPercent = parseFloat(selectedPhase?.protein?.replace('%', '') || '0');
    const targetEnergyKcal = parseFloat(selectedPhase?.energy?.split(' ')[0] || '0');
    
    // Calculate optimal ingredient quantities based on nutritional contribution
    const calculateOptimalQuantities = () => {
      // Start with basic formulation weights based on ingredient types and nutritional density
      const ingredientWeights = uniqueIngredients.map(ingredient => {
        const proteinContent = Number(ingredient.protein_percentage) || 0;
        const energyContent = Number(ingredient.energy_kcal_per_kg) || 0;
        
        // Calculate weight based on how well ingredient contributes to targets
        let weight = 1; // Base weight
        
        // High protein ingredients get higher weight if protein target is high
        if (targetProteinPercent > 20 && proteinContent > 30) {
          weight += 2; // Protein sources like soybean meal
        } else if (targetProteinPercent > 15 && proteinContent > 20) {
          weight += 1.5;
        }
        
        // High energy ingredients get weight based on energy target
        if (targetEnergyKcal > 3000 && energyContent > 3000) {
          weight += 1.5; // Energy sources like oils, grains
        } else if (energyContent > 2500) {
          weight += 1;
        }
        
        // Additives and minerals get smaller portions
        if (ingredient.name.toLowerCase().includes('premix') || 
            ingredient.name.toLowerCase().includes('salt') ||
            ingredient.name.toLowerCase().includes('limestone') ||
            ingredient.name.toLowerCase().includes('dcp')) {
          weight = 0.1; // Very small amounts for additives
        }
        
        // Oil gets moderate weight
        if (ingredient.name.toLowerCase().includes('oil')) {
          weight = 0.8;
        }
        
        return Math.max(weight, 0.1); // Minimum weight to ensure all ingredients are included
      });
      
      // Normalize weights to sum to 1
      const totalWeight = ingredientWeights.reduce((sum, weight) => sum + weight, 0);
      const normalizedWeights = ingredientWeights.map(weight => weight / totalWeight);
      
      // Apply weights to total feed
      return uniqueIngredients.map((ingredient, index) => {
        const proportion = normalizedWeights[index];
        const dailyQuantity = totalDailyFeed * proportion;
        
        return {
          ingredient: ingredient.name,
          quantity: dailyQuantity,
          unit: 'kg',
          percentage: (proportion * 100).toFixed(1),
          name: ingredient.name,
          protein_percentage: Number(ingredient.protein_percentage) || 0,
          fat_percentage: Number(ingredient.fat_percentage) || 0,
          fiber_percentage: Number(ingredient.fiber_percentage) || 0,
          ash_percentage: Number(ingredient.ash_percentage) || 0,
          moisture_percentage: Number(ingredient.moisture_percentage) || 0,
          energy_kcal_per_kg: Number(ingredient.energy_kcal_per_kg) || 0
        };
      });
    };
    
    return calculateOptimalQuantities();
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
      <Card className="card-elevated border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            Feed Plan Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-lg font-medium">Calculating optimal feed plan...</div>
            <div className="text-sm text-muted-foreground mt-2">This may take a moment</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedBird || !selectedPhase) {
    return (
      <Card className="card-elevated border-warning/20">
        <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="h-6 w-6" />
            Feed Plan Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-warning/10 to-warning/20 rounded-full flex items-center justify-center">
              <div className="text-4xl">🐔</div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
            <p className="text-muted-foreground">Please select bird type and phase to continue with your feed plan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const birdImage = selectedInputs.birdType === 'broiler' ? broilerImage : layerImage;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Summary Card */}
      <Card className="card-elevated border-success/20 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg relative">
          <div className="absolute inset-0 opacity-20">
            <img src={birdImage} alt={selectedBird?.name} className="w-full h-full object-cover" />
          </div>
          <div className="relative">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Award className="h-6 w-6" />
              Feed Plan Summary
            </CardTitle>
            <Badge className="mt-2 bg-accent text-accent-foreground">
              Optimized for {selectedBird?.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-1">{selectedBird?.name}</div>
              <div className="text-sm text-muted-foreground">Bird Type</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-xl">
              <div className="text-2xl font-bold text-accent-foreground mb-1">{selectedPhase?.name}</div>
              <div className="text-sm text-muted-foreground">Growth Phase</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-secondary/20 to-secondary/30 rounded-xl">
              <div className="text-2xl font-bold text-secondary-foreground mb-1">{selectedInputs.birdCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Birds</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-success/10 to-success/20 rounded-xl">
              <div className="text-2xl font-bold text-success mb-1">{totalDailyFeed.toFixed(1)} kg</div>
              <div className="text-sm text-muted-foreground">Daily Feed</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Nutritional Requirements */}
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-6 rounded-xl">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Nutritional Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <div className="font-medium">Protein</div>
                  <div className="text-sm text-muted-foreground">{selectedPhase?.protein}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <div>
                  <div className="font-medium">Energy</div>
                  <div className="text-sm text-muted-foreground">{selectedPhase?.energy}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-secondary-foreground rounded-full"></div>
                <div>
                  <div className="font-medium">Age Range</div>
                  <div className="text-sm text-muted-foreground">{selectedPhase?.ageRange}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Ingredient Breakdown */}
      <Card className="card-elevated border-accent/20">
        <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-3">
            <Scale className="h-6 w-6" />
            Daily Ingredient Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-4 mb-8">
            {ingredientQuantities.map((item, index) => (
              <div key={index} className="ingredient-item group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{item.ingredient}</h4>
                      <p className="text-sm text-muted-foreground">{item.percentage}% of total feed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-primary text-primary-foreground text-base px-4 py-2">
                      {item.quantity.toFixed(2)} {item.unit}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Per day
                    </div>
                  </div>
                </div>
                
                {/* Progress bar showing proportion */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Proportion</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ingredientQuantities.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Scale className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No ingredients selected</h3>
              <p className="text-muted-foreground">Please select ingredients to see your optimized feed plan</p>
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

      {/* Enhanced Chart */}
      {chartData.length > 0 && (
        <Card className="card-elevated border-secondary/20">
          <CardHeader className="bg-gradient-secondary text-secondary-foreground rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <TrendingUp className="h-6 w-6" />
              Ingredient Distribution Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    label={{ value: 'Daily Quantity (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    fontSize={11}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} kg`, 'Daily Quantity']}
                    labelFormatter={(label) => `Ingredient: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Ingredients</div>
                <div className="text-lg font-semibold">{chartData.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Largest Component</div>
                <div className="text-lg font-semibold">
                  {Math.max(...chartData.map(item => item.percentage)).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Weight</div>
                <div className="text-lg font-semibold">{totalDailyFeed.toFixed(1)} kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Download Section */}
      {ingredientQuantities.length > 0 && (
        <Card className="card-interactive border-primary/20">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-colored">
                <Download className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Download Your Feed Plan</h3>
              <p className="text-muted-foreground mb-6">
                Get a comprehensive report with all ingredients, nutritional analysis, and feeding guidelines
              </p>
              <Button 
                onClick={handleDownloadPDF}
                className="btn-gradient px-8 py-4 text-lg"
                size="lg"
              >
                <Download className="h-5 w-5 mr-3" />
                Download Complete Report
              </Button>
              <div className="mt-4 text-xs text-muted-foreground">
                Includes: Ingredient breakdown • Nutritional analysis • Feeding schedule
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
