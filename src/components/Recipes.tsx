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
      <div className="sticky top-[64px] z-30 bg-white border-b shadow-sm">
        {/* ↑ change 64px if your navbar height differs */}

        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
              <h2 className="text-xl sm:text-2xl font-bold text-orange-800 whitespace-nowrap">
                All Recipes
              </h2>

              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1.5 text-sm flex items-center gap-1 whitespace-nowrap">
                  <FileText size={14} />
                  Total Recipes: {visibleRecipes.length}
                </Badge>

                <Badge className="bg-green-100 text-green-800 px-3 py-1.5 text-sm flex items-center gap-1 whitespace-nowrap">
                  <img src="/logo.png" className="h-4 w-4" alt="icon" />
                  Ingredients: {masterIngredients.length}
                </Badge>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:flex-nowrap">
              <div className="relative w-full sm:w-[260px] lg:w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search recipes or ingredients..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                <Button
                  size="sm"
                  onClick={() => setShowAddRecipe(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipe
                </Button>

                <Button
                  size="sm"
                  onClick={exportRecipesToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBackToDashboard}
                  className="whitespace-nowrap"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="text-center py-12 text-gray-500 text-lg">
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
