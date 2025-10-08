
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculateRecipeCost, calculateSellingPrice, type RecipeWithIngredients, type MasterIngredient } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface EditIngredient {
  id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface EditRecipeDialogProps {
  recipe: RecipeWithIngredients;
  masterIngredients: MasterIngredient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeUpdated: () => void;
}

const EditRecipeDialog = ({ recipe, masterIngredients, open, onOpenChange, onRecipeUpdated }: EditRecipeDialogProps) => {
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [preparation, setPreparation] = useState("");
  const [overheads, setOverheads] = useState<number>(100);
  const [ingredients, setIngredients] = useState<EditIngredient[]>([]);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  });
  const [autoCalculatePrice, setAutoCalculatePrice] = useState(true);
  const [manualSellingPrice, setManualSellingPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Calculate selling price automatically
  const { finalCost } = calculateRecipeCost({
    ...recipe,
    ingredients: ingredients.map(ing => ({
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity,
      unit: ing.unit
    })),
    overheads
  }, masterIngredients);

  const calculatedSellingPrice = calculateSellingPrice(finalCost);
  const displaySellingPrice = autoCalculatePrice ? calculatedSellingPrice : manualSellingPrice;

  useEffect(() => {
    if (open && recipe) {
      setRecipeName(recipe.name);
      setDescription((recipe as any).description || "");
      setPreparation(recipe.preparation || "");
      setOverheads(recipe.overheads);
      setIngredients(recipe.ingredients.map((ing, index) => ({
        id: `ing-${index}`,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit
      })));
      setNutrition({
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        fat: recipe.fat || 0,
        carbs: recipe.carbs || 0
      });
      setAutoCalculatePrice(true);
    }
  }, [open, recipe]);

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient_name: "", quantity: 0, unit: "g" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof EditIngredient, value: string | number) => {
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

    setLoading(true);

    try {
      // Update recipe with ingredients in JSONB
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          name: recipeName,
          description: description || "Traditional South Indian Podi",
          preparation: preparation,
          selling_price: displaySellingPrice,
          overheads: overheads,
          calories: nutrition.calories || null,
          protein: nutrition.protein || null,
          fat: nutrition.fat || null,
          carbs: nutrition.carbs || null,
          ingredients: ingredients.map(ing => ({
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit
          })),
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id);

      if (recipeError) throw recipeError;

      onRecipeUpdated();
      onOpenChange(false);

      toast({
        title: "Recipe Updated",
        description: `${recipeName} has been updated successfully!`,
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast({
        title: "Error updating recipe",
        description: "Failed to update recipe in database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="text-orange-600" />
            Edit Recipe
          </DialogTitle>
          <DialogDescription>
            Update recipe details. You can choose to auto-calculate or manually set the selling price.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info: Recipe Name & Description Side by Side */}
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Traditional South Indian Podi"
              />
            </div>
          </div>

          {/* Selling Price & Overheads Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sellingPrice">Selling Price (₹/kg)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Auto Calculate</span>
                  <Switch
                    checked={autoCalculatePrice}
                    onCheckedChange={setAutoCalculatePrice}
                  />
                </div>
              </div>
              <Input
                id="sellingPrice"
                type="number"
                step="1"
                value={Math.round(displaySellingPrice)}
                onChange={(e) => setManualSellingPrice(Number(e.target.value))}
                readOnly={autoCalculatePrice}
                className={autoCalculatePrice ? "bg-gray-100" : ""}
              />
              {autoCalculatePrice && (
                <p className="text-xs text-gray-500 mt-1">Final Cost × 2</p>
              )}
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

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              <Save size={16} className="mr-2" />
              {loading ? "Updating..." : "Update Recipe"}
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeDialog;
