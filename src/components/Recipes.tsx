import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import RecipeCard from '@/components/RecipeCard';
import AddRecipe from '@/components/AddRecipe';
import {
  type MasterIngredient,
  type RecipeWithIngredients,
  calculateRecipeCost,
} from '@/services/database';

interface RecipesProps {
  recipes: RecipeWithIngredients[];
  masterIngredients: MasterIngredient[];
  onRecipeUpdated: () => void;
  onBackToDashboard: () => void;
}

const Recipes = ({
  recipes,
  masterIngredients,
  onRecipeUpdated,
  onBackToDashboard,
}: RecipesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  /* ---------------- Add Recipe Screen ---------------- */
  if (showAddRecipe) {
    return (
      <AddRecipe
        masterIngredients={masterIngredients}
        onRecipeAdded={() => {
          onRecipeUpdated();
          setShowAddRecipe(false);
        }}
        onBackToDashboard={() => setShowAddRecipe(false)}
      />
    );
  }

  /* ---------------- Filtering ---------------- */
  const filteredRecipes = recipes.filter(
    recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing =>
        ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const visibleRecipes = filteredRecipes
    .filter(recipe => !recipe.is_hidden)
    .sort((a, b) => a.name.localeCompare(b.name));

  /* ---------------- Export Excel ---------------- */
  const exportRecipesToExcel = () => {
    const workbook = XLSX.utils.book_new();

    visibleRecipes.forEach(recipe => {
      const { totalCost, finalCost } = calculateRecipeCost(
        recipe,
        masterIngredients
      );

      const recipeData: any[][] = [
        ['Recipe Name', recipe.name],
        [''],
        ['Ingredients', 'Qty', 'Unit', 'Price', 'Amount'],
      ];

      recipe.ingredients.forEach(ingredient => {
        const masterIngredient = masterIngredients.find(
          mi => mi.name === ingredient.ingredient_name
        );
        const pricePerKg = masterIngredient?.price_per_kg || 0;
        const amount = (ingredient.quantity * pricePerKg) / 1000;

        recipeData.push([
          ingredient.ingredient_name,
          ingredient.quantity,
          ingredient.unit,
          `₹${pricePerKg}/kg`,
          `₹${amount.toFixed(2)}`,
        ]);
      });

      recipeData.push(['']);
      recipeData.push(['Raw Material Cost', `₹${totalCost.toFixed(2)}`]);
      recipeData.push([
        'Overheads',
        `₹${(finalCost - totalCost).toFixed(2)}`,
      ]);
      recipeData.push(['Final Cost', `₹${finalCost.toFixed(2)}`]);
      recipeData.push([
        'Selling Price',
        `₹${recipe.selling_price.toFixed(2)}`,
      ]);

      recipeData.push(['']);
      recipeData.push(['Preparation Method']);
      recipeData.push([recipe.preparation || 'N/A']);

      if (recipe.calories || recipe.protein || recipe.fat || recipe.carbs) {
        recipeData.push(['']);
        recipeData.push(['Nutrition (per 100g)']);
        if (recipe.calories) recipeData.push(['Calories', recipe.calories]);
        if (recipe.protein) recipeData.push(['Protein (g)', recipe.protein]);
        if (recipe.fat) recipeData.push(['Fat (g)', recipe.fat]);
        if (recipe.carbs) recipeData.push(['Carbs (g)', recipe.carbs]);
      }

      recipeData.push(['']);
      recipeData.push(['Storage']);
      recipeData.push([recipe.storage || 'N/A']);
      if (recipe.shelf_life) {
        recipeData.push(['Shelf Life', recipe.shelf_life]);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(recipeData);
      const sheetName = recipe.name
        .replace(/[\\/:*?"<>|]/g, '_')
        .substring(0, 31);

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, 'All Recipes.xlsx');
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-gray-50">
      
      {/* ================= STICKY HEADER ================= */}
      <div className="sticky top-[56px] sm:top-[64px] z-30 bg-white border-b shadow-sm">
        <div className="px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-6">
              <h2 className="text-lg sm:text-2xl font-bold text-orange-800 whitespace-nowrap">
                All Recipes
              </h2>

              <div className="flex items-center gap-1 sm:gap-2">
                <Badge className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                  <FileText size={12} />
                  {visibleRecipes.length}
                </Badge>

                <Badge className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                  <img src="/logo.png" className="h-3 w-3 sm:h-4 sm:w-4" alt="icon" />
                  {masterIngredients.length}
                </Badge>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-[260px] lg:w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddRecipe(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap flex-1 sm:flex-none text-xs sm:text-sm h-9"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>

                <Button
                  size="sm"
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap flex-1 sm:flex-none text-xs sm:text-sm h-9"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBackToDashboard}
                  className="whitespace-nowrap text-xs sm:text-sm h-9"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-2 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {visibleRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              masterIngredients={masterIngredients}
              onRecipeUpdated={onRecipeUpdated}
            />
          ))}
        </div>

        {visibleRecipes.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-base sm:text-lg">
            {searchTerm
              ? 'No recipes found matching your search.'
              : 'No recipes available. Add your first recipe!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
