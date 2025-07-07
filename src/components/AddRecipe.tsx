
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { addRecipeWithIngredients, calculateIngredientCostFromPartial, calculateSellingPrice, type MasterIngredient, type NewIngredient } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface AddRecipeProps {
  masterIngredients: MasterIngredient[];
  onRecipeAdded: () => void;
}

const AddRecipe = ({ masterIngredients, onRecipeAdded }: AddRecipeProps) => {
  const [recipeName, setRecipeName] = useState("");
  const [preparation, setPreparation] = useState("");
  const [overheads, setOverheads] = useState<number>(90);
  const [ingredients, setIngredients] = useState<NewIngredient[]>([
    { ingredient_name: "", quantity: 0, unit: "g" }
  ]);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  const { toast } = useToast();

  // Calculate selling price automatically
  const totalCost = ingredients.reduce((sum, ingredient) => {
    if (!ingredient.ingredient_name || ingredient.quantity <= 0) return sum;
    return sum + calculateIngredientCostFromPartial(ingredient, masterIngredients);
  }, 0);
  
  const finalCost = totalCost + overheads;
  const calculatedSellingPrice = calculateSellingPrice(finalCost);

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient_name: "", quantity: 0, unit: "g" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof NewIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSave = async () => {
    if (!recipeName.trim() || !preparation.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const invalidIngredients = ingredients.filter(ing => 
      !ing.ingredient_name || ing.quantity <= 0 || !masterIngredients.find(master => master.name === ing.ingredient_name)
    );

    if (invalidIngredients.length > 0) {
      toast({
        title: "Invalid Ingredients",
        description: "Please select valid ingredients from the master list with quantities > 0",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate ingredients
    const ingredientNames = ingredients.map(ing => ing.ingredient_name);
    const duplicates = ingredientNames.filter((name, index) => ingredientNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Entry",
        description: `Duplicate ingredients found: ${duplicates.join(', ')}. Please remove duplicates.`,
        variant: "destructive"
      });
      return;
    }

    const newRecipe = {
      name: recipeName,
      preparation: preparation,
      overheads: overheads,
      shelf_life: "6 months in sealed packaging, away from moisture and sunlight",
      storage: "Store in a cool, dry place in an airtight container after opening",
      calories: nutrition.calories || null,
      protein: nutrition.protein || null,
      fat: nutrition.fat || null,
      carbs: nutrition.carbs || null
    };

    try {
      await addRecipeWithIngredients(newRecipe, ingredients, masterIngredients);
      
      // Reset form
      setRecipeName("");
      setPreparation("");
      setOverheads(90);
      setIngredients([{ ingredient_name: "", quantity: 0, unit: "g" }]);
      setNutrition({ calories: 0, protein: 0, fat: 0, carbs: 0 });

      onRecipeAdded();

      toast({
        title: "Recipe Added",
        description: `${newRecipe.name} has been added successfully with selling price ₹${calculatedSellingPrice}!`,
      });
    } catch (error) {
      toast({
        title: "Error adding recipe",
        description: "Failed to add recipe to database",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="text-orange-600" />
            Add New Recipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipeName">Recipe Name *</Label>
              <Input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter recipe name"
              />
            </div>
            <div>
              <Label htmlFor="calculatedSellingPrice">Selling Price (₹/kg) - Auto-calculated</Label>
              <Input
                id="calculatedSellingPrice"
                type="number"
                value={calculatedSellingPrice}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Final Cost × 2 (rounded to 50s & 100s)</p>
            </div>
          </div>

          <div>
            <Label htmlFor="overheads">Overheads (₹)</Label>
            <Input
              id="overheads"
              type="number"
              value={overheads}
              onChange={(e) => setOverheads(Number(e.target.value))}
            />
          </div>

          {/* Cost Preview */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-blue-800 mb-2">Cost Preview</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Raw Material Cost:</span>
                <span>₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overheads:</span>
                <span>₹{overheads}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Final Cost:</span>
                <span>₹{finalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-700">
                <span>Selling Price:</span>
                <span>₹{calculatedSellingPrice}</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Ingredients *</Label>
              <Button onClick={addIngredient} size="sm" variant="outline">
                <Plus size={16} className="mr-1" />
                Add Ingredient
              </Button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={ingredient.ingredient_name}
                      onChange={(e) => updateIngredient(index, 'ingredient_name', e.target.value)}
                    >
                      <option value="">Select ingredient</option>
                      {masterIngredients.map((master) => (
                        <option key={master.id} value={master.name}>
                          {master.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={ingredient.quantity || ""}
                      onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Button
                      onClick={() => removeIngredient(index)}
                      size="sm"
                      variant="outline"
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation */}
          <div>
            <Label htmlFor="preparation">Preparation Method *</Label>
            <Textarea
              id="preparation"
              value={preparation}
              onChange={(e) => setPreparation(e.target.value)}
              placeholder="Describe the preparation method..."
              rows={4}
            />
          </div>

          {/* Nutrition */}
          <div>
            <Label>Nutrition (per 100g)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={nutrition.calories || ""}
                  onChange={(e) => setNutrition({...nutrition, calories: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={nutrition.protein || ""}
                  onChange={(e) => setNutrition({...nutrition, protein: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={nutrition.fat || ""}
                  onChange={(e) => setNutrition({...nutrition, fat: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={nutrition.carbs || ""}
                  onChange={(e) => setNutrition({...nutrition, carbs: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700">
            <Save size={16} className="mr-2" />
            Save Recipe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRecipe;
