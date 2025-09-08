import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/RecipeCard';
import { type MasterIngredient, type RecipeWithIngredients } from '@/services/database';

interface RecipesProps {
  recipes: RecipeWithIngredients[];
  masterIngredients: MasterIngredient[];
  onRecipeUpdated: () => void;
  onBackToDashboard: () => void;
}

const Recipes = ({ recipes, masterIngredients, onRecipeUpdated, onBackToDashboard }: RecipesProps) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        <Button 
          onClick={onBackToDashboard} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
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