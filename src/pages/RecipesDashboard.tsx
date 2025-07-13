'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import {
  fetchMasterIngredients,
  fetchRecipesWithIngredients,
  type MasterIngredient,
  type RecipeWithIngredients,
} from '@/services/database';
import RecipeCard from '@/components/RecipeCard';
import MasterIngredientList from '@/components/MasterIngredientList';
import AddRecipe from '@/components/AddRecipe';
import ManageRecipes from '@/components/ManageRecipes';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const [currentView, setCurrentView] = useState('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopButton, setShowTopButton] = useState(false);
  const [recipeQuantities, setRecipeQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: masterIngredients = [], refetch: refetchIngredients } = useQuery({
    queryKey: ['masterIngredients'],
    queryFn: fetchMasterIngredients,
  });

  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const refreshData = async () => {
    try {
      await refetchIngredients();
      await refetchRecipes();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const exportAllData = () => {
    const recipesData = recipes.map(recipe => ({
      'Recipe Name': recipe.name,
      'Selling Price (₹)': recipe.selling_price,
      'Overheads (₹)': recipe.overheads,
      'Shelf Life': recipe.shelf_life || '',
      'Storage': recipe.storage || '',
      'Calories': recipe.calories || '',
      'Protein (g)': recipe.protein || '',
      'Fat (g)': recipe.fat || '',
      'Carbs (g)': recipe.carbs || '',
      'Ingredients Count': recipe.ingredients.length,
      'Status': recipe.is_hidden ? 'Hidden' : 'Visible',
    }));

    const wb = XLSX.utils.book_new();
    const recipesWs = XLSX.utils.json_to_sheet(recipesData);
    XLSX.utils.book_append_sheet(wb, recipesWs, 'All Recipes');

    recipes.forEach(recipe => {
      const totalIngredientCost = recipe.ingredients.reduce((sum, ingredient) => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        if (masterIngredient) {
          const costPerUnit = masterIngredient.price_per_kg / 1000;
          return sum + (ingredient.quantity * costPerUnit);
        }
        return sum;
      }, 0);

      const finalCost = totalIngredientCost + recipe.overheads;
      const recipeDetails = [
        { Field: 'Recipe Name', Value: recipe.name },
        { Field: 'Selling Price (₹)', Value: recipe.selling_price },
        { Field: 'Overheads (₹)', Value: recipe.overheads },
        { Field: 'Total Ingredient Cost (₹)', Value: totalIngredientCost.toFixed(2) },
        { Field: 'Final Cost (₹)', Value: finalCost.toFixed(2) },
        { Field: 'Profit (₹)', Value: (recipe.selling_price - finalCost).toFixed(2) },
        { Field: 'Profit Margin (%)', Value: (((recipe.selling_price - finalCost) / recipe.selling_price) * 100).toFixed(2) },
        { Field: '', Value: '' },
        { Field: 'Nutritional Information', Value: '' },
        { Field: 'Calories', Value: recipe.calories || 'N/A' },
        { Field: 'Protein (g)', Value: recipe.protein || 'N/A' },
        { Field: 'Fat (g)', Value: recipe.fat || 'N/A' },
        { Field: 'Carbs (g)', Value: recipe.carbs || 'N/A' },
        { Field: '', Value: '' },
        { Field: 'Storage & Preparation', Value: '' },
        { Field: 'Shelf Life', Value: recipe.shelf_life || 'N/A' },
        { Field: 'Storage', Value: recipe.storage || 'N/A' },
        { Field: 'Preparation Method', Value: recipe.preparation || 'N/A' },
        { Field: '', Value: '' },
        { Field: 'Ingredients', Value: '' },
        ...recipe.ingredients.map(ingredient => {
          const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
          const pricePerKg = masterIngredient ? masterIngredient.price_per_kg : 0;
          const costPerUnit = pricePerKg / 1000;
          const totalCost = ingredient.quantity * costPerUnit;
          return {
            Field: `${ingredient.ingredient_name} (${ingredient.quantity}${ingredient.unit})`,
            Value: `₹${totalCost.toFixed(2)} (₹${pricePerKg}/kg)`
          };
        })
      ];

      const recipeWs = XLSX.utils.json_to_sheet(recipeDetails);
      const sheetName = `${recipe.name.substring(0, 25)}${recipe.name.length > 25 ? '...' : ''}`;
      XLSX.utils.book_append_sheet(wb, recipeWs, sheetName);
    });

    XLSX.writeFile(wb, 'artisan_delights_recipes.xlsx');

    toast({
      title: 'Export Successful',
      description: `Exported ${recipes.length + 1} sheets: All recipes overview and ${recipes.length} individual recipe sheets`,
    });
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleRecipes = filteredRecipes
    .filter(recipe => !recipe.is_hidden)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleQuantityChange = (recipeId: string, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setRecipeQuantities(prev => ({
      ...prev,
      [recipeId]: qty
    }));
  };

  // Calculate ingredient requirements and costs for Indent functionality
  const calculatedData = useMemo(() => {
    const ingredientTotals: Record<string, { totalWeight: number; cost: number; recipes: Record<string, number> }> = {};
    let grandTotal = 0;

    // Process each recipe with quantity
    Object.entries(recipeQuantities).forEach(([recipeId, quantity]) => {
      if (quantity <= 0) return;

      const recipe = visibleRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      // Calculate total cost for this recipe
      let recipeCost = 0;

      recipe.ingredients.forEach(ingredient => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        if (!masterIngredient) return;

        const totalWeight = ingredient.quantity * quantity; // Total weight needed
        const costPerGram = masterIngredient.price_per_kg / 1000;
        const totalCost = totalWeight * costPerGram;

        recipeCost += totalCost;

        // Initialize ingredient if not exists
        if (!ingredientTotals[ingredient.ingredient_name]) {
          ingredientTotals[ingredient.ingredient_name] = {
            totalWeight: 0,
            cost: 0,
            recipes: {}
          };
        }

        // Add to totals
        ingredientTotals[ingredient.ingredient_name].totalWeight += totalWeight;
        ingredientTotals[ingredient.ingredient_name].cost += totalCost;
        ingredientTotals[ingredient.ingredient_name].recipes[recipe.name] = totalWeight;
      });

      // Add overheads to recipe cost
      recipeCost += recipe.overheads * quantity;
      grandTotal += recipeCost;
    });

    return { ingredientTotals, grandTotal };
  }, [recipeQuantities, visibleRecipes, masterIngredients]);

  const exportToExcel = () => {
    if (Object.keys(recipeQuantities).length === 0) {
      toast({
        title: "No data to export",
        description: "Please add some recipe quantities first",
        variant: "destructive"
      });
      return;
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Create data for ingredient requirements summary
    const summaryData = [
      ['Ingredient Requirements Summary'],
      [''],
      ['Ingredient', 'Total Weight', 'Total Cost', 
       ...visibleRecipes
         .filter(recipe => recipeQuantities[recipe.id] > 0)
         .sort((a, b) => a.name.localeCompare(b.name))
         .map(recipe => recipe.name)
      ],
      ...Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => [
        ingredientName,
        data.totalWeight >= 1000 
          ? `${(data.totalWeight / 1000).toFixed(2)} kg`
          : `${Math.round(data.totalWeight)} g`,
        `₹${data.cost.toFixed(2)}`,
        ...visibleRecipes
          .filter(recipe => recipeQuantities[recipe.id] > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(recipe => {
            if (data.recipes[recipe.name]) {
              const weight = data.recipes[recipe.name];
              return weight >= 1000 
                ? `${(weight / 1000).toFixed(2)} kg`
                : `${Math.round(weight)} g`;
            }
            return '-';
          })
      ]),
      [''],
      ['Grand Total', '', `₹${calculatedData.grandTotal.toFixed(2)}`]
    ];

    // Add recipe quantities summary
    const recipeData = [
      ['Recipe Quantities'],
      [''],
      ['Recipe Name', 'Quantity'],
      ...Object.entries(recipeQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([recipeId, qty]) => {
          const recipe = recipes.find(r => r.id === recipeId);
          return [recipe?.name || 'Unknown Recipe', qty];
        })
    ];

    // Create worksheets
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    const recipeWorksheet = XLSX.utils.aoa_to_sheet(recipeData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Ingredient Summary');
    XLSX.utils.book_append_sheet(workbook, recipeWorksheet, 'Recipe Quantities');

    // Save the file
    const fileName = `ingredient-requirements-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel exported successfully!",
      description: `File saved as ${fileName}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-20 md:pb-8">
      <Header currentView={currentView} setCurrentView={setCurrentView} exportAllData={exportAllData} />

      <div className="container mx-auto px-2 md:px-4 py-2 max-w-full mb-16 md:mb-0">
        {currentView === 'recipes' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-1/5">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-2 w-full justify-center">
                  <FileText size={16} className="mr-2" />
                  Total Recipes: {visibleRecipes.length}
                </Badge>
              </div>
              <div className="w-full md:w-1/5">
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-2 w-full justify-center">
                  <img src="/logo.png" className="h-4 w-4 mr-2" alt="icon" />
                  Ingredients: {masterIngredients.length}
                </Badge>
              </div>
              <div className="w-full md:w-3/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search recipes or ingredients..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  masterIngredients={masterIngredients}
                  onRecipeUpdated={refreshData}
                />
              ))}
            </div>

            {visibleRecipes.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-lg">
                {searchTerm ? 'No recipes found matching your search.' : 'No recipes available. Add your first recipe!'}
              </div>
            )}
          </div>
        )}

        {currentView === 'ingredients' && (
          <MasterIngredientList masterIngredients={masterIngredients} onRefresh={refetchIngredients} />
        )}

        {currentView === 'add-recipe' && (
          <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={refreshData} />
        )}

        {currentView === 'manage-recipes' && (
          <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />
        )}

        {currentView === 'indent' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ingredient Indent</h1>
              <Button 
                onClick={exportToExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Recipe Quantities Input */}
            <Card>
              <CardHeader>
                <CardTitle>Recipe Quantities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleRecipes.map(recipe => (
                    <div key={recipe.id} className="flex items-center space-x-4">
                      <label className="text-sm font-medium min-w-0 flex-1 truncate">
                        {recipe.name}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        value={recipeQuantities[recipe.id] || ''}
                        onChange={(e) => handleQuantityChange(recipe.id, e.target.value)}
                        className="w-20 ml-4"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Requirements Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Ingredient</TableHead>
                        <TableHead className="font-semibold">Total Weight</TableHead>
                        <TableHead className="font-semibold">Total Cost</TableHead>
                        {visibleRecipes
                          .filter(recipe => recipeQuantities[recipe.id] > 0)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(recipe => (
                            <TableHead key={recipe.id} className="font-semibold">
                              {recipe.name}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => (
                        <TableRow key={ingredientName}>
                          <TableCell className="font-medium">{ingredientName}</TableCell>
                          <TableCell>
                            {data.totalWeight >= 1000 
                              ? `${(data.totalWeight / 1000).toFixed(2)} kg`
                              : `${Math.round(data.totalWeight)} g`
                            }
                          </TableCell>
                          <TableCell>₹{data.cost.toFixed(2)}</TableCell>
                          {visibleRecipes
                            .filter(recipe => recipeQuantities[recipe.id] > 0)
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(recipe => (
                              <TableCell key={recipe.id}>
                                {data.recipes[recipe.name] ? 
                                  (data.recipes[recipe.name] >= 1000 
                                    ? `${(data.recipes[recipe.name] / 1000).toFixed(2)} kg`
                                    : `${Math.round(data.recipes[recipe.name])} g`
                                  ) : '-'
                                }
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={2}>Grand Total</TableCell>
                        <TableCell>₹{calculatedData.grandTotal.toFixed(2)}</TableCell>
                        {visibleRecipes
                          .filter(recipe => recipeQuantities[recipe.id] > 0)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(recipe => {
                            const recipeCost = Object.entries(calculatedData.ingredientTotals).reduce((sum, [_, data]) => {
                              return sum + (data.recipes[recipe.name] ? 
                                (data.recipes[recipe.name] * (masterIngredients.find(mi => mi.name === _)?.price_per_kg || 0) / 1000) : 0);
                            }, 0);
                            const recipeObj = visibleRecipes.find(r => r.name === recipe.name);
                            const totalRecipeCost = recipeCost + (recipeObj ? recipeObj.overheads * (recipeQuantities[recipeObj.id] || 0) : 0);
                            return (
                              <TableCell key={recipe.id}>₹{totalRecipeCost.toFixed(2)}</TableCell>
                            );
                          })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;