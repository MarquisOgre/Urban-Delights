import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Eye, IndianRupee, Scale, Clock, AlertTriangle, Download, FileText } from "lucide-react";
import { Recipe, calculateIngredientCost, calculateRecipeCost, getIngredientPrice } from "@/data/recipes";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { totalCost, finalCost } = calculateRecipeCost(recipe);
  const profitMargin = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice * 100).toFixed(1);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Recipe Details
    const recipeData = [
      ['Recipe Name', recipe.name],
      ['Description', 'Traditional South Indian Podi'],
      ['Selling Price', `₹${recipe.sellingPrice}/kg`],
      ['Final Cost', `₹${finalCost.toFixed(2)}/kg`],
      ['Profit Margin', `${profitMargin}%`],
      ['Shelf Life', recipe.shelfLife],
      [],
      ['Ingredients', '', '', ''],
      ['Name', 'Quantity', 'Unit', 'Cost (₹)']
    ];

    recipe.ingredients.forEach(ingredient => {
      const cost = calculateIngredientCost(ingredient);
      recipeData.push([ingredient.name, ingredient.quantity.toString(), ingredient.unit, cost.toFixed(2)]);
    });

    recipeData.push(
      [],
      ['Total Raw Material Cost', `₹${totalCost.toFixed(2)}`],
      ['Overheads', `₹${recipe.overheads}`],
      ['Final Cost per kg', `₹${finalCost.toFixed(2)}`],
      [],
      ['Nutrition (per 100g)', '', '', ''],
      ['Calories', `${recipe.nutrition.calories} kcal`, '', ''],
      ['Protein', `${recipe.nutrition.protein}g`, '', ''],
      ['Fat', `${recipe.nutrition.fat}g`, '', ''],
      ['Carbs', `${recipe.nutrition.carbs}g`, '', '']
    );

    const ws = XLSX.utils.aoa_to_sheet(recipeData);
    XLSX.utils.book_append_sheet(wb, ws, 'Recipe Details');
    XLSX.writeFile(wb, `${recipe.name.replace(/\s+/g, '_')}_Recipe.xlsx`);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(20);
    pdf.text(recipe.name, 20, 20);
    
    // Basic Info
    pdf.setFontSize(12);
    pdf.text('Traditional South Indian Podi', 20, 35);
    pdf.text(`Selling Price: ₹${recipe.sellingPrice}/kg`, 20, 45);
    pdf.text(`Final Cost: ₹${finalCost.toFixed(2)}/kg`, 20, 55);
    pdf.text(`Profit Margin: ${profitMargin}%`, 20, 65);
    
    // Ingredients table
    const ingredientData = recipe.ingredients.map(ingredient => [
      ingredient.name,
      `${ingredient.quantity}${ingredient.unit}`,
      `₹${getIngredientPrice(ingredient.name)}/kg`,
      `₹${calculateIngredientCost(ingredient).toFixed(2)}`
    ]);

    (pdf as any).autoTable({
      startY: 80,
      head: [['Ingredient', 'Quantity', 'Price/kg', 'Cost']],
      body: ingredientData,
    });

    // Cost breakdown
    const finalY = (pdf as any).lastAutoTable.finalY + 20;
    pdf.text(`Total Raw Material Cost: ₹${totalCost.toFixed(2)}`, 20, finalY);
    pdf.text(`Overheads: ₹${recipe.overheads}`, 20, finalY + 10);
    pdf.text(`Final Cost per kg: ₹${finalCost.toFixed(2)}`, 20, finalY + 20);
    
    // Nutrition
    pdf.text('Nutrition (per 100g):', 20, finalY + 40);
    pdf.text(`Calories: ${recipe.nutrition.calories} kcal`, 20, finalY + 50);
    pdf.text(`Protein: ${recipe.nutrition.protein}g`, 20, finalY + 60);
    pdf.text(`Fat: ${recipe.nutrition.fat}g`, 20, finalY + 70);
    pdf.text(`Carbs: ${recipe.nutrition.carbs}g`, 20, finalY + 80);

    pdf.save(`${recipe.name.replace(/\s+/g, '_')}_Recipe.pdf`);
  };

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
                {finalCost.toFixed(2)}/kg
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
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                <Eye size={16} className="mr-2" />
                View Details
              </Button>
              <Button 
                onClick={exportToExcel}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <FileText size={16} />
              </Button>
              <Button 
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Download size={16} />
              </Button>
            </div>
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
                {recipe.ingredients.map((ingredient, index) => {
                  const pricePerKg = getIngredientPrice(ingredient.name);
                  const cost = calculateIngredientCost(ingredient);
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-sm">{ingredient.name}</span>
                        <div className="text-xs text-gray-600">
                          {ingredient.quantity}{ingredient.unit} @ ₹{pricePerKg}/kg
                        </div>
                      </div>
                      <span className="font-semibold text-orange-600">₹{cost.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Raw Material Cost:</span>
                  <span className="font-semibold">₹{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overheads:</span>
                  <span className="font-semibold">₹{recipe.overheads}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-orange-700">
                  <span>Final Cost:</span>
                  <span>₹{finalCost.toFixed(2)}/kg</span>
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
