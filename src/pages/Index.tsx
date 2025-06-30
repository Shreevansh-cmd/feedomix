
import { useState } from 'react';
import { BirdTypeSelector } from '@/components/BirdTypeSelector';
import { PhaseSelector } from '@/components/PhaseSelector';
import { BirdCountInput } from '@/components/BirdCountInput';
import { IngredientSelector } from '@/components/IngredientSelector';
import { FeedPlanResults } from '@/components/FeedPlanResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDefaultIngredients } from '@/hooks/useDefaultIngredients';

export interface BirdType {
  id: string;
  name: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  name: string;
  ageRange: string;
  protein: string;
  energy: string;
  formula?: FeedFormula;
}

export interface FeedFormula {
  [ingredient: string]: number;
}

export interface SelectedInputs {
  birdType: string;
  phase: string;
  birdCount: number;
  selectedIngredients: string[];
}

const Index = () => {
  console.log('Index page rendering...');
  
  // Initialize default ingredients when user accesses the main page
  useDefaultIngredients();

  const [selectedInputs, setSelectedInputs] = useState<SelectedInputs>({
    birdType: '',
    phase: '',
    birdCount: 0,
    selectedIngredients: []
  });

  const updateInputs = (updates: Partial<SelectedInputs>) => {
    setSelectedInputs(prev => ({ ...prev, ...updates }));
  };

  const isReadyToCalculate = selectedInputs.birdType && 
                            selectedInputs.phase && 
                            selectedInputs.birdCount > 0 && 
                            selectedInputs.selectedIngredients.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Poultry Feed Calculator
          </h1>
          <p className="text-lg text-green-600 max-w-2xl mx-auto">
            Create optimal daily feeding plans for broilers and layers with precision nutrition management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-green-200">
              <CardHeader className="bg-green-100">
                <CardTitle className="text-green-800">Feed Plan Configuration</CardTitle>
                <CardDescription>
                  Configure your birds and feeding requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <BirdTypeSelector 
                  selectedBirdType={selectedInputs.birdType}
                  onBirdTypeChange={(birdType) => updateInputs({ birdType, phase: '' })}
                />
                
                <Separator />
                
                <PhaseSelector 
                  selectedBirdType={selectedInputs.birdType}
                  selectedPhase={selectedInputs.phase}
                  onPhaseChange={(phase) => updateInputs({ phase })}
                />
                
                <Separator />
                
                <BirdCountInput 
                  birdCount={selectedInputs.birdCount}
                  onBirdCountChange={(birdCount) => updateInputs({ birdCount })}
                />
                
                <Separator />
                
                <IngredientSelector 
                  selectedIngredients={selectedInputs.selectedIngredients}
                  onIngredientsChange={(selectedIngredients) => updateInputs({ selectedIngredients })}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {isReadyToCalculate ? (
              <FeedPlanResults selectedInputs={selectedInputs} />
            ) : (
              <Card className="shadow-lg border-blue-200">
                <CardHeader className="bg-blue-100">
                  <CardTitle className="text-blue-800">Feed Plan Results</CardTitle>
                  <CardDescription>
                    Complete the configuration to see your optimized feed plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">🐔</div>
                    <p className="text-lg">Configure your settings to generate a feed plan</p>
                    <p className="text-sm mt-2">Select bird type, phase, count, and ingredients</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
