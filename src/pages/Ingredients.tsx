import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit } from 'lucide-react';
import { PriceManager } from '@/components/PriceManager';
import { Database } from '@/integrations/supabase/types';

type IngredientCategory = Database['public']['Enums']['ingredient_category'];

interface FeedIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  protein_percentage: number;
  energy_kcal_per_kg: number;
  fat_percentage: number;
  fiber_percentage: number;
  moisture_percentage: number;
  ash_percentage: number;
  calcium_percentage: number;
  phosphorus_percentage: number;
  cost_per_kg: number;
  is_default: boolean;
  price_source?: string;
  is_price_custom?: boolean;
  price_updated_at?: string;
}

const categories: IngredientCategory[] = [
  'Protein Sources',
  'Energy Sources',
  'Minerals',
  'Additives',
  'Other'
];

// Default prices for common ingredients
const defaultPrices: { [key: string]: number } = {
  'Maize': 26,
  'Soybean Meal': 50,
  'Soya DOC': 50, // Alternative name for Soybean Meal
  'Rice Bran': 18,
  'Vegetable Oil': 110,
  'Limestone Powder': 6,
  'DCP': 45,
  'Salt': 5,
  'Toxin Binder': 130,
  'Coccidiostat': 160,
  'Broiler Premix': 180,
  'Layer Premix': 160,
};

