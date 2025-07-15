import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Save, X, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  cost_per_kg: number;
  updated_at: string;
  is_default: boolean;
  price_source: string;
  price_updated_at: string;
  is_price_custom: boolean;
}

export const PriceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchingLivePrices, setFetchingLivePrices] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIngredients();
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_ingredients')
        .select('id, name, category, cost_per_kg, updated_at, is_default, price_source, price_updated_at, is_price_custom')
        .or(`user_id.eq.${user?.id},is_default.eq.true`)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

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

  const handleEditStart = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditPrice(ingredient.cost_per_kg.toString());
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const handleSavePrice = async (ingredientId: string) => {
    if (!user) return;

    try {
      const newPrice = parseFloat(editPrice) || 0;
      
      const { error } = await supabase
        .from('feed_ingredients')
        .update({ 
          cost_per_kg: newPrice,
          updated_at: new Date().toISOString(),
          price_source: 'manual',
          price_updated_at: new Date().toISOString(),
          is_price_custom: true
        })
        .eq('id', ingredientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price updated successfully",
      });

      setEditingId(null);
      setEditPrice('');
      fetchIngredients();
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
    }
  };

  const fetchLivePrices = async () => {
    setFetchingLivePrices(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ingredient-prices');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });

      fetchIngredients();
    } catch (error) {
      console.error('Error fetching live prices:', error);
      toast({
        title: "Warning",
        description: "Live price unavailable. Using last known values.",
        variant: "destructive",
      });
    } finally {
      setFetchingLivePrices(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Energy Sources': 'bg-orange-100 text-orange-800',
      'Protein Sources': 'bg-blue-100 text-blue-800',
      'Minerals': 'bg-purple-100 text-purple-800',
      'Additives': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading prices...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ingredient Price Management
          <Badge variant="outline" className="ml-2">
            {ingredients.length} ingredients
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage pricing for your feed ingredients. Prices are used for cost optimization calculations.
        </p>
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={fetchLivePrices}
            disabled={fetchingLivePrices}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${fetchingLivePrices ? 'animate-spin' : ''}`} />
            {fetchingLivePrices ? 'Fetching...' : 'Fetch Live Prices'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/kg</TableHead>
                <TableHead className="w-32">Last Updated</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                    {ingredient.is_default && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getCategoryColor(ingredient.category)}`}>
                      {ingredient.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20"
                          placeholder="0.00"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSavePrice(ingredient.id)}
                          className="p-1 h-7 w-7"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          className="p-1 h-7 w-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                     ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            ₹{ingredient.cost_per_kg.toFixed(2)}/kg
                          </span>
                          {ingredient.is_price_custom && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Source: {ingredient.price_source}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(ingredient.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId !== ingredient.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStart(ingredient)}
                        className="p-1 h-7 w-7"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};