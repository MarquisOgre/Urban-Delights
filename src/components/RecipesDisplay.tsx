import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { type RecipeWithIngredients } from '@/services/database';

interface RecipesDisplayProps {
  recipes: RecipeWithIngredients[];
  onExport?: () => void;
}

const RecipesDisplay: React.FC<RecipesDisplayProps> = ({ recipes, onExport }) => {
  const visibleRecipes = recipes.filter(recipe => !recipe.is_hidden);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Quantities</h1>
          <p className="text-gray-600 mt-1">All available recipes and their details</p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleRecipes.map((recipe) => (
          <Card key={recipe.id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 truncate" title={recipe.name}>
                {recipe.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Price:</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  ₹{recipe.selling_price}
                </Badge>
              </div>
              
              {recipe.calories && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Calories:</span>
                  <span className="font-medium">{recipe.calories}</span>
                </div>
              )}
              
              {recipe.shelf_life && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Shelf Life:</span>
                  <span className="font-medium text-green-600">{recipe.shelf_life}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ingredients:</span>
                <span className="font-medium">{recipe.ingredients.length}</span>
              </div>

              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No recipes available</p>
          <p className="text-gray-400 text-sm mt-2">Add some recipes to get started</p>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Ingredient Requirements Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-gray-700">Ingredient</th>
                  <th className="text-left p-2 font-medium text-gray-700">Total Weight</th>
                  <th className="text-left p-2 font-medium text-gray-700">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Grand Total</td>
                  <td className="p-2">0 g</td>
                  <td className="p-2">₹0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">Export</Button>
            <Button variant="outline" size="sm">Print</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipesDisplay;