
export interface MasterIngredient {
  name: string;
  pricePerKg: number;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  preparation: string;
  overheads: number;
  sellingPrice: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  shelfLife: string;
  storage: string;
}

export let masterIngredients: MasterIngredient[] = [
  { name: "Roasted Chana Dal", pricePerKg: 160 },
  { name: "Red Chilies", pricePerKg: 200 },
  { name: "Sesame Seeds", pricePerKg: 300 },
  { name: "Salt", pricePerKg: 20 },
  { name: "Cumin / Jeera", pricePerKg: 400 },
  { name: "Garlic", pricePerKg: 300 },
  { name: "Roasted Peanuts", pricePerKg: 120 },
  { name: "Curry Leaves", pricePerKg: 100 },
  { name: "Urad Dal", pricePerKg: 150 },
  { name: "Tamarind", pricePerKg: 200 },
  { name: "Dry Coconut / Coconut", pricePerKg: 150 },
  { name: "Coriander Seeds", pricePerKg: 130 },
  { name: "Chana Dal", pricePerKg: 100 },
  { name: "Methi", pricePerKg: 200 },
  { name: "Hing", pricePerKg: 400 },
  { name: "Turmeric", pricePerKg: 200 },
  { name: "Pepper", pricePerKg: 300 },
  { name: "Jaggery", pricePerKg: 150 },
  { name: "Mustard / Mustard Seeds", pricePerKg: 200 },
  { name: "Dry Tamarind", pricePerKg: 200 },
  { name: "Clove", pricePerKg: 500 },
  { name: "Cinnamon", pricePerKg: 500 },
  { name: "Toor Dal", pricePerKg: 150 }
];

// Function to update master ingredient price
export const updateMasterIngredientPrice = (name: string, newPrice: number) => {
  const ingredient = masterIngredients.find(ing => ing.name === name);
  if (ingredient) {
    ingredient.pricePerKg = newPrice;
  }
};

// Function to get price from master ingredient list
export const getIngredientPrice = (name: string): number => {
  const ingredient = masterIngredients.find(ing => ing.name === name);
  return ingredient ? ingredient.pricePerKg : 0;
};

// Function to calculate ingredient cost
export const calculateIngredientCost = (ingredient: Ingredient): number => {
  const pricePerKg = getIngredientPrice(ingredient.name);
  return (ingredient.quantity / 1000) * pricePerKg;
};

// Function to calculate total recipe cost
export const calculateRecipeCost = (recipe: Recipe): { totalCost: number; finalCost: number } => {
  const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
    return sum + calculateIngredientCost(ingredient);
  }, 0);
  const finalCost = totalCost + recipe.overheads;
  return { totalCost, finalCost };
};

