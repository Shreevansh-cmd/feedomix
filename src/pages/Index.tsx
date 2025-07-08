
import { useState } from 'react';
import { BirdTypeSelector } from '@/components/BirdTypeSelector';
import { PhaseSelector } from '@/components/PhaseSelector';
import { BirdCountInput } from '@/components/BirdCountInput';
import { IngredientSelector } from '@/components/IngredientSelector';
import { FeedPlanResults } from '@/components/FeedPlanResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Calculator, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/broiler-chickens.jpg';
import feedIngredientsImage from '@/assets/feed-ingredients.jpg';


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
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced Feed Optimization
            </Badge>
            <h1 className="text-display text-primary-foreground mb-6">
              FeedoMix Pro
            </h1>
            <p className="text-subtitle text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Create optimal daily feeding plans for broilers and layers with precision nutrition management. 
              Maximize efficiency, reduce costs, and ensure healthy growth with science-based feed formulation.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-slide-up">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-accent" />
                <h3 className="text-xl font-semibold text-white mb-2">Precision Nutrition</h3>
                <p className="text-white/80 text-sm">Optimized feed ratios based on bird age and type</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center delay-100">
                <Calculator className="w-8 h-8 mx-auto mb-3 text-accent" />
                <h3 className="text-xl font-semibold text-white mb-2">Smart Calculations</h3>
                <p className="text-white/80 text-sm">Automated ingredient proportioning and cost analysis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center delay-200">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-accent" />
                <h3 className="text-xl font-semibold text-white mb-2">Growth Optimization</h3>
                <p className="text-white/80 text-sm">Maximize feed conversion rates and bird performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Visual Summary Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-title mb-4">How It Works</h2>
          <p className="text-subtitle mb-8 max-w-2xl mx-auto">
            Three simple steps to create your optimized feed plan
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center animate-scale-in delay-100">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-colored">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Configure Birds</h3>
              <p className="text-muted-foreground">Select bird type, phase, and count</p>
            </div>
            <div className="text-center animate-scale-in delay-200">
              <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-colored">
                <span className="text-2xl font-bold text-accent-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Ingredients</h3>
              <p className="text-muted-foreground">Select available feed ingredients</p>
            </div>
            <div className="text-center animate-scale-in delay-300">
              <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-colored">
                <span className="text-2xl font-bold text-secondary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-muted-foreground">Receive optimized feed plan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="space-y-8 animate-slide-up">
            <Card className="card-elevated border-border-light backdrop-blur-sm">
              <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Calculator className="w-6 h-6" />
                  Feed Plan Configuration
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Configure your birds and feeding requirements to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <BirdTypeSelector 
                  selectedBirdType={selectedInputs.birdType}
                  onBirdTypeChange={(birdType) => updateInputs({ birdType, phase: '' })}
                />
                
                <Separator className="my-6" />
                
                <PhaseSelector 
                  selectedBirdType={selectedInputs.birdType}
                  selectedPhase={selectedInputs.phase}
                  onPhaseChange={(phase) => updateInputs({ phase })}
                />
                
                <Separator className="my-6" />
                
                <BirdCountInput 
                  birdCount={selectedInputs.birdCount}
                  onBirdCountChange={(birdCount) => updateInputs({ birdCount })}
                />
                
                <Separator className="my-6" />
                
                <IngredientSelector 
                  selectedIngredients={selectedInputs.selectedIngredients}
                  onIngredientsChange={(selectedIngredients) => updateInputs({ selectedIngredients })}
                />
              </CardContent>
            </Card>

            {/* Ingredients Preview */}
            <Card className="card-interactive border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent-foreground flex items-center gap-2">
                  <img src={feedIngredientsImage} alt="Feed Ingredients" className="w-8 h-8 rounded-full object-cover" />
                  Available Ingredients
                </CardTitle>
                <CardDescription>
                  Premium quality ingredients for optimal nutrition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-sm font-medium">Protein Sources</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Energy Sources</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded-lg">
                    <div className="w-3 h-3 bg-secondary-foreground rounded-full"></div>
                    <span className="text-sm font-medium">Minerals</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-muted to-muted-light rounded-lg">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm font-medium">Additives</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="animate-slide-up delay-200">
            {isReadyToCalculate ? (
              <FeedPlanResults selectedInputs={selectedInputs} />
            ) : (
              <Card className="card-elevated border-muted">
                <CardHeader className="bg-gradient-secondary text-secondary-foreground rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    Feed Plan Results
                  </CardTitle>
                  <CardDescription className="text-secondary-foreground/80">
                    Complete the configuration to see your optimized feed plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="text-center py-16">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                      <div className="text-6xl">🐔</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Calculate?</h3>
                    <p className="text-muted-foreground mb-6">Configure your settings to generate an optimized feed plan</p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${selectedInputs.birdType ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                        <span className="text-sm">Bird Type</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${selectedInputs.phase ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                        <span className="text-sm">Phase</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${selectedInputs.birdCount > 0 ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                        <span className="text-sm">Bird Count</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${selectedInputs.selectedIngredients.length > 0 ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                        <span className="text-sm">Ingredients</span>
                      </div>
                    </div>
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
