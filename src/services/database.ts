import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { HARDCODED_MASTER_INGREDIENTS, HARDCODED_RECIPES } from '@/data/hardcodedData';

export type MasterIngredient = Database['public']['Tables']['master_ingredients']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];

export interface RecipeIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface RecipeWithIngredients extends Omit<Recipe, 'ingredients'> {
  ingredients: RecipeIngredient[];
}

export interface NewRecipe {
  name: string;
  preparation: string;
  overheads: number;
  shelf_life?: string;
  storage?: string;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
}

export interface NewIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

// ✅ Export all master ingredients (hardcoded)
export const getAllIngredients = async (): Promise<Pick<MasterIngredient, 'name' | 'brand' | 'price_per_kg'>[]> => {
  return HARDCODED_MASTER_INGREDIENTS.map(i => ({
    name: i.name,
    brand: i.brand,
    price_per_kg: i.price_per_kg,
  }));
};

// Return hardcoded master ingredients
export const fetchMasterIngredients = async (): Promise<MasterIngredient[]> => {
  return HARDCODED_MASTER_INGREDIENTS as MasterIngredient[];
};

// Return hardcoded recipes
export const fetchRecipesWithIngredients = async (): Promise<RecipeWithIngredients[]> => {
  return HARDCODED_RECIPES.map(recipe => ({
    ...recipe,
    description: recipe.description || null,
    preparation: recipe.preparation || null,
    shelf_life: recipe.shelf_life || null,
    storage: recipe.storage || null,
    calories: recipe.calories || null,
    protein: recipe.protein || null,
    fat: recipe.fat || null,
    carbs: recipe.carbs || null,
    is_hidden: recipe.is_hidden || null,
    yield_output: recipe.yield_output || null,
  })) as RecipeWithIngredients[];
};

export const calculateSellingPrice = (finalCost: number): number => {
  return finalCost * 2;
};

export const calculateIngredientCost = (
  ingredient: RecipeIngredient,
  masterIngredients: MasterIngredient[]
): number => {
  const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
  if (!masterIngredient) return 0;

  const pricePerKg = masterIngredient.price_per_kg;
  let quantityInKg = ingredient.quantity;

  if (ingredient.unit === 'g') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'ml') {
    quantityInKg = ingredient.quantity / 1000;
  }

  return quantityInKg * pricePerKg;
};

export const calculateIngredientCostFromPartial = (
  ingredient: NewIngredient,
  masterIngredients: MasterIngredient[]
): number => {
  const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
  if (!masterIngredient) return 0;

  const pricePerKg = masterIngredient.price_per_kg;
  let quantityInKg = ingredient.quantity;

  if (ingredient.unit === 'g') {
    quantityInKg = ingredient.quantity / 1000;
  } else if (ingredient.unit === 'ml') {
    quantityInKg = ingredient.quantity / 1000;
  }

  return quantityInKg * pricePerKg;
};

export const calculateRecipeCost = (
  recipe: RecipeWithIngredients,
  masterIngredients: MasterIngredient[]
): { totalCost: number; finalCost: number } => {
  const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCost(ingredient, masterIngredients);
  }, 0);

  const finalCost = totalCost + recipe.overheads;
  return { totalCost, finalCost };
};

export const addMasterIngredient = async (
  name: string,
  pricePerKg: number,
  brand?: string
): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .insert({ name, price_per_kg: pricePerKg, brand });
  if (error) throw error;
};

export const updateMasterIngredient = async (
  id: string,
  pricePerKg: number,
  brand?: string
): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .update({ price_per_kg: pricePerKg, brand, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const upsertMasterIngredient = async (
  name: string,
  pricePerKg: number,
  brand?: string
): Promise<void> => {
  const { data: existing } = await supabase
    .from('master_ingredients')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) {
    await updateMasterIngredient(existing.id, pricePerKg, brand);
  } else {
    await addMasterIngredient(name, pricePerKg, brand);
  }
};

export const updateMasterIngredientPrice = async (
  id: string,
  pricePerKg: number
): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .update({ price_per_kg: pricePerKg, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteMasterIngredient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('master_ingredients')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const addRecipeWithIngredients = async (
  recipe: NewRecipe,
  ingredients: NewIngredient[],
  masterIngredients: MasterIngredient[]
): Promise<void> => {
  const totalCost = ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCostFromPartial(ingredient, masterIngredients);
  }, 0);

  const finalCost = totalCost + recipe.overheads;
  const sellingPrice = calculateSellingPrice(finalCost);

  const { error: recipeError } = await supabase
    .from('recipes')
    .insert([{ 
      ...recipe, 
      selling_price: sellingPrice,
      ingredients: ingredients as any
    }]);

  if (recipeError) throw recipeError;
};

export const updateRecipeVisibility = async (
  recipeId: string,
  isHidden: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('recipes')
    .update({
      is_hidden: isHidden,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipeId);
  if (error) throw error;
};
