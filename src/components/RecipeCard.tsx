
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Eye, IndianRupee, Scale, Clock, AlertTriangle } from "lucide-react";
import { Recipe } from "@/data/recipes";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const profitMargin = ((recipe.sellingPrice - recipe.finalCost) / recipe.sellingPrice * 100).toFixed(1);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl text-gray-900">{recipe.name}</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {profitMargin}% Profit
            </Badge>
          </div>
          <CardDescription className="text-sm text-gray-600">
            Traditional South Indian Podi
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Cost Price:</span>
              <span className="font-semibold text-red-600 flex items-center">
                <IndianRupee size={14} />
                {recipe.finalCost}/kg
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Selling Price:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <IndianRupee size={14} />
                {recipe.sellingPrice}/kg
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
            
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
              size="sm"
            >
              <Eye size={16} className="mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-700">{recipe.name}</DialogTitle>
            <DialogDescription>
              Complete recipe details with ingredients, costs, and nutritional information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ingredients & Costs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingredients & Costs</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-sm">{ingredient.name}</span>
                      <div className="text-xs text-gray-600">
                        {ingredient.quantity}{ingredient.unit} @ ₹{ingredient.pricePerKg}/kg
                      </div>
                    </div>
                    <span className="font-semibold text-orange-600">₹{ingredient.cost}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Raw Material Cost:</span>
                  <span className="font-semibold">₹{recipe.totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overheads:</span>
                  <span className="font-semibold">₹{recipe.overheads}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-orange-700">
                  <span>Final Cost:</span>
                  <span>₹{recipe.finalCost}/kg</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-700">
                  <span>Selling Price:</span>
                  <span>₹{recipe.sellingPrice}/kg</span>
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
                  <div className="text-2xl font-bold text-blue-800">{recipe.nutrition.calories}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold text-green-700">Protein</div>
                  <div className="text-2xl font-bold text-green-800">{recipe.nutrition.protein}g</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="font-semibold text-yellow-700">Fat</div>
                  <div className="text-2xl font-bold text-yellow-800">{recipe.nutrition.fat}g</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold text-purple-700">Carbs</div>
                  <div className="text-2xl font-bold text-purple-800">{recipe.nutrition.carbs}g</div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-orange-600 mt-1" size={16} />
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
