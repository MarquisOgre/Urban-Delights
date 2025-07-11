import { upsertMasterIngredient } from "@/services/database";
import { masterIngredientsData } from "@/data/masterIngredients";

export const addAllIngredients = async () => {
  const results = [];
  
  for (const ingredient of masterIngredientsData) {
    try {
      await upsertMasterIngredient(ingredient.name, ingredient.price, ingredient.brand);
      results.push({ success: true, name: ingredient.name });
    } catch (error) {
      results.push({ success: false, name: ingredient.name, error });
    }
  }
  
  return results;
};