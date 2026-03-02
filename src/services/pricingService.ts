import { supabase } from "@/integrations/supabase/client";
import { HARDCODED_PRICING } from '@/data/hardcodedData';

export interface RecipePricing {
  id: string;
  recipe_name: string;
  quantity_type: string;
  price: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Return hardcoded pricing data
export const fetchRecipePricing = async (): Promise<RecipePricing[]> => {
  return HARDCODED_PRICING as RecipePricing[];
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
