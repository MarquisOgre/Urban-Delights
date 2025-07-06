
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Eye, IndianRupee, Scale, Clock, AlertTriangle, FileText, Calculator } from "lucide-react";
import { Recipe, calculateIngredientCost, calculateRecipeCost, getIngredientPrice } from "@/data/recipes";
import * as XLSX from 'xlsx';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [desiredQty, setDesiredQty] = useState<number>(1);

  const { totalCost, finalCost } = calculateRecipeCost(recipe);
  const profitMargin = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice * 100).toFixed(1);

  // Calculate scaled ingredients based on desired quantity
  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    quantity: ingredient.quantity * desiredQty
  }));

  const scaledTotalCost = totalCost * desiredQty;
  const scaledFinalCost = finalCost * desiredQty;

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Recipe Details with logo and tagline
    const recipeData = [
      ['Artisan Delights - Traditional South Indian Podi Collection'],
      [''],
      ['Recipe Name', recipe.name],
      ['Description', 'Traditional South Indian Podi'],
      ['Desired Quantity', `${desiredQty} kg`],
      ['Selling Price', `₹${recipe.sellingPrice * desiredQty}`],
      ['Final Cost', `₹${scaledFinalCost.toFixed(2)}`],
      ['Profit Margin', `${profitMargin}%`],
      ['Shelf Life', recipe.shelfLife],
      [],
      ['Ingredients', '', '', ''],
      ['Name', 'Quantity', 'Unit', 'Cost (₹)']
    ];

    scaledIngredients.forEach(ingredient => {
      const cost = calculateIngredientCost(ingredient);
      recipeData.push([ingredient.name, ingredient.quantity.toString(), ingredient.unit, cost.toFixed(2)]);
    });

    recipeData.push(
      [],
      ['Total Raw Material Cost', `₹${scaledTotalCost.toFixed(2)}`],
      ['Overheads', `₹${recipe.overheads * desiredQty}`],
      ['Final Cost', `₹${scaledFinalCost.toFixed(2)}`],
      [],
      ['Nutrition (per 100g)', '', '', ''],
      ['Calories', `${recipe.nutrition.calories} kcal`, '', ''],
      ['Protein', `${recipe.nutrition.protein}g`, '', ''],
      ['Fat', `${recipe.nutrition.fat}g`, '', ''],
      ['Carbs', `${recipe.nutrition.carbs}g`, '', '']
    );

    const ws = XLSX.utils.aoa_to_sheet(recipeData);
    XLSX.utils.book_append_sheet(wb, ws, 'Recipe Details');
    XLSX.writeFile(wb, `${recipe.name.replace(/\s+/g, '_')}_${desiredQty}kg_Recipe.xlsx`);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg sm:text-xl text-gray-900">{recipe.name}</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              {profitMargin}% Profit
            </Badge>
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
                min="0.1"
                step="0.1"
                value={desiredQty}
                onChange={(e) => setDesiredQty(parseFloat(e.target.value) || 1)}
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
                {(recipe.sellingPrice * desiredQty).toFixed(2)}
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
                <span>{recipe.nutrition.calories} kcal/100g</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>6 months shelf</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-sm sm:text-base"
                size="sm"
              >
                <Eye size={16} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">Details</span>
              </Button>
              <Button 
                onClick={exportToExcel}
                variant="outline"
                size="sm"
                className="px-2 sm:px-3"
              >
                <FileText size={16} />
                <span className="hidden sm:inline ml-2">Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scaledIngredients.map((ingredient, index) => {
                  const pricePerKg = getIngredientPrice(ingredient.name);
                  const cost = calculateIngredientCost(ingredient);
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{ingredient.name}</span>
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
                  <span>₹{(recipe.sellingPrice * desiredQty).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Preparation & Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preparation Method</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {recipe.preparation}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Nutrition (per 100g)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-700">Calories</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-800">{recipe.nutrition.calories}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold text-green-700">Protein</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-800">{recipe.nutrition.protein}g</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="font-semibent text-yellow-700">Fat</div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-800">{recipe.nutrition.fat}g</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold text-purple-700">Carbs</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-800">{recipe.nutrition.carbs}g</div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-orange-600 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-semibold text-orange-800">Storage & Shelf Life</h4>
                    <p className="text-sm text-orange-700 mt-1">{recipe.shelfLife}</p>
                    <p className="text-sm text-orange-700 mt-1">{recipe.storage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecipeCard;
