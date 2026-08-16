import { supabase } from "@/integrations/supabase/client";

export interface RecipePricing {
  id: string;
  recipe_name: string;
  quantity_type: string;
  price: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchRecipePricing = async (): Promise<RecipePricing[]> => {
  const { data, error } = await supabase
    .from('recipe_pricing')
    .select('*')
    .order('recipe_name');
  if (error) throw error;
  return (data || []) as RecipePricing[];
};

export const updateRecipePrice = async (id: string, price: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('recipe_pricing')
      .update({ price, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating recipe price:', error);
    throw error;
  }
};

export const updateRecipeEnabled = async (id: string, isEnabled: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('recipe_pricing')
      .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating recipe enabled status:', error);
    throw error;
  }
};

export const createPricingForRecipe = async (recipeName: string, quantityTypes: string[]): Promise<void> => {
  const rows = quantityTypes.map((quantity_type) => ({
    recipe_name: recipeName,
    quantity_type,
    price: 0,
    is_enabled: true,
  }));
  const { error } = await supabase.from('recipe_pricing').insert(rows);
  if (error) throw error;
};
