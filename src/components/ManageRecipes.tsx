
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { updateRecipeVisibility, type RecipeWithIngredients } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface ManageRecipesProps {
  recipes: RecipeWithIngredients[];
  onRecipeUpdated: () => void;
  onBackToDashboard: () => void;
}

const ManageRecipes = ({ recipes, onRecipeUpdated, onBackToDashboard }: ManageRecipesProps) => {
  const { toast } = useToast();

  const handleToggleVisibility = async (recipe: RecipeWithIngredients) => {
    try {
      await updateRecipeVisibility(recipe.id, !recipe.is_hidden);
      onRecipeUpdated();
      
      toast({
        title: recipe.is_hidden ? "Recipe Enabled" : "Recipe Disabled",
        description: `${recipe.name} is now ${recipe.is_hidden ? 'visible' : 'hidden'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe visibility",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-orange-800 mb-2">Manage All Recipes</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <Card key={recipe.id} className={`${recipe.is_hidden ? 'opacity-60 border-gray-300' : 'border-orange-200'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-orange-800 flex items-center justify-between">
                <span className="truncate">{recipe.name}</span>
                <div className="flex items-center gap-2 ml-2">
                  {recipe.is_hidden ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="font-semibold text-green-600">₹{recipe.selling_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overheads:</span>
                  <span>₹{recipe.overheads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingredients:</span>
                  <span>{recipe.ingredients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${recipe.is_hidden ? 'text-red-600' : 'text-green-600'}`}>
                    {recipe.is_hidden ? 'Hidden' : 'Visible'}
                  </span>
                </div>
              </div> */}

              <Button
                onClick={() => handleToggleVisibility(recipe)}
                className={`w-full ${
                  recipe.is_hidden 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {recipe.is_hidden ? (
                  <>
                    <Eye size={16} className="mr-2" />
                    Enable
                  </>
                ) : (
                  <>
                    <EyeOff size={16} className="mr-2" />
                    Disable
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No recipes available.
        </div>
      )}
    </div>
  );
};

export default ManageRecipes;
