import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, IndianRupee, TrendingUp } from "lucide-react";

interface CalculatorIngredient {
  name: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
  cost: number;
}

const CostCalculator = () => {
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState<CalculatorIngredient[]>([]);
  const [overheads, setOverheads] = useState(90);
  const [profitMargin, setProfitMargin] = useState(50);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: 0, unit: "g", pricePerKg: 0, cost: 0 }
    ]);
  };

  const updateIngredient = (index: number, field: keyof CalculatorIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate cost when quantity or price changes
    if (field === 'quantity' || field === 'pricePerKg') {
      const quantity = updated[index].quantity / 1000; // Convert g to kg
      updated[index].cost = Math.round(quantity * updated[index].pricePerKg * 100) / 100;
    }
    
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const totalRawCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  const totalCost = totalRawCost + overheads;
  const sellingPrice = totalCost * (1 + profitMargin / 100);
  const actualProfitMargin = totalCost > 0 ? ((sellingPrice - totalCost) / sellingPrice * 100) : 0;

  const clearCalculator = () => {
    setRecipeName("");
    setIngredients([]);
    setOverheads(90);
    setProfitMargin(50);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="text-orange-600" />
            Recipe Cost Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipe Name */}
          <div>
            <Label htmlFor="recipeName">Recipe Name</Label>
            <Input
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Enter recipe name..."
            />
          </div>

          {/* Ingredients Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <Button onClick={addIngredient} size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Plus size={16} className="mr-2" />
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs">Ingredient Name</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="Enter ingredient name"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Quantity (g)</Label>
                    <Input
                      type="number"
                      value={ingredient.quantity || ""}
                      onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Price per Kg (₹)</Label>
                    <Input
                      type="number"
                      value={ingredient.pricePerKg || ""}
                      onChange={(e) => updateIngredient(index, 'pricePerKg', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Cost (₹)</Label>
                      <div className="flex items-center h-10 px-3 bg-white border rounded-md">
                        <IndianRupee size={14} className="text-gray-500 mr-1" />
                        <span className="font-semibold text-green-600">
                          {ingredient.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {ingredients.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                <p>No ingredients added yet. Click "Add Ingredient" to start.</p>
              </div>
            )}
          </div>

          {/* Cost Calculation */}
          {ingredients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cost Parameters</h3>
                
                <div>
                  <Label htmlFor="overheads">Overheads (₹)</Label>
                  <Input
                    id="overheads"
                    type="number"
                    value={overheads}
                    onChange={(e) => setOverheads(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="profitMargin">Target Profit Margin (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                  />
                </div>

                <Button onClick={clearCalculator} variant="outline" className="w-full">
                  Clear Calculator
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cost Breakdown</h3>
                
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Raw Material Cost:</span>
                    <span className="font-semibold">₹{totalRawCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Overheads:</span>
                    <span className="font-semibold">₹{overheads.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Cost:</span>
                    <span className="font-bold text-red-600">₹{totalCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Selling Price:</span>
                    <span className="font-bold text-green-600">₹{sellingPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Actual Profit:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <TrendingUp size={14} className="mr-1" />
                      {actualProfitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculator;