import { supabase } from "@/integrations/supabase/client";
import { saveRecipePricing, getRecipePricing } from './localStorageService';

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
  try {
    const { data, error } = await supabase
      .from('recipe_pricing')
      .select('*')
      .order('recipe_name', { ascending: true });
    
    if (error) throw error;
    
    // Save to localStorage for offline access
    if (data) {
      saveRecipePricing(data);
    }
    
    return (data || []) as RecipePricing[];
  } catch (error) {
    console.error('Error fetching recipe pricing, trying localStorage:', error);
    
    // Fallback to localStorage
    const cachedData = getRecipePricing<RecipePricing[]>();
    if (cachedData) {
      console.log('Using cached recipe pricing');
      return cachedData;
    }
    
    return [];
  }
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