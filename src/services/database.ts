import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ingredients as initialIngredients } from '@/data/Ingredients';
import { recipes as initialRecipes } from '@/data/Recipes';

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
  // First, load initial ingredients
  const initialData: MasterIngredient[] = initialIngredients.map((ing, index) => ({
    id: `init-${index}`,
    ...ing,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Then fetch from Supabase database
  try {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Error fetching from Supabase, using initial data only:', error);
      return initialData;
    }

    // Merge initial data with database data
    // Remove duplicates by name, preferring database data over initial
    const dbData = data || [];
    const mergedData = [...initialData];
    
    dbData.forEach(dbItem => {
      const existingIndex = mergedData.findIndex(item => item.name === dbItem.name);
      if (existingIndex >= 0) {
        // Replace initial with database version
        mergedData[existingIndex] = dbItem;
      } else {
        // Add new database item
        mergedData.push(dbItem);
      }
    });

    return mergedData.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Error connecting to Supabase, using initial data only:', error);
    return initialData;
  }
};

export const fetchRecipesWithIngredients = async (): Promise<RecipeWithIngredients[]> => {
  // First, load initial recipes
  const initialData: RecipeWithIngredients[] = initialRecipes.map((recipe, index) => ({
    id: `init-${index}`,
    ...recipe,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Then fetch from Supabase database
  try {
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .order('name');

    if (recipesError) {
      console.warn('Error fetching recipes from Supabase, using initial data only:', recipesError);
      return initialData;
    }

    // Parse ingredients from JSONB column
    const dbRecipes: RecipeWithIngredients[] = recipes.map(recipe => ({
      ...recipe,
      ingredients: Array.isArray(recipe.ingredients) 
        ? (recipe.ingredients as any[]).map(ing => ({
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        : []
    }));

    // Merge initial data with database data
    // Remove duplicates by name, preferring database data over initial
    const mergedRecipes = [...initialData];
    
    dbRecipes.forEach(dbRecipe => {
      const existingIndex = mergedRecipes.findIndex(recipe => recipe.name === dbRecipe.name);
      if (existingIndex >= 0) {
        // Replace initial with database version
        mergedRecipes[existingIndex] = dbRecipe;
      } else {
        // Add new database recipe
        mergedRecipes.push(dbRecipe);
      }
    });

    return mergedRecipes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Error connecting to Supabase, using initial data only:', error);
    return initialData;
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
