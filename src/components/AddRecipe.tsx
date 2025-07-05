
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { masterIngredients, addNewRecipe } from "@/data/recipes";
import { useToast } from "@/hooks/use-toast";

interface NewIngredient {
  name: string;
  quantity: number;
  unit: string;
}

const AddRecipe = () => {
  const [recipeName, setRecipeName] = useState("");
  const [preparation, setPreparation] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [overheads, setOverheads] = useState<number>(90);
  const [ingredients, setIngredients] = useState<NewIngredient[]>([
    { name: "", quantity: 0, unit: "g" }
  ]);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  const { toast } = useToast();

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: "g" }]);
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

  const handleSave = () => {
    if (!recipeName.trim() || !preparation.trim() || sellingPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const invalidIngredients = ingredients.filter(ing => 
      !ing.name || ing.quantity <= 0 || !masterIngredients.find(master => master.name === ing.name)
    );

    if (invalidIngredients.length > 0) {
      toast({
        title: "Invalid Ingredients",
        description: "Please select valid ingredients from the master list with quantities > 0",
        variant: "destructive"
      });
      return;
    }

    const newRecipe = {
      id: Date.now(),
      name: recipeName,
      ingredients: ingredients,
      preparation: preparation,
      sellingPrice: sellingPrice,
      overheads: overheads,
      nutrition: nutrition,
      shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
      storage: "Store in a cool, dry place in an airtight container after opening"
    };

    addNewRecipe(newRecipe);
    
    // Reset form
    setRecipeName("");
    setPreparation("");
    setSellingPrice(0);
    setOverheads(90);
    setIngredients([{ name: "", quantity: 0, unit: "g" }]);
    setNutrition({ calories: 0, protein: 0, fat: 0, carbs: 0 });

    toast({
      title: "Recipe Added",
      description: `${newRecipe.name} has been added successfully!`,
    });
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
              <Label htmlFor="sellingPrice">Selling Price (₹/kg) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={sellingPrice || ""}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                placeholder="Enter selling price"
              />
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
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    >
                      <option value="">Select ingredient</option>
                      {masterIngredients.map((master) => (
                        <option key={master.name} value={master.name}>
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