export const recipes: Recipe[] = [
  {
    id: 1,
    name: "Putnalu Podi",
    ingredients: [
      { name: "Roasted Chana Dal", quantity: 500, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Sesame Seeds", quantity: 100, unit: "g" },
      { name: "Salt", quantity: 50, unit: "g" },
      { name: "Cumin / Jeera", quantity: 50, unit: "g" },
      { name: "Garlic", quantity: 100, unit: "g" }
    ],
    preparation: "Dry roast all ingredients individually. Cool and grind together to coarse consistency. Store in airtight container.",
    overheads: 90,
    sellingPrice: 600,
    nutrition: { calories: 400, protein: 18, fat: 22, carbs: 38 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 2,
    name: "Palli Podi",
    ingredients: [
      { name: "Roasted Peanuts", quantity: 600, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Garlic", quantity: 100, unit: "g" },
      { name: "Salt", quantity: 50, unit: "g" },
      { name: "Cumin / Jeera", quantity: 50, unit: "g" }
    ],
    preparation: "Roast peanuts and red chilies separately. Cool, blend with garlic, salt, and jeera into powder. Store in airtight container.",
    overheads: 90,
    sellingPrice: 524,
    nutrition: { calories: 520, protein: 20, fat: 40, carbs: 25 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 3,
    name: "Karvepaku Podi",
    ingredients: [
      { name: "Curry Leaves", quantity: 300, unit: "g" },
      { name: "Urad Dal", quantity: 200, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Tamarind", quantity: 100, unit: "g" },
      { name: "Salt", quantity: 100, unit: "g" },
      { name: "Cumin / Jeera", quantity: 100, unit: "g" }
    ],
    preparation: "Wash and sun-dry curry leaves. Dry roast each ingredient separately until crisp. Cool completely and grind together into a fine powder. Store in a dry, airtight container.",
    overheads: 90,
    sellingPrice: 475,
    nutrition: { calories: 350, protein: 15, fat: 15, carbs: 40 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 4,
    name: "Kobari Powder",
    ingredients: [
      { name: "Dry Coconut / Coconut", quantity: 600, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Garlic", quantity: 100, unit: "g" },
      { name: "Tamarind", quantity: 50, unit: "g" },
      { name: "Salt", quantity: 50, unit: "g" }
    ],
    preparation: "Dry roast grated coconut and red chilies separately. Roast garlic slightly. Add tamarind and salt. Cool and grind all ingredients into a coarse powder. Store in airtight jar.",
    overheads: 90,
    sellingPrice: 499,
    nutrition: { calories: 520, protein: 7, fat: 45, carbs: 25 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 5,
    name: "Sambar Powder",
    ingredients: [
      { name: "Coriander Seeds", quantity: 300, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Chana Dal", quantity: 100, unit: "g" },
      { name: "Urad Dal", quantity: 100, unit: "g" },
      { name: "Cumin / Jeera", quantity: 75, unit: "g" },
      { name: "Methi", quantity: 75, unit: "g" },
      { name: "Hing", quantity: 75, unit: "g" },
      { name: "Turmeric", quantity: 75, unit: "g" }
    ],
    preparation: "Dry roast coriander seeds, dals, red chilies, jeera and methi. Cool slightly. Blend with turmeric and hing into a fine powder. Store in airtight container.",
    overheads: 90,
    sellingPrice: 350,
    nutrition: { calories: 430, protein: 12, fat: 18, carbs: 55 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 6,
    name: "Rasam Powder",
    ingredients: [
      { name: "Coriander Seeds", quantity: 200, unit: "g" },
      { name: "Pepper", quantity: 150, unit: "g" },
      { name: "Cumin / Jeera", quantity: 150, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Hing", quantity: 150, unit: "g" },
      { name: "Garlic", quantity: 150, unit: "g" }
    ],
    preparation: "Dry roast all spices individually until aromatic. Cool and grind together into fine powder. Store in a dry, cool place.",
    overheads: 90,
    sellingPrice: 399,
    nutrition: { calories: 360, protein: 10, fat: 15, carbs: 45 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 7,
    name: "Chutney Podi",
    ingredients: [
      { name: "Urad Dal", quantity: 400, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Tamarind", quantity: 100, unit: "g" },
      { name: "Jaggery", quantity: 100, unit: "g" },
      { name: "Salt", quantity: 75, unit: "g" },
      { name: "Hing", quantity: 75, unit: "g" },
      { name: "Mustard / Mustard Seeds", quantity: 50, unit: "g" }
    ],
    preparation: "Dry roast urad dal, red chilies, mustard seeds. Add tamarind, jaggery, salt and hing. Cool and grind into a medium coarse chutney powder. Store airtight.",
    overheads: 90,
    sellingPrice: 399,
    nutrition: { calories: 420, protein: 10, fat: 20, carbs: 50 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 8,
    name: "Idly Podi",
    ingredients: [
      { name: "Urad Dal", quantity: 400, unit: "g" },
      { name: "Chana Dal", quantity: 200, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Salt", quantity: 75, unit: "g" },
      { name: "Hing", quantity: 75, unit: "g" },
      { name: "Sesame Seeds", quantity: 50, unit: "g" }
    ],
    preparation: "Roast urad dal, chana dal, sesame seeds, and red chilies. Add salt and hing. Cool and grind to a fine powder. Use as side for idly/dosa.",
    overheads: 90,
    sellingPrice: 425,
    nutrition: { calories: 460, protein: 14, fat: 25, carbs: 45 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 9,
    name: "Polihora Podi",
    ingredients: [
      { name: "Dry Tamarind", quantity: 300, unit: "g" },
      { name: "Chana Dal", quantity: 150, unit: "g" },
      { name: "Urad Dal", quantity: 150, unit: "g" },
      { name: "Mustard / Mustard Seeds", quantity: 100, unit: "g" },
      { name: "Hing", quantity: 50, unit: "g" },
      { name: "Curry Leaves", quantity: 50, unit: "g" },
      { name: "Turmeric", quantity: 100, unit: "g" },
      { name: "Red Chilies", quantity: 100, unit: "g" }
    ],
    preparation: "Dry roast each ingredient separately until aromatic. Cool completely. Grind into a fine, slightly coarse powder. Best used for mixing with cooked rice.",
    overheads: 90,
    sellingPrice: 399,
    nutrition: { calories: 410, protein: 10, fat: 22, carbs: 40 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 10,
    name: "Vangibhat Powder",
    ingredients: [
      { name: "Chana Dal", quantity: 150, unit: "g" },
      { name: "Urad Dal", quantity: 150, unit: "g" },
      { name: "Coriander Seeds", quantity: 200, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Clove", quantity: 50, unit: "g" },
      { name: "Cinnamon", quantity: 50, unit: "g" },
      { name: "Tamarind", quantity: 200, unit: "g" }
    ],
    preparation: "Roast dals, coriander seeds, chilies, and spices till aromatic. Add tamarind. Cool and grind to a fine aromatic powder.",
    overheads: 90,
    sellingPrice: 425,
    nutrition: { calories: 430, protein: 11, fat: 18, carbs: 52 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 11,
    name: "Kura Podi",
    ingredients: [
      { name: "Chana Dal", quantity: 150, unit: "g" },
      { name: "Urad Dal", quantity: 150, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Dry Coconut / Coconut", quantity: 150, unit: "g" },
      { name: "Coriander Seeds", quantity: 150, unit: "g" },
      { name: "Salt", quantity: 100, unit: "g" },
      { name: "Hing", quantity: 100, unit: "g" }
    ],
    preparation: "Roast all ingredients till golden brown. Cool and grind to a fine powder. Ideal for adding to curries for added flavor.",
    overheads: 90,
    sellingPrice: 450,
    nutrition: { calories: 420, protein: 12, fat: 20, carbs: 50 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 12,
    name: "Bisibellebath Powder",
    ingredients: [
      { name: "Toor Dal", quantity: 200, unit: "g" },
      { name: "Chana Dal", quantity: 200, unit: "g" },
      { name: "Red Chilies", quantity: 200, unit: "g" },
      { name: "Clove", quantity: 100, unit: "g" },
      { name: "Cinnamon", quantity: 100, unit: "g" },
      { name: "Hing", quantity: 100, unit: "g" },
      { name: "Tamarind", quantity: 100, unit: "g" }
    ],
    preparation: "Dry roast all ingredients separately until aromatic. Cool and grind to a fine powder. Sieve to remove lumps. Store in dry container.",
    overheads: 90,
    sellingPrice: 475,
    nutrition: { calories: 450, protein: 13, fat: 18, carbs: 55 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  }
];
