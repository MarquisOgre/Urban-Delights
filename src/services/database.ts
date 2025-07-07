
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MasterIngredient = Tables<'master_ingredients'>;
export type Recipe = Tables<'recipes'>;
export type RecipeIngredient = Tables<'recipe_ingredients'>;

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
}

// Fetch all master ingredients
export const fetchMasterIngredients = async (): Promise<MasterIngredient[]> => {
  const { data, error } = await supabase
    .from('master_ingredients')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching master ingredients:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch all recipes with their ingredients
export const fetchRecipesWithIngredients = async (): Promise<RecipeWithIngredients[]> => {
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .order('name');
  
  if (recipesError) {
    console.error('Error fetching recipes:', recipesError);
    throw recipesError;
  }

  const { data: recipeIngredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('*');
  
  if (ingredientsError) {
    console.error('Error fetching recipe ingredients:', ingredientsError);
    throw ingredientsError;
  }

  // Group ingredients by recipe_id
  const ingredientsByRecipe = recipeIngredients?.reduce((acc, ingredient) => {
    if (!acc[ingredient.recipe_id]) {
      acc[ingredient.recipe_id] = [];
    }
    acc[ingredient.recipe_id].push(ingredient);
    return acc;
  }, {} as Record<string, RecipeIngredient[]>) || {};

  // Combine recipes with their ingredients
  return recipes?.map(recipe => ({
    ...recipe,
    ingredients: ingredientsByRecipe[recipe.id] || []
  })) || [];
};

// Add new master ingredient
export const addMasterIngredient = async (name: string, pricePerKg: number): Promise<MasterIngredient> => {
  const { data, error } = await supabase
    .from('master_ingredients')
    .insert({ name, price_per_kg: pricePerKg })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding master ingredient:', error);
    throw error;
  }
  
  return data;
};

// Update master ingredient price
export const updateMasterIngredientPrice = async (id: string, pricePerKg: number): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .update({ price_per_kg: pricePerKg, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating master ingredient price:', error);
    throw error;
  }
};

// Delete master ingredient
export const deleteMasterIngredient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting master ingredient:', error);
    throw error;
  }
};

// Helper type for new ingredients (without database-generated fields)
export interface NewIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

// Add new recipe with ingredients (auto-calculate selling price)
export const addRecipeWithIngredients = async (
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'selling_price'>,
  ingredients: NewIngredient[],
  masterIngredients: MasterIngredient[]
): Promise<RecipeWithIngredients> => {
  // Calculate selling price
  const totalCost = ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCostFromPartial(ingredient, masterIngredients);
  }, 0);
  
  const finalCost = totalCost + recipe.overheads;
  const sellingPrice = calculateSellingPrice(finalCost);

  // Insert recipe first
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      ...recipe,
      selling_price: sellingPrice
    })
    .select()
    .single();
  
  if (recipeError) {
    console.error('Error adding recipe:', recipeError);
    throw recipeError;
  }

  // Insert ingredients
  const ingredientsWithRecipeId = ingredients.map(ingredient => ({
    ...ingredient,
    recipe_id: newRecipe.id
  }));

  const { data: newIngredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .insert(ingredientsWithRecipeId)
    .select();
  
  if (ingredientsError) {
    console.error('Error adding recipe ingredients:', ingredientsError);
    throw ingredientsError;
  }

  return {
    ...newRecipe,
    ingredients: newIngredients || []
  };
};

// Helper function to calculate selling price with proper rounding and minimum profit margin
export const calculateSellingPrice = (finalCost: number): number => {
  // Base selling price with 2x multiplier
  let sellingPrice = finalCost * 2;
  
  // Round to nearest fifty or hundred based on value
  if (sellingPrice <= 50) {
    // For amounts 1-50, round to 0 (but ensure minimum viable price)
    sellingPrice = Math.max(50, Math.ceil(sellingPrice / 50) * 50);
  } else if (sellingPrice <= 100) {
    // For amounts 51-100, round to 100
    sellingPrice = 100;
  } else {
    // For amounts > 100, round to nearest 100
    sellingPrice = Math.ceil(sellingPrice / 100) * 100;
  }
  
  // Ensure minimum 50% profit margin (selling price should be at least 1.5x final cost)
  const minimumSellingPrice = finalCost * 1.5;
  if (sellingPrice < minimumSellingPrice) {
    // Round the minimum price using the same logic
    if (minimumSellingPrice <= 50) {
      sellingPrice = Math.max(50, Math.ceil(minimumSellingPrice / 50) * 50);
    } else if (minimumSellingPrice <= 100) {
      sellingPrice = 100;
    } else {
      sellingPrice = Math.ceil(minimumSellingPrice / 100) * 100;
    }
  }
  
  return sellingPrice;
};

// Calculate ingredient cost from partial ingredient data (for new recipes)
export const calculateIngredientCostFromPartial = (ingredient: NewIngredient, masterIngredients: MasterIngredient[]): number => {
  const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
  if (!masterIngredient) return 0;

  let quantityInKg = ingredient.quantity;
  if (ingredient.unit === 'g') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'ml') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'l') {
    quantityInKg = ingredient.quantity;
  }

  return quantityInKg * masterIngredient.price_per_kg;
};

// Calculate ingredient cost from full RecipeIngredient (for existing recipes)
export const calculateIngredientCost = (ingredient: RecipeIngredient, masterIngredients: MasterIngredient[]): number => {
  const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
  if (!masterIngredient) return 0;

  let quantityInKg = ingredient.quantity;
  if (ingredient.unit === 'g') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'ml') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'l') {
    quantityInKg = ingredient.quantity;
  }

  return quantityInKg * masterIngredient.price_per_kg;
};

// Calculate recipe cost
export const calculateRecipeCost = (recipe: RecipeWithIngredients, masterIngredients: MasterIngredient[]) => {
  const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCost(ingredient, masterIngredients);
  }, 0);

  const finalCost = totalCost + recipe.overheads;

  return { totalCost, finalCost };
};
