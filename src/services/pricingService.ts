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

/** Convert a quantity such as "1 Kg", "250grms", "200 g" or "1.6 Kg" to kilograms. */
export const quantityToKg = (quantityType: string): number => {
  const value = String(quantityType || '').trim().toLowerCase().replace(/,/g, '');
  const match = value.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|g|gm|gms|gram|grams|grm|grms)\b/);

  if (!match) return 0;

  const quantity = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  return unit.startsWith('k') ? quantity : quantity / 1000;
};

/** Convert a package price into its equivalent rate per kilogram. */
export const ratePerKg = (price: number, quantityType: string): number => {
  const kg = quantityToKg(quantityType);
  return kg > 0 ? Number(price || 0) / kg : 0;
};

/** Calculate an amount from a quantity and a per-kg rate. */
export const amountFromQuantityAndRate = (quantityType: string, rate: number): number => {
  const kg = quantityToKg(quantityType);
  return kg > 0 ? kg * Number(rate || 0) : 0;
};

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
