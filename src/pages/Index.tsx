'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, FileText } from 'lucide-react';
import {
  fetchMasterIngredients,
  fetchRecipesWithIngredients,
  type MasterIngredient,
  type RecipeWithIngredients,
} from '@/services/database';
import RecipeCard from '@/components/RecipeCard';
import MasterIngredientList from '@/components/MasterIngredientList';
import AddRecipe from '@/components/AddRecipe';
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
      'Status': recipe.is_hidden ? 'Hidden' : 'Visible',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recipes');
    XLSX.writeFile(wb, 'recipes_export.xlsx');

    toast({
      title: 'Export Successful',
      description: 'Recipes have been exported to Excel file',
    });
  };

  const exportIngredientsToExcel = () => {
    const exportData = masterIngredients.map(ingredient => ({
      'Ingredient Name': ingredient.name,
      'Price per Kg (₹)': ingredient.price_per_kg,
      'Created Date': new Date(ingredient.created_at).toLocaleDateString(),
      'Last Updated': new Date(ingredient.updated_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ingredients');
    XLSX.writeFile(wb, 'ingredients_export.xlsx');

    toast({
      title: 'Export Successful',
      description: 'Ingredients have been exported to Excel file',
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
                { label: 'Manage Recipes', key: 'manage-recipes' },
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
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={exportRecipesToExcel}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download size={16} className="mr-1" />
                Export Recipes
              </Button>
              <Button
                onClick={exportIngredientsToExcel}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download size={16} className="mr-1" />
                Export Ingredients
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-orange-800 mb-2">Manage All Recipes</h2>
              <p className="text-gray-600">View and manage the visibility of all your recipes</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search all recipes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  masterIngredients={masterIngredients}
                  onRecipeUpdated={refreshData}
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-lg">
                {searchTerm ? 'No recipes found matching your search.' : 'No recipes available.'}
              </div>
            )}
          </div>
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
