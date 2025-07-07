
'use client';

import { useState, useEffect } from 'react';
import {
  Leaf, Plus, Search, Package, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/RecipeCard';
import MasterIngredientList from '@/components/MasterIngredientList';
import AddRecipe from '@/components/AddRecipe';
import { useToast } from "@/hooks/use-toast";
import {
  fetchMasterIngredients,
  fetchRecipesWithIngredients,
  type MasterIngredient,
  type RecipeWithIngredients
} from '@/services/database';
import * as XLSX from 'xlsx';

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients' | 'add-recipe'>('recipes');
  const [showTopButton, setShowTopButton] = useState(false);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recipesData, ingredientsData] = await Promise.all([
          fetchRecipesWithIngredients(),
          fetchMasterIngredients()
        ]);
        setRecipes(recipesData);
        setMasterIngredients(ingredientsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load recipes and ingredients from database",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const filteredRecipes = recipes.filter(
    recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const refreshData = async () => {
    try {
      const [recipesData, ingredientsData] = await Promise.all([
        fetchRecipesWithIngredients(),
        fetchMasterIngredients()
      ]);
      setRecipes(recipesData);
      setMasterIngredients(ingredientsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error refreshing data",
        description: "Failed to refresh data from database",
        variant: "destructive"
      });
    }
  };

  const exportAllRecipesToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    recipes.forEach((recipe) => {
      const recipeData = [
        ['Artisan Delights - Traditional South Indian Podi Collection'],
        [''],
        ['Recipe Name', recipe.name],
        ['Description', 'Traditional South Indian Podi'],
        ['Selling Price', `₹${recipe.selling_price}`],
        ['Overheads', `₹${recipe.overheads}`],
        ['Shelf Life', recipe.shelf_life || 'N/A'],
        [],
        ['Ingredients', '', '', ''],
        ['Name', 'Quantity', 'Unit', 'Notes']
      ];

      recipe.ingredients.forEach(ingredient => {
        recipeData.push([ingredient.ingredient_name, ingredient.quantity.toString(), ingredient.unit, '']);
      });

      recipeData.push(
        [],
        ['Nutrition (per 100g)', '', '', ''],
        ['Calories', `${recipe.calories || 0} kcal`, '', ''],
        ['Protein', `${recipe.protein || 0}g`, '', ''],
        ['Fat', `${recipe.fat || 0}g`, '', ''],
        ['Carbs', `${recipe.carbs || 0}g`, '', '']
      );

      const ws = XLSX.utils.aoa_to_sheet(recipeData);
      XLSX.utils.book_append_sheet(wb, ws, recipe.name.substring(0, 30));
    });
    
    XLSX.writeFile(wb, `Artisan_Delights_All_Recipes.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading recipes and ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo.png"
              alt="Artisan Foods Logo"
              width={28}
              height={28}
              className="object-contain sm:w-8 sm:h-8"
            />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
              <span className="hidden sm:inline">Artisan Delights</span>
              <span className="sm:hidden">Artisan</span>
            </h1>
          </div>

          {/* Center: Navigation Tabs - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-2">
            <Button
              variant={activeTab === 'recipes' ? 'default' : 'outline'}
              onClick={() => setActiveTab('recipes')}
              size="sm"
            >
              <Package className="mr-2" size={16} /> Recipes
            </Button>
            <Button
              variant={activeTab === 'ingredients' ? 'default' : 'outline'}
              onClick={() => setActiveTab('ingredients')}
              size="sm"
            >
              <Leaf className="mr-2" size={16} /> Ingredients
            </Button>
            <Button
              variant={activeTab === 'add-recipe' ? 'default' : 'outline'}
              onClick={() => setActiveTab('add-recipe')}
              size="sm"
            >
              <Plus className="mr-2" size={16} /> Add Recipe
            </Button>
          </div>

          {/* Right: Export Excel Button */}
          {activeTab === 'recipes' && (
            <Button 
              onClick={exportAllRecipesToExcel}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <FileText size={16} className="mr-2" />
              Export Excel
            </Button>
          )}
        </div>

        {/* Mobile Navigation - Shown below header on mobile */}
        <div className="md:hidden border-t bg-white/90 backdrop-blur">
          <div className="container mx-auto px-2 py-2">
            <div className="flex gap-1 overflow-x-auto justify-between">
              <div className="flex gap-1">
                <Button
                  variant={activeTab === 'recipes' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('recipes')}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Package className="mr-1" size={14} /> Recipes
                </Button>
                <Button
                  variant={activeTab === 'ingredients' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('ingredients')}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Leaf className="mr-1" size={14} /> Ingredients
                </Button>
                <Button
                  variant={activeTab === 'add-recipe' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('add-recipe')}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="mr-1" size={14} /> Add
                </Button>
              </div>
              {activeTab === 'recipes' && (
                <Button 
                  onClick={exportAllRecipesToExcel}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <FileText size={14} className="mr-1" />
                  Excel
                </Button>
              )}
            </div>  
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-2 pb-28 flex-grow">
        {activeTab === 'recipes' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 mb-1"
              />
            </div>

            {/* Recipe Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id}>
                  <RecipeCard 
                    recipe={recipe} 
                    masterIngredients={masterIngredients} 
                    onRecipeUpdated={refreshData}
                  />
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No recipes found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingredients' && (
          <MasterIngredientList 
            masterIngredients={masterIngredients} 
            onRefresh={refreshData} 
          />
        )}
        {activeTab === 'add-recipe' && (
          <AddRecipe 
            masterIngredients={masterIngredients} 
            onRecipeAdded={refreshData} 
          />
        )}
      </main>

      {/* Fixed Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-500 to-yellow-400 border-t text-center text-white font-bold py-2 z-30"
        style={{ fontSize: '11px' }}
      >
        <div className="container mx-auto px-2">
          <p className="truncate">© {new Date().getFullYear()} Artisan Delights. Crafted with ❤️ by Dexorzo Creations.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
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
}
