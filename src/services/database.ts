import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { 
  saveMasterIngredients, 
  getMasterIngredients, 
  saveRecipes, 
  getRecipes 
} from './localStorageService';

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

// ✅ NEW: Export all master ingredients
export const getAllIngredients = async (): Promise<Pick<MasterIngredient, 'name' | 'brand' | 'price_per_kg'>[]> => {
  const { data, error } = await supabase
    .from('master_ingredients')
    .select('name, brand, price_per_kg')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchMasterIngredients = async (): Promise<MasterIngredient[]> => {
  try {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    
    // Save to localStorage for offline access
    if (data) {
      saveMasterIngredients(data);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching from database, trying localStorage:', error);
    
    // Fallback to localStorage
    const cachedData = getMasterIngredients<MasterIngredient[]>();
    if (cachedData) {
      console.log('Using cached master ingredients');
      return cachedData;
    }
    
    throw error;
  }
};

export const fetchRecipesWithIngredients = async (): Promise<RecipeWithIngredients[]> => {
  try {
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .order('name');

    if (recipesError) throw new Error(recipesError.message);

    // Parse ingredients from JSONB column
    const dbRecipes: RecipeWithIngredients[] = (recipes || []).map(recipe => ({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) 
        ? (recipe.ingredients as any[]).map(ing => ({
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        : []
    }));

    // Save to localStorage for offline access
    if (dbRecipes.length > 0) {
      saveRecipes(dbRecipes);
    }

    return dbRecipes;
  } catch (error) {
    console.error('Error fetching from database, trying localStorage:', error);
    
    // Fallback to localStorage
    const cachedData = getRecipes<RecipeWithIngredients[]>();
    if (cachedData) {
      console.log('Using cached recipes');
      return cachedData;
    }
    
    throw error;
  }
};

export const calculateSellingPrice = (finalCost: number): number => {
  return finalCost * 2; // Simplified markup
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

  // Insert recipe with ingredients as JSONB
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
