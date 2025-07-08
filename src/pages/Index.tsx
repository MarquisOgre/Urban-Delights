'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, FileText, Settings } from 'lucide-react';
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

const Index = () => {
  const [currentView, setCurrentView] = useState('recipes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopButton, setShowTopButton] = useState(false);
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

  const handleRefresh = () => {
    refetchIngredients();
    refetchRecipes();
  };

  const exportAllData = () => {
    // Export recipes data (basic info without ingredients)
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

    // Export ingredients data
    const ingredientsData = masterIngredients.map(ingredient => ({
      'Ingredient Name': ingredient.name,
      'Price per Kg (₹)': ingredient.price_per_kg,
      'Created Date': new Date(ingredient.created_at).toLocaleDateString(),
      'Last Updated': new Date(ingredient.updated_at).toLocaleDateString(),
    }));

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // First sheet - List of all recipes
    const recipesWs = XLSX.utils.json_to_sheet(recipesData);
    XLSX.utils.book_append_sheet(wb, recipesWs, 'All Recipes');
    
    // Individual recipe sheets
    recipes.forEach((recipe, index) => {
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
    
    // Last sheet - Ingredients
    const ingredientsWs = XLSX.utils.json_to_sheet(ingredientsData);
    XLSX.utils.book_append_sheet(wb, ingredientsWs, 'Master Ingredients');
    
    XLSX.writeFile(wb, 'artisan_delights_data.xlsx');

    toast({
      title: 'Export Successful',
      description: `Exported ${recipes.length + 2} sheets: All recipes overview, ${recipes.length} individual recipe sheets, and master ingredients`,
    });
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleRecipes = filteredRecipes.filter(recipe => !recipe.is_hidden);

  const refreshData = async () => {
    try {
      await refetchIngredients();
      await refetchRecipes();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-20">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-orange-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {[
                { label: 'Recipes', key: 'recipes' },
                { label: 'Ingredient List', key: 'ingredients' },
                { label: 'Add Recipe', key: 'add-recipe' },
              ].map(link => (
                <button
                  key={link.key}
                  onClick={() => setCurrentView(link.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === link.key
                      ? 'bg-orange-100 text-orange-800'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <a
                href="/investor-pitch"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
              >
                Investor Pitch
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentView('manage-recipes')}
                size="sm"
                className={`${
                  currentView === 'manage-recipes'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Settings size={16} className="mr-1" />
                Manage Recipes
              </Button>
              <Button
                onClick={exportAllData}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download size={16} className="mr-1" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-2">
        {/* Content based on current view */}
        {currentView === 'recipes' && (
          <div className="space-y-6">
            {/* Stats and Search Bar */}
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

            {/* Recipe Grid */}
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
          <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={handleRefresh} />
        )}

        {currentView === 'manage-recipes' && (
          <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-500 to-yellow-400 border-t text-center text-white font-bold py-2 z-30" style={{ fontSize: '11px' }}>
        <div className="container mx-auto px-2">
          <p className="truncate">© {new Date().getFullYear()} Artisan Delights. Crafted with ❤️ by Dexorzo Creations.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-16 right-4 z-50 p-2 sm:p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition text-sm sm:text-base"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Index;
