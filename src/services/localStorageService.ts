// Local Storage Keys
const STORAGE_KEYS = {
  MASTER_INGREDIENTS: 'artisan_master_ingredients',
  RECIPES: 'artisan_recipes',
  RECIPE_PRICING: 'artisan_recipe_pricing',
  LAST_SYNC: 'artisan_last_sync',
};

// Generic storage functions
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

export const getStorageTimestamp = (key: string): Date | null => {
  try {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
};

// Specific data functions
export const saveMasterIngredients = <T>(data: T): void => {
  saveToLocalStorage(STORAGE_KEYS.MASTER_INGREDIENTS, data);
};

export const getMasterIngredients = <T>(): T | null => {
  return getFromLocalStorage<T>(STORAGE_KEYS.MASTER_INGREDIENTS);
};

export const saveRecipes = <T>(data: T): void => {
  saveToLocalStorage(STORAGE_KEYS.RECIPES, data);
};

export const getRecipes = <T>(): T | null => {
  return getFromLocalStorage<T>(STORAGE_KEYS.RECIPES);
};

export const saveRecipePricing = <T>(data: T): void => {
  saveToLocalStorage(STORAGE_KEYS.RECIPE_PRICING, data);
};

export const getRecipePricing = <T>(): T | null => {
  return getFromLocalStorage<T>(STORAGE_KEYS.RECIPE_PRICING);
};

export const updateLastSync = (): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
};

export const getLastSync = (): Date | null => {
  const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return timestamp ? new Date(timestamp) : null;
};

export const clearAllCache = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
  });
};

export { STORAGE_KEYS };
