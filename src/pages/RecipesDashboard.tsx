'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import * as XLSX from 'xlsx';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

  const visibleRecipes = filteredRecipes.filter(recipe => !recipe.is_hidden);

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

  const exportIndentToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Ingredient Indent Report', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Recipe quantities summary
    doc.setFontSize(14);
    doc.text('Recipe Quantities:', 20, 50);
    
    let yPos = 60;
    Object.entries(recipeQuantities).forEach(([recipeId, quantity]) => {
      if (quantity > 0) {
        const recipe = visibleRecipes.find(r => r.id === recipeId);
        if (recipe) {
          doc.setFontSize(10);
          doc.text(`${recipe.name}: ${quantity} units`, 25, yPos);
          yPos += 10;
        }
      }
    });

    // Ingredients table
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Ingredient Requirements:', 20, yPos);

    const tableData = Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => [
      ingredientName,
      `${data.totalWeight.toFixed(2)}g`,
      `₹${data.cost.toFixed(2)}`,
      ...visibleRecipes.map(recipe => {
        const recipeQuantity = recipeQuantities[recipe.id] || 0;
        if (recipeQuantity > 0 && data.recipes[recipe.name]) {
          return `${data.recipes[recipe.name].toFixed(2)}g`;
        }
        return '-';
      })
    ]);

    const tableHeaders = [
      'Ingredient',
      'Total Weight',
      'Total Cost',
      ...visibleRecipes
        .filter(recipe => recipeQuantities[recipe.id] > 0)
        .map(recipe => recipe.name)
    ];

    doc.autoTable({
      startY: yPos + 10,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 }
      }
    });

    // Grand total
    doc.setFontSize(12);
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 100;
    doc.text(`Grand Total: ₹${calculatedData.grandTotal.toFixed(2)}`, 20, finalY + 20);

    doc.save('ingredient-indent.pdf');
    
    toast({
      title: 'PDF Exported',
      description: 'Ingredient indent report has been downloaded successfully',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-20">
      <Header currentView={currentView} setCurrentView={setCurrentView} exportAllData={exportAllData} />

      <div className="container mx-auto px-4 py-2">
        {currentView === 'recipes' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1/5">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-2 w-full justify-center">
                  <FileText size={16} className="mr-2" />
                  Total Recipes: {visibleRecipes.length}
                </Badge>
              </div>
              <div className="w-1/5">
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-2 w-full justify-center">
                  <img src="/logo.png" className="h-4 w-4 mr-2" alt="icon" />
                  Ingredients: {masterIngredients.length}
                </Badge>
              </div>
              <div className="w-3/5">
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Ingredient Indent</h1>
              <Button 
                onClick={exportIndentToPDF}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
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
                    <div key={recipe.id} className="flex items-center space-x-2">
                      <label className="text-sm font-medium min-w-0 flex-1 truncate">
                        {recipe.name}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        value={recipeQuantities[recipe.id] || ''}
                        onChange={(e) => handleQuantityChange(recipe.id, e.target.value)}
                        className="w-20"
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Total Weight (g)</TableHead>
                      <TableHead>Total Cost (₹)</TableHead>
                      {visibleRecipes
                        .filter(recipe => recipeQuantities[recipe.id] > 0)
                        .map(recipe => (
                          <TableHead key={recipe.id}>
                            {recipe.name} ({recipeQuantities[recipe.id]} units)
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => (
                      <TableRow key={ingredientName}>
                        <TableCell className="font-medium">{ingredientName}</TableCell>
                        <TableCell>{data.totalWeight.toFixed(2)}g</TableCell>
                        <TableCell>₹{data.cost.toFixed(2)}</TableCell>
                        {visibleRecipes
                          .filter(recipe => recipeQuantities[recipe.id] > 0)
                          .map(recipe => (
                            <TableCell key={recipe.id}>
                              {data.recipes[recipe.name] ? `${data.recipes[recipe.name].toFixed(2)}g` : '-'}
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell colSpan={2}>Grand Total</TableCell>
                      <TableCell>₹{calculatedData.grandTotal.toFixed(2)}</TableCell>
                      {visibleRecipes
                        .filter(recipe => recipeQuantities[recipe.id] > 0)
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
