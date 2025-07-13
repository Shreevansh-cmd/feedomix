import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, TrendingDown } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  protein_percentage: number;
  energy_kcal_per_kg: number;
  cost_per_kg: number;
}

interface OptimizedResult {
  ingredientId: string;
  name: string;
  quantity: number;
  cost: number;
}

interface CostOptimizerProps {
  selectedIngredients: Ingredient[];
  targetProtein: number;
  targetEnergy: number;
  selectedIngredientIds: string[];
  onOptimizationChange: (isEnabled: boolean, results?: OptimizedResult[]) => void;
}

export const CostOptimizer: React.FC<CostOptimizerProps> = ({
  selectedIngredients,
  targetProtein,
  targetEnergy,
  selectedIngredientIds,
  onOptimizationChange,
}) => {
  const [isOptimizationEnabled, setIsOptimizationEnabled] = useState(false);
  const [optimizedResults, setOptimizedResults] = useState<OptimizedResult[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [costSaved, setCostSaved] = useState(0);

  const optimizeFeed = () => {
    // Filter to only selected ingredients
    const availableIngredients = selectedIngredients.filter(ing => 
      selectedIngredientIds.includes(ing.id)
    );
    
    if (availableIngredients.length === 0) return;

    // Simple optimization algorithm using greedy approach
    // This is a simplified version - in practice, you'd use linear programming
    const results: OptimizedResult[] = [];
    let currentProtein = 0;
    let currentEnergy = 0;
    let currentCost = 0;

    // Sort ingredients by protein/cost ratio for efficiency
    const sortedIngredients = [...availableIngredients].sort((a, b) => {
      const ratioA = (a.protein_percentage || 0) / Math.max(a.cost_per_kg || 1, 0.01);
      const ratioB = (b.protein_percentage || 0) / Math.max(b.cost_per_kg || 1, 0.01);
      return ratioB - ratioA;
    });

    // Distribute 1000g total with optimization
    let remainingWeight = 1000;
    
    // First, ensure minimum requirements with most cost-effective ingredients
    for (const ingredient of sortedIngredients) {
      if (remainingWeight <= 0) break;
      
      const proteinContribution = ingredient.protein_percentage || 0;
      const energyContribution = ingredient.energy_kcal_per_kg || 0;
      const cost = ingredient.cost_per_kg || 0;
      
      // Calculate how much of this ingredient we need
      let quantity = 0;
      
      if (currentProtein < targetProtein && proteinContribution > 0) {
        const proteinNeeded = targetProtein - currentProtein;
        quantity = Math.min(
          (proteinNeeded / proteinContribution) * 1000,
          remainingWeight * 0.7 // Don't use more than 70% for any single ingredient
        );
      } else if (currentEnergy < targetEnergy && energyContribution > 0) {
        const energyNeeded = targetEnergy - currentEnergy;
        quantity = Math.min(
          (energyNeeded / energyContribution) * 1000,
          remainingWeight * 0.7
        );
      } else {
        // Use remaining weight proportionally
        quantity = remainingWeight / (sortedIngredients.length - results.length);
      }
      
      quantity = Math.min(quantity, remainingWeight);
      
      if (quantity > 5) { // Minimum 5g to be meaningful
        results.push({
          ingredientId: ingredient.id,
          name: ingredient.name,
          quantity: Math.round(quantity),
          cost: (quantity / 1000) * cost,
        });
        
        currentProtein += (quantity / 1000) * proteinContribution;
        currentEnergy += (quantity / 1000) * energyContribution;
        currentCost += (quantity / 1000) * cost;
        remainingWeight -= quantity;
      }
    }

    // Calculate cost saved compared to equal distribution
    const equalDistribution = 1000 / availableIngredients.length;
    const equalCost = availableIngredients.reduce((sum, ing) => 
      sum + (equalDistribution / 1000) * (ing.cost_per_kg || 0), 0
    );
    
    setOptimizedResults(results);
    setTotalCost(currentCost);
    setCostSaved(Math.max(0, equalCost - currentCost));
    
    onOptimizationChange(true, results);
  };

  const handleToggle = (enabled: boolean) => {
    setIsOptimizationEnabled(enabled);
    
    if (enabled) {
      optimizeFeed();
    } else {
      setOptimizedResults([]);
      setTotalCost(0);
      setCostSaved(0);
      onOptimizationChange(false);
    }
  };

  return (
    <Card className="border-accent-light bg-accent-subtle">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />
            Cost Optimization
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="cost-optimization"
              checked={isOptimizationEnabled}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="cost-optimization">Optimize for lowest cost</Label>
          </div>
        </div>
      </CardHeader>
      
      {isOptimizationEnabled && (
        <CardContent>
          <div className="space-y-4">
            {optimizedResults.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Total Cost</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ${totalCost.toFixed(2)}
                    </p>
                  </div>
                  
                  {costSaved > 0 && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Cost Saved</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        ${costSaved.toFixed(2)}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Per kg cost: ${(totalCost).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-primary">Optimized Ingredient Distribution:</h4>
                  <div className="space-y-2">
                    {optimizedResults.map((result) => (
                      <div key={result.ingredientId} className="flex justify-between items-center bg-white/30 rounded p-2">
                        <div>
                          <span className="font-medium">{result.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {result.quantity}g
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-green-600">
                            ${result.cost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};