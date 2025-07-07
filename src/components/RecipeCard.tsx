
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Eye, IndianRupee, Scale, Clock, AlertTriangle, Calculator, Edit, Trash2, EyeOff } from "lucide-react";
import { calculateIngredientCost, calculateRecipeCost, updateRecipeVisibility, type RecipeWithIngredients, type MasterIngredient } from "@/services/database";
import EditRecipeDialog from "./EditRecipeDialog";
import DeleteRecipeDialog from "./DeleteRecipeDialog";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: RecipeWithIngredients;
  masterIngredients: MasterIngredient[];
  onRecipeUpdated: () => void;
}

const RecipeCard = ({ recipe, masterIngredients, onRecipeUpdated }: RecipeCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [desiredQty, setDesiredQty] = useState<number>(1);
  const { toast } = useToast();

  const { totalCost, finalCost } = calculateRecipeCost(recipe, masterIngredients);
  const profitMargin = ((recipe.selling_price - finalCost) / recipe.selling_price * 100).toFixed(1);

  // Calculate scaled ingredients based on desired quantity
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    quantity: ingredient.quantity * desiredQty
  }));

  const scaledTotalCost = totalCost * desiredQty;
  const scaledFinalCost = finalCost * desiredQty;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setDesiredQty(Math.max(1, value));
  };

  const handleToggleVisibility = async () => {
    try {
      await updateRecipeVisibility(recipe.id, !(recipe.is_hidden || false));
      onRecipeUpdated();
      toast({
        title: "Recipe Updated",
        description: `Recipe ${recipe.is_hidden ? 'shown' : 'hidden'} successfully`,
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
    <>
      <Card className={`hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500 ${recipe.is_hidden ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg sm:text-xl text-gray-900">{recipe.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {profitMargin}% Profit
              </Badge>
              <Button
                onClick={handleToggleVisibility}
                size="sm"
                variant="outline"
                className="p-1 h-7 w-7"
                title={recipe.is_hidden ? "Show Recipe" : "Hide Recipe"}
              >
                {recipe.is_hidden ? <Eye size={12} /> : <EyeOff size={12} />}
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                size="sm"
                variant="outline"
                className="p-1 h-7 w-7"
              >
                <Edit size={12} />
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                size="sm"
                variant="outline"
                className="p-1 h-7 w-7 text-red-600 hover:text-red-700"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm text-gray-600">
            Traditional South Indian Podi
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Quantity Calculator */}
            <div className="bg-blue-50 p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Desired Quantity (kg)</span>
              </div>
              <Input
                type="number"
                min="1"
                step="1"
                value={desiredQty}
                onChange={handleQtyChange}
                className="w-full h-8 text-sm"
                placeholder="Enter quantity in kg"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Cost Price:</span>
              <span className="font-semibold text-red-600 flex items-center">
                <IndianRupee size={14} />
                {scaledFinalCost.toFixed(2)}
                {desiredQty !== 1 && <span className="text-xs ml-1">({desiredQty}kg)</span>}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Selling Price:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <IndianRupee size={14} />
                {(recipe.selling_price * desiredQty).toFixed(2)}
                {desiredQty !== 1 && <span className="text-xs ml-1">({desiredQty}kg)</span>}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Ingredients:</span>
              <span className="font-medium">{recipe.ingredients.length} items</span>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Scale size={12} />
                <span>{recipe.calories || 0} kcal/100g</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>6 months shelf</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base"
                size="sm"
              >
                <Eye size={16} className="mr-1 sm:mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-orange-700">{recipe.name}</DialogTitle>
            <DialogDescription>
              Complete recipe details for {desiredQty}kg batch
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingredients & Costs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingredients & Costs ({desiredQty}kg batch)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scaledIngredients.map((ingredient, index) => {
                  const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
                  const pricePerKg = masterIngredient?.price_per_kg || 0;
                  const cost = calculateIngredientCost(ingredient, masterIngredients);
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{ingredient.ingredient_name}</span>
                        <div className="text-xs text-gray-600">
                          {ingredient.quantity}{ingredient.unit} @ ₹{pricePerKg}/kg
                        </div>
                      </div>
                      <span className="font-semibold text-orange-600 ml-2">₹{cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Raw Material Cost:</span>
                  <span className="font-semibold">₹{scaledTotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overheads:</span>
                  <span className="font-semibold">₹{(recipe.overheads * desiredQty).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold text-orange-700">
                  <span>Final Cost:</span>
                  <span>₹{scaledFinalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold text-green-700">
                  <span>Selling Price:</span>
                  <span>₹{(recipe.selling_price * desiredQty).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Preparation & Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preparation Method</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {recipe.preparation || "No preparation method available"}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Nutrition (per 100g)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-700">Calories</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">{recipe.calories || 0}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold text-green-700">Protein</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-800">{recipe.protein || 0}g</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="font-semibold text-yellow-700">Fat</div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-800">{recipe.fat || 0}g</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold text-purple-700">Carbs</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-800">{recipe.carbs || 0}g</div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-orange-600 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-semibold text-orange-800">Storage & Shelf Life</h4>
                    <p className="text-sm text-orange-700 mt-1">{recipe.shelf_life || "N/A"}</p>
                    <p className="text-sm text-orange-700 mt-1">{recipe.storage || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditRecipeDialog
        recipe={recipe}
        masterIngredients={masterIngredients}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onRecipeUpdated={onRecipeUpdated}
      />

      <DeleteRecipeDialog
        recipe={recipe}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onRecipeDeleted={onRecipeUpdated}
      />
    </>
  );
};

export default RecipeCard;
