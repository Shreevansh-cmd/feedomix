
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus } from 'lucide-react';

interface FeedIngredient {
  id: string;
  name: string;
  protein_percentage: number;
  energy_kcal_per_kg: number;
  fat_percentage: number;
  fiber_percentage: number;
  moisture_percentage: number;
  ash_percentage: number;
  cost_per_kg: number;
  is_default: boolean;
}

const Ingredients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<FeedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    protein_percentage: '',
    energy_kcal_per_kg: '',
    fat_percentage: '',
    fiber_percentage: '',
    moisture_percentage: '',
    ash_percentage: '',
    cost_per_kg: '',
  });

  useEffect(() => {
    if (user) {
      fetchIngredients();
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ingredients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('feed_ingredients')
        .insert([{
          user_id: user.id,
          name: formData.name,
          protein_percentage: parseFloat(formData.protein_percentage) || 0,
          energy_kcal_per_kg: parseFloat(formData.energy_kcal_per_kg) || 0,
          fat_percentage: parseFloat(formData.fat_percentage) || 0,
          fiber_percentage: parseFloat(formData.fiber_percentage) || 0,
          moisture_percentage: parseFloat(formData.moisture_percentage) || 0,
          ash_percentage: parseFloat(formData.ash_percentage) || 0,
          cost_per_kg: parseFloat(formData.cost_per_kg) || 0,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });

      setFormData({
        name: '',
        protein_percentage: '',
        energy_kcal_per_kg: '',
        fat_percentage: '',
        fiber_percentage: '',
        moisture_percentage: '',
        ash_percentage: '',
        cost_per_kg: '',
      });

      fetchIngredients();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feed_ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });

      fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to delete ingredient",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading ingredients...</div>
      </div>
    );
  }

  const userIngredients = ingredients.filter(ing => !ing.is_default);
  const defaultIngredients = ingredients.filter(ing => ing.is_default);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Feed Ingredients Management
          </h1>
          <p className="text-lg text-green-600">
            Manage your custom feed ingredients with nutritional information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Ingredient Form */}
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Ingredient
              </CardTitle>
              <CardDescription>
                Enter nutritional information for your custom ingredient
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Ingredient Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="protein">Protein (%)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.01"
                      value={formData.protein_percentage}
                      onChange={(e) => setFormData({ ...formData, protein_percentage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="energy">Energy (kcal/kg)</Label>
                    <Input
                      id="energy"
                      type="number"
                      step="0.01"
                      value={formData.energy_kcal_per_kg}
                      onChange={(e) => setFormData({ ...formData, energy_kcal_per_kg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fat">Fat (%)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.01"
                      value={formData.fat_percentage}
                      onChange={(e) => setFormData({ ...formData, fat_percentage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiber">Fiber (%)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      step="0.01"
                      value={formData.fiber_percentage}
                      onChange={(e) => setFormData({ ...formData, fiber_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="moisture">Moisture (%)</Label>
                    <Input
                      id="moisture"
                      type="number"
                      step="0.01"
                      value={formData.moisture_percentage}
                      onChange={(e) => setFormData({ ...formData, moisture_percentage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ash">Ash (%)</Label>
                    <Input
                      id="ash"
                      type="number"
                      step="0.01"
                      value={formData.ash_percentage}
                      onChange={(e) => setFormData({ ...formData, ash_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cost">Cost per kg</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_kg}
                    onChange={(e) => setFormData({ ...formData, cost_per_kg: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Ingredient
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ingredients List */}
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-blue-800">Your Ingredients</CardTitle>
              <CardDescription>
                Manage your custom and default ingredients
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="custom" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Custom ({userIngredients.length})</TabsTrigger>
                  <TabsTrigger value="default">Default ({defaultIngredients.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="custom" className="space-y-4">
                  {userIngredients.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No custom ingredients yet. Add your first ingredient!
                    </p>
                  ) : (
                    userIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ingredient.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Protein: {ingredient.protein_percentage}%</div>
                          <div>Energy: {ingredient.energy_kcal_per_kg} kcal/kg</div>
                          <div>Fat: {ingredient.fat_percentage}%</div>
                          <div>Fiber: {ingredient.fiber_percentage}%</div>
                          <div>Moisture: {ingredient.moisture_percentage}%</div>
                          <div>Ash: {ingredient.ash_percentage}%</div>
                        </div>
                        {ingredient.cost_per_kg > 0 && (
                          <div className="text-sm font-medium text-green-600">
                            Cost: ${ingredient.cost_per_kg}/kg
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="default" className="space-y-4">
                  {defaultIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
                      <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Protein: {ingredient.protein_percentage}%</div>
                        <div>Energy: {ingredient.energy_kcal_per_kg} kcal/kg</div>
                        <div>Fat: {ingredient.fat_percentage}%</div>
                        <div>Fiber: {ingredient.fiber_percentage}%</div>
                        <div>Moisture: {ingredient.moisture_percentage}%</div>
                        <div>Ash: {ingredient.ash_percentage}%</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
