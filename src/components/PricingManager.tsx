import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchRecipePricing, updateRecipePrice, updateRecipeEnabled } from '@/services/pricingService';
import { fetchRecipesWithIngredients } from '@/services/database';
import type { RecipePricing } from '@/services/pricingService';
import type { RecipeWithIngredients } from '@/services/database';

const QUANTITY_OPTIONS = [
  'Sample Trial',
  '100grms',
  '250grms',
  '500grms',
  '1 Kg'
];

const PricingManager: React.FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => {
  const [pricing, setPricing] = useState<RecipePricing[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pricingData, recipesData] = await Promise.all([
        fetchRecipePricing(),
        fetchRecipesWithIngredients()
      ]);
      setPricing(pricingData);
      setRecipes(recipesData.filter(recipe => !recipe.is_hidden));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pricing data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (pricingId: string, newPrice: number) => {
    setEditingPrice(prev => ({
      ...prev,
      [pricingId]: newPrice
    }));
  };

  const savePrice = async (pricingId: string) => {
    const newPrice = editingPrice[pricingId];
    if (newPrice === undefined) return;

    try {
      await updateRecipePrice(pricingId, newPrice);
      
      // Update local state
      setPricing(prev => prev.map(p => 
        p.id === pricingId ? { ...p, price: newPrice } : p
      ));
      
      // Clear editing state
      setEditingPrice(prev => {
        const { [pricingId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: 'Success',
        description: 'Price updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update price',
        variant: 'destructive',
      });
    }
  };

  const toggleEnabled = async (pricingId: string, currentEnabled: boolean) => {
    try {
      await updateRecipeEnabled(pricingId, !currentEnabled);
      
      // Update local state
      setPricing(prev => prev.map(p => 
        p.id === pricingId ? { ...p, is_enabled: !currentEnabled } : p
      ));

      toast({
        title: 'Success',
        description: `Recipe ${!currentEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update recipe status',
        variant: 'destructive',
      });
    }
  };

  const getPriceForRecipeAndQuantity = (recipeName: string, quantity: string) => {
    return pricing.find(p => p.recipe_name === recipeName && p.quantity_type === quantity);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading pricing data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recipe Pricing Management</h2>
        <Button 
          onClick={onBackToDashboard} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="w-full">
        <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                {QUANTITY_OPTIONS.map(quantity => (
                  <TableHead key={quantity}>{quantity}</TableHead>
                ))}
                <TableHead>Enable/Disable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => {
                // Get any pricing entry for this recipe to check if enabled
                const anyPriceEntry = pricing.find(p => p.recipe_name === recipe.name);
                const isRecipeEnabled = anyPriceEntry?.is_enabled ?? true;
                
                return (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.name}</TableCell>
                    {QUANTITY_OPTIONS.map(quantity => {
                      const priceEntry = getPriceForRecipeAndQuantity(recipe.name, quantity);
                      const isEditing = priceEntry && editingPrice.hasOwnProperty(priceEntry.id);
                      const currentPrice = isEditing ? editingPrice[priceEntry!.id] : priceEntry?.price || 0;
                      
                      return (
                        <TableCell key={`${recipe.id}-${quantity}`}>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={currentPrice}
                              onChange={(e) => priceEntry && handlePriceChange(priceEntry.id, Number(e.target.value))}
                              className="w-20"
                              step="0.01"
                            />
                            {isEditing && (
                              <Button
                                size="sm"
                                onClick={() => priceEntry && savePrice(priceEntry.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save size={14} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => anyPriceEntry && toggleEnabled(anyPriceEntry.id, isRecipeEnabled)}
                        className={isRecipeEnabled ? "text-green-600" : "text-red-600"}
                      >
                        {isRecipeEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {recipes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recipes found. Create some recipes first.
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default PricingManager;