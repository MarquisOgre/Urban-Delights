
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
  cost: number;
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  preparation: string;
  totalCost: number;
  overheads: number;
  finalCost: number;
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

export const masterIngredients = [
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

export const recipes: Recipe[] = [
  {
    id: 1,
    name: "Putnalu Podi",
    ingredients: [
      { name: "Roasted Chana Dal", quantity: 500, unit: "g", pricePerKg: 160, cost: 80 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Sesame Seeds", quantity: 100, unit: "g", pricePerKg: 300, cost: 30 },
      { name: "Salt", quantity: 50, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Cumin / Jeera", quantity: 50, unit: "g", pricePerKg: 400, cost: 20 },
      { name: "Garlic", quantity: 100, unit: "g", pricePerKg: 300, cost: 30 }
    ],
    preparation: "Dry roast all ingredients individually. Cool and grind together to coarse consistency. Store in airtight container.",
    totalCost: 210,
    overheads: 90,
    finalCost: 300,
    sellingPrice: 600,
    nutrition: { calories: 400, protein: 18, fat: 22, carbs: 38 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 2,
    name: "Palli Podi",
    ingredients: [
      { name: "Roasted Peanuts", quantity: 600, unit: "g", pricePerKg: 120, cost: 72 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Garlic", quantity: 100, unit: "g", pricePerKg: 300, cost: 30 },
      { name: "Salt", quantity: 50, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Cumin / Jeera", quantity: 50, unit: "g", pricePerKg: 400, cost: 20 }
    ],
    preparation: "Roast peanuts and red chilies separately. Cool, blend with garlic, salt, and jeera into powder. Store in airtight container.",
    totalCost: 172,
    overheads: 90,
    finalCost: 262,
    sellingPrice: 524,
    nutrition: { calories: 520, protein: 20, fat: 40, carbs: 25 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 3,
    name: "Karvepaku Podi",
    ingredients: [
      { name: "Curry Leaves", quantity: 300, unit: "g", pricePerKg: 100, cost: 30 },
      { name: "Urad Dal", quantity: 200, unit: "g", pricePerKg: 150, cost: 30 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Tamarind", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 },
      { name: "Salt", quantity: 100, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Cumin / Jeera", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 }
    ],
    preparation: "Wash and sun-dry curry leaves. Dry roast each ingredient separately until crisp. Cool completely and grind together into a fine powder. Store in a dry, airtight container.",
    totalCost: 150,
    overheads: 90,
    finalCost: 240,
    sellingPrice: 475,
    nutrition: { calories: 350, protein: 15, fat: 15, carbs: 40 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 4,
    name: "Kobari Powder",
    ingredients: [
      { name: "Dry Coconut / Coconut", quantity: 600, unit: "g", pricePerKg: 150, cost: 90 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Garlic", quantity: 100, unit: "g", pricePerKg: 300, cost: 30 },
      { name: "Tamarind", quantity: 50, unit: "g", pricePerKg: 200, cost: 10 },
      { name: "Salt", quantity: 50, unit: "g", pricePerKg: 20, cost: 10 }
    ],
    preparation: "Dry roast grated coconut and red chilies separately. Roast garlic slightly. Add tamarind and salt. Cool and grind all ingredients into a coarse powder. Store in airtight jar.",
    totalCost: 180,
    overheads: 90,
    finalCost: 270,
    sellingPrice: 499,
    nutrition: { calories: 520, protein: 7, fat: 45, carbs: 25 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 5,
    name: "Sambar Powder",
    ingredients: [
      { name: "Coriander Seeds", quantity: 300, unit: "g", pricePerKg: 130, cost: 39 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Chana Dal", quantity: 100, unit: "g", pricePerKg: 100, cost: 10 },
      { name: "Urad Dal", quantity: 100, unit: "g", pricePerKg: 150, cost: 15 },
      { name: "Cumin / Jeera", quantity: 75, unit: "g", pricePerKg: 200, cost: 15 },
      { name: "Methi", quantity: 75, unit: "g", pricePerKg: 200, cost: 15 },
      { name: "Hing", quantity: 75, unit: "g", pricePerKg: 400, cost: 30 },
      { name: "Turmeric", quantity: 75, unit: "g", pricePerKg: 200, cost: 15 }
    ],
    preparation: "Dry roast coriander seeds, dals, red chilies, jeera and methi. Cool slightly. Blend with turmeric and hing into a fine powder. Store in airtight container.",
    totalCost: 179,
    overheads: 90,
    finalCost: 269,
    sellingPrice: 350,
    nutrition: { calories: 430, protein: 12, fat: 18, carbs: 55 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 6,
    name: "Rasam Powder",
    ingredients: [
      { name: "Coriander Seeds", quantity: 200, unit: "g", pricePerKg: 130, cost: 26 },
      { name: "Pepper", quantity: 150, unit: "g", pricePerKg: 300, cost: 45 },
      { name: "Cumin / Jeera", quantity: 150, unit: "g", pricePerKg: 400, cost: 60 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Hing", quantity: 150, unit: "g", pricePerKg: 400, cost: 60 },
      { name: "Garlic", quantity: 150, unit: "g", pricePerKg: 300, cost: 45 }
    ],
    preparation: "Dry roast all spices individually until aromatic. Cool and grind together into fine powder. Store in a dry, cool place.",
    totalCost: 276,
    overheads: 90,
    finalCost: 366,
    sellingPrice: 399,
    nutrition: { calories: 360, protein: 10, fat: 15, carbs: 45 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 7,
    name: "Chutney Podi",
    ingredients: [
      { name: "Urad Dal", quantity: 400, unit: "g", pricePerKg: 150, cost: 60 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Tamarind", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 },
      { name: "Jaggery", quantity: 100, unit: "g", pricePerKg: 150, cost: 15 },
      { name: "Salt", quantity: 75, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Hing", quantity: 75, unit: "g", pricePerKg: 400, cost: 30 },
      { name: "Mustard / Mustard Seeds", quantity: 50, unit: "g", pricePerKg: 200, cost: 10 }
    ],
    preparation: "Dry roast urad dal, red chilies, mustard seeds. Add tamarind, jaggery, salt and hing. Cool and grind into a medium coarse chutney powder. Store airtight.",
    totalCost: 185,
    overheads: 90,
    finalCost: 275,
    sellingPrice: 399,
    nutrition: { calories: 420, protein: 10, fat: 20, carbs: 50 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 8,
    name: "Idly Podi",
    ingredients: [
      { name: "Urad Dal", quantity: 400, unit: "g", pricePerKg: 150, cost: 60 },
      { name: "Chana Dal", quantity: 200, unit: "g", pricePerKg: 100, cost: 20 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Salt", quantity: 75, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Hing", quantity: 75, unit: "g", pricePerKg: 400, cost: 30 },
      { name: "Sesame Seeds", quantity: 50, unit: "g", pricePerKg: 300, cost: 15 }
    ],
    preparation: "Roast urad dal, chana dal, sesame seeds, and red chilies. Add salt and hing. Cool and grind to a fine powder. Use as side for idly/dosa.",
    totalCost: 175,
    overheads: 90,
    finalCost: 265,
    sellingPrice: 425,
    nutrition: { calories: 460, protein: 14, fat: 25, carbs: 45 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 9,
    name: "Polihora Podi",
    ingredients: [
      { name: "Dry Tamarind", quantity: 300, unit: "g", pricePerKg: 200, cost: 60 },
      { name: "Chana Dal", quantity: 150, unit: "g", pricePerKg: 100, cost: 15 },
      { name: "Urad Dal", quantity: 150, unit: "g", pricePerKg: 150, cost: 22.5 },
      { name: "Mustard / Mustard Seeds", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 },
      { name: "Hing", quantity: 50, unit: "g", pricePerKg: 400, cost: 20 },
      { name: "Curry Leaves", quantity: 50, unit: "g", pricePerKg: 100, cost: 10 },
      { name: "Turmeric", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 },
      { name: "Red Chilies", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 }
    ],
    preparation: "Dry roast each ingredient separately until aromatic. Cool completely. Grind into a fine, slightly coarse powder. Best used for mixing with cooked rice.",
    totalCost: 187.5,
    overheads: 90,
    finalCost: 277.5,
    sellingPrice: 399,
    nutrition: { calories: 410, protein: 10, fat: 22, carbs: 40 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 10,
    name: "Vangibhat Powder",
    ingredients: [
      { name: "Chana Dal", quantity: 150, unit: "g", pricePerKg: 100, cost: 15 },
      { name: "Urad Dal", quantity: 150, unit: "g", pricePerKg: 150, cost: 22.5 },
      { name: "Coriander Seeds", quantity: 200, unit: "g", pricePerKg: 130, cost: 26 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Clove", quantity: 50, unit: "g", pricePerKg: 500, cost: 25 },
      { name: "Cinnamon", quantity: 50, unit: "g", pricePerKg: 500, cost: 25 },
      { name: "Tamarind", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 }
    ],
    preparation: "Roast dals, coriander seeds, chilies, and spices till aromatic. Add tamarind. Cool and grind to a fine aromatic powder.",
    totalCost: 193.5,
    overheads: 90,
    finalCost: 283.5,
    sellingPrice: 425,
    nutrition: { calories: 430, protein: 11, fat: 18, carbs: 52 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 11,
    name: "Kura Podi",
    ingredients: [
      { name: "Chana Dal", quantity: 150, unit: "g", pricePerKg: 100, cost: 15 },
      { name: "Urad Dal", quantity: 150, unit: "g", pricePerKg: 150, cost: 22.5 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Dry Coconut / Coconut", quantity: 150, unit: "g", pricePerKg: 150, cost: 22.5 },
      { name: "Coriander Seeds", quantity: 150, unit: "g", pricePerKg: 130, cost: 19.5 },
      { name: "Salt", quantity: 100, unit: "g", pricePerKg: 20, cost: 10 },
      { name: "Hing", quantity: 100, unit: "g", pricePerKg: 400, cost: 40 }
    ],
    preparation: "Roast all ingredients till golden brown. Cool and grind to a fine powder. Ideal for adding to curries for added flavor.",
    totalCost: 169.5,
    overheads: 90,
    finalCost: 259.5,
    sellingPrice: 450,
    nutrition: { calories: 420, protein: 12, fat: 20, carbs: 50 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  },
  {
    id: 12,
    name: "Bisibellebath Powder",
    ingredients: [
      { name: "Toor Dal", quantity: 200, unit: "g", pricePerKg: 150, cost: 30 },
      { name: "Chana Dal", quantity: 200, unit: "g", pricePerKg: 100, cost: 20 },
      { name: "Red Chilies", quantity: 200, unit: "g", pricePerKg: 200, cost: 40 },
      { name: "Clove", quantity: 100, unit: "g", pricePerKg: 500, cost: 50 },
      { name: "Cinnamon", quantity: 100, unit: "g", pricePerKg: 500, cost: 50 },
      { name: "Hing", quantity: 100, unit: "g", pricePerKg: 400, cost: 40 },
      { name: "Tamarind", quantity: 100, unit: "g", pricePerKg: 200, cost: 20 }
    ],
    preparation: "Dry roast all ingredients separately until aromatic. Cool and grind to a fine powder. Sieve to remove lumps. Store in dry container.",
    totalCost: 250,
    overheads: 90,
    finalCost: 340,
    sellingPrice: 475,
    nutrition: { calories: 450, protein: 13, fat: 18, carbs: 55 },
    shelfLife: "6 months in sealed packaging, away from moisture and sunlight",
    storage: "Store in a cool, dry place in an airtight container after opening"
  }
];