const Ingredients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<FeedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other' as IngredientCategory,
    protein_percentage: '',
    energy_kcal_per_kg: '',
    fat_percentage: '',
    fiber_percentage: '',
    moisture_percentage: '',
    ash_percentage: '',
    calcium_percentage: '',
    phosphorus_percentage: '',
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
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Auto-fill prices for ingredients with missing or zero prices
      const ingredientsWithPrices = await autoFillMissingPrices(data || []);
      setIngredients(ingredientsWithPrices);
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

  const autoFillMissingPrices = async (ingredientsList: FeedIngredient[]) => {
    const updatedIngredients = [...ingredientsList];
    const ingredientsToUpdate = [];

    for (const ingredient of ingredientsList) {
      if ((!ingredient.cost_per_kg || ingredient.cost_per_kg === 0) && defaultPrices[ingredient.name]) {
        const updatedIngredient = {
          ...ingredient,
          cost_per_kg: defaultPrices[ingredient.name],
          price_source: 'auto-filled',
          is_price_custom: false,
        };
        
        ingredientsToUpdate.push({
          id: ingredient.id,
          cost_per_kg: defaultPrices[ingredient.name],
          price_source: 'auto-filled',
          is_price_custom: false,
        });

        // Update in local array
        const index = updatedIngredients.findIndex(ing => ing.id === ingredient.id);
        if (index !== -1) {
          updatedIngredients[index] = updatedIngredient;
        }
      }
    }

    // Batch update prices in database
    if (ingredientsToUpdate.length > 0) {
      try {
        for (const update of ingredientsToUpdate) {
          await supabase
            .from('feed_ingredients')
            .update({
              cost_per_kg: update.cost_per_kg,
              price_source: update.price_source,
              is_price_custom: update.is_price_custom,
              price_updated_at: new Date().toISOString(),
            })
            .eq('id', update.id);
        }
        
        console.log(`Auto-filled prices for ${ingredientsToUpdate.length} ingredients`);
      } catch (error) {
        console.error('Error auto-filling prices:', error);
      }
    }

    return updatedIngredients;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Other' as IngredientCategory,
      protein_percentage: '',
      energy_kcal_per_kg: '',
      fat_percentage: '',
      fiber_percentage: '',
      moisture_percentage: '',
      ash_percentage: '',
      calcium_percentage: '',
      phosphorus_percentage: '',
      cost_per_kg: '',
    });
    setEditingId(null);
  };

  const handleEdit = (ingredient: FeedIngredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      protein_percentage: ingredient.protein_percentage.toString(),
      energy_kcal_per_kg: ingredient.energy_kcal_per_kg.toString(),
      fat_percentage: ingredient.fat_percentage.toString(),
      fiber_percentage: ingredient.fiber_percentage.toString(),
      moisture_percentage: ingredient.moisture_percentage.toString(),
      ash_percentage: ingredient.ash_percentage.toString(),
      calcium_percentage: ingredient.calcium_percentage.toString(),
      phosphorus_percentage: ingredient.phosphorus_percentage.toString(),
      cost_per_kg: ingredient.cost_per_kg.toString(),
    });
    setEditingId(ingredient.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const costPerKg = parseFloat(formData.cost_per_kg) || 0;
      
      // Validate cost per kg - ensure it's not negative and handle empty values properly
      if (formData.cost_per_kg !== '' && costPerKg < 0) {
        toast({
          title: "Validation Error",
          description: "Cost per kg cannot be negative",
          variant: "destructive",
        });
        return;
      }

      // Auto-fill price if not provided and ingredient has default price
      let finalCostPerKg = costPerKg;
      let priceSource = 'manual';
      let isPriceCustom = true;

      if (costPerKg === 0 && defaultPrices[formData.name]) {
        finalCostPerKg = defaultPrices[formData.name];
        priceSource = 'auto-filled';
        isPriceCustom = false;
      }

      const ingredientData = {
        name: formData.name,
        category: formData.category as IngredientCategory,
        protein_percentage: parseFloat(formData.protein_percentage) || 0,
        energy_kcal_per_kg: parseFloat(formData.energy_kcal_per_kg) || 0,
        fat_percentage: parseFloat(formData.fat_percentage) || 0,
        fiber_percentage: parseFloat(formData.fiber_percentage) || 0,
        moisture_percentage: parseFloat(formData.moisture_percentage) || 0,
        ash_percentage: parseFloat(formData.ash_percentage) || 0,
        calcium_percentage: parseFloat(formData.calcium_percentage) || 0,
        phosphorus_percentage: parseFloat(formData.phosphorus_percentage) || 0,
        cost_per_kg: finalCostPerKg,
        price_source: priceSource,
        is_price_custom: isPriceCustom,
        price_updated_at: new Date().toISOString(),
      };

      if (editingId) {
        // Update existing ingredient
        const { error } = await supabase
          .from('feed_ingredients')
          .update(ingredientData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: finalCostPerKg > 0 ? "Price updated successfully" : "Ingredient updated successfully",
        });
      } else {
        // Create new ingredient
        const { error } = await supabase
          .from('feed_ingredients')
          .insert([{
            ...ingredientData,
            user_id: user.id,
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ingredient added successfully",
        });
      }

      resetForm();
      fetchIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to save ingredient",
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

  const groupedIngredients = categories.reduce((acc, category) => {
    acc[category] = ingredients.filter(ing => ing.category === category);
    return acc;
  }, {} as Record<IngredientCategory, FeedIngredient[]>);

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
            Manage your feed ingredients categorized by nutrition type
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
          {/* Add/Edit Ingredient Form - Fixed width */}
          <div className="lg:flex-1 lg:max-w-lg">
            <Card className="shadow-lg border-green-200 h-full">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-green-800 flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Update ingredient information' : 'Enter nutritional information for your custom ingredient'}
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

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: IngredientCategory) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Label htmlFor="calcium">Calcium (%)</Label>
                    <Input
                      id="calcium"
                      type="number"
                      step="0.01"
                      value={formData.calcium_percentage}
                      onChange={(e) => setFormData({ ...formData, calcium_percentage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phosphorus">Phosphorus (%)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      step="0.01"
                      value={formData.phosphorus_percentage}
                      onChange={(e) => setFormData({ ...formData, phosphorus_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <Label htmlFor="cost">Cost per kg (₹)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={defaultPrices[formData.name] ? `Auto-fill: ₹${defaultPrices[formData.name]}` : "Enter cost per kg"}
                      value={formData.cost_per_kg}
                      onChange={(e) => setFormData({ ...formData, cost_per_kg: e.target.value })}
                    />
                    {defaultPrices[formData.name] && !formData.cost_per_kg && (
                      <p className="text-sm text-blue-600 mt-1">
                        Will auto-fill with ₹{defaultPrices[formData.name].toFixed(2)} if left empty
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!formData.name.trim()}
                  >
                    {editingId ? 'Update Ingredient' : 'Add Ingredient'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          </div>

          {/* Ingredients List - Fixed width and height */}
          <div className="lg:flex-[2] lg:min-w-0">
            <Card className="shadow-lg border-blue-200 h-full">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-blue-800">Your Ingredients</CardTitle>
              <CardDescription>
                Manage your custom and default ingredients by category
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="custom" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="custom">Custom ({userIngredients.length})</TabsTrigger>
                  <TabsTrigger value="default">Default ({defaultIngredients.length})</TabsTrigger>
                  <TabsTrigger value="categorized">By Category</TabsTrigger>
                  <TabsTrigger value="prices">Prices</TabsTrigger>
                </TabsList>
                
                <TabsContent value="custom" className="space-y-4">
                  {userIngredients.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No custom ingredients yet. Add your first ingredient!
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userIngredients.map((ingredient) => (
                        <div key={ingredient.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {ingredient.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(ingredient)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(ingredient.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Protein: {ingredient.protein_percentage}%</div>
                            <div>Energy: {ingredient.energy_kcal_per_kg} kcal/kg</div>
                            <div>Fat: {ingredient.fat_percentage}%</div>
                            <div>Fiber: {ingredient.fiber_percentage}%</div>
                            <div>Calcium: {ingredient.calcium_percentage}%</div>
                            <div>Phosphorus: {ingredient.phosphorus_percentage}%</div>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={ingredient.cost_per_kg > 0 ? 'text-green-600' : 'text-gray-400'}>
                              {ingredient.cost_per_kg > 0 ? `₹${ingredient.cost_per_kg.toFixed(2)} / kg` : 'No price set'}
                            </span>
                            {ingredient.cost_per_kg > 0 && ingredient.price_source === 'auto-filled' && (
                              <span className="text-xs text-blue-500 ml-2">Auto-filled — editable</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="default" className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {defaultIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="border rounded-lg p-4 space-y-2 bg-gray-50">
                        <div>
                          <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                          <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {ingredient.category}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Protein: {ingredient.protein_percentage}%</div>
                          <div>Energy: {ingredient.energy_kcal_per_kg} kcal/kg</div>
                          <div>Fat: {ingredient.fat_percentage}%</div>
                          <div>Fiber: {ingredient.fiber_percentage}%</div>
                          <div>Calcium: {ingredient.calcium_percentage}%</div>
                          <div>Phosphorus: {ingredient.phosphorus_percentage}%</div>
                        </div>
                        <div className="text-sm font-medium">
                          <span className={ingredient.cost_per_kg > 0 ? 'text-green-600' : 'text-gray-400'}>
                            {ingredient.cost_per_kg > 0 ? `₹${ingredient.cost_per_kg.toFixed(2)} / kg` : 'No price set'}
                          </span>
                          {ingredient.cost_per_kg > 0 && ingredient.price_source === 'auto-filled' && (
                            <span className="text-xs text-blue-500 ml-2">Auto-filled — editable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="categorized" className="space-y-4">
                  <div className="max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          {category}
                          <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                            {groupedIngredients[category]?.length || 0}
                          </span>
                        </h3>
                        {groupedIngredients[category]?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Protein %</TableHead>
                                  <TableHead>Energy</TableHead>
                                  <TableHead>Ca %</TableHead>
                                  <TableHead>P %</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {groupedIngredients[category].map((ingredient) => (
                                  <TableRow key={ingredient.id}>
                                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                                    <TableCell>{ingredient.protein_percentage}</TableCell>
                                    <TableCell>{ingredient.energy_kcal_per_kg}</TableCell>
                                    <TableCell>{ingredient.calcium_percentage}</TableCell>
                                    <TableCell>{ingredient.phosphorus_percentage}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No ingredients in this category</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="prices" className="space-y-4">
                  <PriceManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
