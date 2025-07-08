import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Target, Zap } from 'lucide-react';
import feedChartImage from '@/assets/feed-chart-hero.jpg';

interface VisualSummaryProps {
  selectedInputs: {
    birdType: string;
    phase: string;
    birdCount: number;
    selectedIngredients: string[];
  };
  isReadyToCalculate: boolean;
}

export const VisualSummary = ({ selectedInputs, isReadyToCalculate }: VisualSummaryProps) => {
  const completionData = [
    { 
      name: 'Completed', 
      value: Object.values(selectedInputs).filter(Boolean).length, 
      color: 'hsl(var(--primary))' 
    },
    { 
      name: 'Remaining', 
      value: 4 - Object.values(selectedInputs).filter(Boolean).length, 
      color: 'hsl(var(--muted))' 
    }
  ];

  const ingredientCategories = [
    { name: 'Protein Sources', count: 3, color: 'hsl(var(--primary))' },
    { name: 'Energy Sources', count: 4, color: 'hsl(var(--accent))' },
    { name: 'Minerals', count: 2, color: 'hsl(var(--secondary-foreground))' },
    { name: 'Additives', count: 2, color: 'hsl(var(--muted-foreground))' }
  ];

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <Card className="card-elevated border-primary/20">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="h-6 w-6" />
            Configuration Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Progress Chart */}
            <div className="text-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                <div className="text-2xl font-bold">
                  {Math.round((completionData[0].value / 4) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>

            {/* Configuration Checklist */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedInputs.birdType ? 'bg-primary' : 'bg-muted'}`}></div>
                <span className={selectedInputs.birdType ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  Bird Type Selected
                </span>
                {selectedInputs.birdType && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedInputs.birdType}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedInputs.phase ? 'bg-primary' : 'bg-muted'}`}></div>
                <span className={selectedInputs.phase ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  Growth Phase Set
                </span>
                {selectedInputs.phase && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedInputs.phase}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedInputs.birdCount > 0 ? 'bg-primary' : 'bg-muted'}`}></div>
                <span className={selectedInputs.birdCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  Bird Count Entered
                </span>
                {selectedInputs.birdCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedInputs.birdCount.toLocaleString()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedInputs.selectedIngredients.length > 0 ? 'bg-primary' : 'bg-muted'}`}></div>
                <span className={selectedInputs.selectedIngredients.length > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  Ingredients Chosen
                </span>
                {selectedInputs.selectedIngredients.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedInputs.selectedIngredients.length} selected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isReadyToCalculate && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-semibold text-primary">Ready to Calculate!</div>
              <div className="text-sm text-muted-foreground">Your optimized feed plan is being generated</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingredient Categories Overview */}
      <Card className="card-interactive border-accent/20">
        <CardHeader>
          <CardTitle className="text-accent-foreground flex items-center gap-2">
            <img src={feedChartImage} alt="Feed Chart" className="w-8 h-8 rounded-full object-cover" />
            Available Ingredient Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ingredientCategories.map((category, index) => (
              <div 
                key={index}
                className="text-center p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl hover:shadow-md transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>
                <h4 className="font-medium text-sm mb-1">{category.name}</h4>
                <p className="text-xs text-muted-foreground">{category.count} available</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};