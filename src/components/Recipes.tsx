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
        [''],
        ['Ingredients', 'Qty', 'Unit', 'Price', 'Amount'],
      ];

      // Add ingredients data with detailed pricing
      recipe.ingredients.forEach((ingredient) => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        const pricePerKg = masterIngredient?.price_per_kg || 0;
        const amount = (ingredient.quantity * pricePerKg) / 1000; // Convert from grams to kg
        
        recipeData.push([
          ingredient.ingredient_name,
          `${ingredient.quantity}`,
          `${ingredient.unit}`,
          `₹${pricePerKg}/kg`,
          `₹${amount.toFixed(2)}`
        ]);
      });

      // Add cost summary
      recipeData.push(['']);
      recipeData.push(['Raw Material Cost', `₹${totalCost.toFixed(2)}`]);
      recipeData.push(['Overheads', `₹${(finalCost - totalCost).toFixed(2)}`]);
      recipeData.push(['Final Cost', `₹${finalCost.toFixed(2)}`]);
      recipeData.push(['Selling Price', `₹${recipe.selling_price.toFixed(2)}`]);

      // Add preparation method
      recipeData.push(['']);
      recipeData.push(['Preparation Method']);
      recipeData.push([recipe.preparation || 'N/A']);

      // Add nutritional info if available
      if (recipe.calories || recipe.protein || recipe.fat || recipe.carbs) {
        recipeData.push(['']);
        recipeData.push(['Nutrition (per 100g)']);
        if (recipe.calories) recipeData.push(['Calories', recipe.calories.toString()]);
        if (recipe.protein) recipeData.push(['Protein (g)', recipe.protein.toString()]);
        if (recipe.fat) recipeData.push(['Fat (g)', recipe.fat.toString()]);
        if (recipe.carbs) recipeData.push(['Carbs (g)', recipe.carbs.toString()]);
      }

      // Add storage info
      recipeData.push(['']);
      recipeData.push(['Storage']);
      recipeData.push([recipe.storage || 'N/A']);
      if (recipe.shelf_life) {
        recipeData.push(['Shelf Life', recipe.shelf_life]);
      }

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(recipeData);
      
      // Add worksheet to workbook with recipe name as sheet name
      const sheetName = recipe.name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate simple file name
    const fileName = `All Recipes.xlsx`;

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-orange-800">All Recipes</h2>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-2">
            <FileText size={16} className="mr-2" />
            Total Recipes: {visibleRecipes.length}
          </Badge>
          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-2">
            <img src="/logo.png" className="h-4 w-4 mr-2" alt="icon" />
            Ingredients: {masterIngredients.length}
          </Badge>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search recipes or ingredients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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