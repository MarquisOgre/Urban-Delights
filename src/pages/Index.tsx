
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Search, FileText, Package } from 'lucide-react';
import { fetchMasterIngredients, fetchRecipesWithIngredients, type MasterIngredient, type RecipeWithIngredients } from '@/services/database';
import RecipeCard from '@/components/RecipeCard';
import MasterIngredientList from '@/components/MasterIngredientList';
import AddRecipe from '@/components/AddRecipe';
import CostCalculator from '@/components/CostCalculator';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: masterIngredients = [], refetch: refetchIngredients } = useQuery({
    queryKey: ['masterIngredients'],
    queryFn: fetchMasterIngredients,
  });

  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const handleRefresh = () => {
    refetchIngredients();
    refetchRecipes();
  };

  const exportRecipesToExcel = () => {
    const exportData = recipes.map(recipe => ({
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
      'Status': recipe.is_hidden ? 'Hidden' : 'Visible'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recipes');
    XLSX.writeFile(wb, 'recipes_export.xlsx');
    
    toast({
      title: "Export Successful",
      description: "Recipes have been exported to Excel file",
    });
  };

  const exportIngredientsToExcel = () => {
    const exportData = masterIngredients.map(ingredient => ({
      'Ingredient Name': ingredient.name,
      'Price per Kg (₹)': ingredient.price_per_kg,
      'Created Date': new Date(ingredient.created_at).toLocaleDateString(),
      'Last Updated': new Date(ingredient.updated_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ingredients');
    XLSX.writeFile(wb, 'ingredients_export.xlsx');
    
    toast({
      title: "Export Successful",
      description: "Ingredients have been exported to Excel file",
    });
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleRecipes = filteredRecipes.filter(recipe => !(recipe.is_hidden || false));

  const refreshData = async () => {
    try {
      await refetchIngredients();
      await refetchRecipes();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">
            Recipe Cost Management System
          </h1>
          <p className="text-gray-600">
            Manage your recipes, ingredients, and calculate costs efficiently
          </p>
        </div>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-orange-100">
            <TabsTrigger value="recipes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Recipes
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Master Ingredients List
            </TabsTrigger>
            <TabsTrigger value="add-recipe" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Add Recipe
            </TabsTrigger>
            <TabsTrigger value="calculator" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Cost Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                <div className="flex gap-2 w-full">
                  <div className="flex gap-2 items-center w-1/5">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm px-3 py-2 whitespace-nowrap">
                      <FileText size={16} className="mr-2" />
                      Total Recipes: {visibleRecipes.length}
                    </Badge>
                  </div>
                  <div className="flex gap-2 items-center w-1/5">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-2 whitespace-nowrap">
                      <Package size={16} className="mr-2" />
                      Ingredients: {masterIngredients.length}
                    </Badge>
                  </div>
                  <div className="relative w-3/5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Search recipes or ingredients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Recipes
                </Button>
                <Button 
                  onClick={exportIngredientsToExcel}
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Ingredients
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  masterIngredients={masterIngredients}
                  onRecipeUpdated={refreshData}
                />
              ))}
            </div>

            {visibleRecipes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  {searchTerm ? 'No recipes found matching your search.' : 'No recipes available. Add your first recipe!'}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-6">
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <Button 
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Recipes
                </Button>
                <Button 
                  onClick={exportIngredientsToExcel}
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Ingredients
                </Button>
              </div>
            </div>
            <MasterIngredientList 
              masterIngredients={masterIngredients} 
              onRefresh={refetchIngredients}
            />
          </TabsContent>

          <TabsContent value="add-recipe" className="space-y-6">
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <Button 
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Recipes
                </Button>
                <Button 
                  onClick={exportIngredientsToExcel}
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Ingredients
                </Button>
              </div>
            </div>
            <AddRecipe 
              masterIngredients={masterIngredients} 
              onRecipeAdded={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <Button 
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Recipes
                </Button>
                <Button 
                  onClick={exportIngredientsToExcel}
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  <Download size={16} className="mr-2" />
                  Export Ingredients
                </Button>
              </div>
            </div>
            <CostCalculator masterIngredients={masterIngredients} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
