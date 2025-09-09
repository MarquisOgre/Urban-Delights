import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Search, ArrowLeft, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/RecipeCard';
import { type MasterIngredient, type RecipeWithIngredients, calculateRecipeCost } from '@/services/database';

interface RecipesProps {
  recipes: RecipeWithIngredients[];
  masterIngredients: MasterIngredient[];
  onRecipeUpdated: () => void;
  onBackToDashboard: () => void;
}

const Recipes = ({ recipes, masterIngredients, onRecipeUpdated, onBackToDashboard }: RecipesProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const exportRecipesToExcel = () => {
    const workbook = XLSX.utils.book_new();

    visibleRecipes.forEach((recipe) => {
      // Calculate costs
      const { totalCost, finalCost } = calculateRecipeCost(recipe, masterIngredients);
      
      // Create recipe data for the sheet
      const recipeData = [
        ['Recipe Name', recipe.name],
        ['Selling Price', `₹${recipe.selling_price.toFixed(2)}`],
        ['Total Cost', `₹${totalCost.toFixed(2)}`],
        ['Final Cost (with overheads)', `₹${finalCost.toFixed(2)}`],
        ['Overheads', `${recipe.overheads}%`],
        ['Preparation', recipe.preparation || 'N/A'],
        ['Shelf Life', recipe.shelf_life || 'N/A'],
        ['Storage', recipe.storage || 'N/A'],
        [''],
        ['Ingredients', 'Quantity', 'Unit'],
      ];

      // Add ingredients data
      recipe.ingredients.forEach((ingredient) => {
        recipeData.push([
          ingredient.ingredient_name,
          ingredient.quantity.toString(),
          ingredient.unit
        ]);
      });

      // Add nutritional info if available
      if (recipe.calories || recipe.protein || recipe.fat || recipe.carbs) {
        recipeData.push(['']);
        recipeData.push(['Nutritional Information']);
        if (recipe.calories) recipeData.push(['Calories', recipe.calories.toString()]);
        if (recipe.protein) recipeData.push(['Protein (g)', recipe.protein.toString()]);
        if (recipe.fat) recipeData.push(['Fat (g)', recipe.fat.toString()]);
        if (recipe.carbs) recipeData.push(['Carbs (g)', recipe.carbs.toString()]);
      }

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(recipeData);
      
      // Add worksheet to workbook with recipe name as sheet name
      const sheetName = recipe.name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate simple file name
    const fileName = `ALL RECIPES.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, fileName);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleRecipes = filteredRecipes
    .filter(recipe => !recipe.is_hidden)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-orange-800 mb-2">All Recipes</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={exportRecipesToExcel} 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Recipes
          </Button>
          <Button 
            onClick={onBackToDashboard} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/6">
          <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-2 w-full justify-center">
            <FileText size={16} className="mr-2" />
            Total Recipes: {visibleRecipes.length}
          </Badge>
        </div>
        <div className="w-full md:w-1/6">
          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-2 w-full justify-center">
            <img src="/logo.png" className="h-4 w-4 mr-2" alt="icon" />
            Ingredients: {masterIngredients.length}
          </Badge>
        </div>
        <div className="w-full md:w-2/6">
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
            onRecipeUpdated={onRecipeUpdated}
          />
        ))}
      </div>

      {visibleRecipes.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          {searchTerm ? 'No recipes found matching your search.' : 'No recipes available. Add your first recipe!'}
        </div>
      )}
    </div>
  );
};

export default Recipes;