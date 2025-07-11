// Master Ingredients Data File
export interface MasterIngredientData {
  name: string;
  brand: string;
  price: number;
}

export const masterIngredientsData: MasterIngredientData[] = [
  { name: "Roasted Chana Dal", brand: "Reliance", price: 186 },
  { name: "Chana Dal", brand: "Reliance", price: 186 },
  { name: "Toor Dal", brand: "Reliance", price: 108 },
  { name: "Urad Dal", brand: "Reliance", price: 102 },
  { name: "Groundnut", brand: "Reliance", price: 174 },
  { name: "Dry Coconut", brand: "Reliance", price: 612 },
  { name: "Sesame Seeds", brand: "Reliance", price: 330 },
  { name: "White Sesame Seeds", brand: "Reliance", price: 330 },
  { name: "Garlic", brand: "Local Market", price: 60 },
  { name: "Byadagi Chilli", brand: "Reliance", price: 260 },
  { name: "Guntur Chilli", brand: "Reliance", price: 260 },
  { name: "Cumin Seeds", brand: "Reliance", price: 415 },
  { name: "Coriander Seeds", brand: "Reliance", price: 186 },
  { name: "Fenugreek Seeds", brand: "Reliance", price: 160 },
  { name: "Curry Leaves", brand: "Local Market", price: 50 },
  { name: "Tamarind", brand: "Reliance", price: 290 },
  { name: "Salt", brand: "Tata", price: 30 },
  { name: "Hing (Asafoetida)", brand: "LG", price: 1100 },
  { name: "Turmeric", brand: "Good Life", price: 285 },
  { name: "Cinnamon", brand: "Surya", price: 358 },
  { name: "Cardamom", brand: "Amazon Brand", price: 4200 },
  { name: "Black Pepper", brand: "Aashirwaad", price: 800 },
  { name: "Marathi Moggu", brand: "Amazon - Hansi", price: 600 },
  { name: "Raati Puvu", brand: "Amazon", price: 2200 },
  { name: "Cooking Oil", brand: "Soffola Gold", price: 157 },
  { name: "Red Chilies", brand: "Local Market", price: 200 },
  { name: "Roasted Peanuts", brand: "Local Market", price: 120 },
  { name: "Cumin / Jeera", brand: "Local Market", price: 400 },
  { name: "Methi", brand: "Local Market", price: 200 },
  { name: "Hing", brand: "Local Market", price: 400 },
  { name: "Pepper", brand: "Local Market", price: 300 },
  { name: "Jaggery", brand: "Local Market", price: 150 },
  { name: "Mustard / Mustard Seeds", brand: "Local Market", price: 200 },
  { name: "Dry Tamarind", brand: "Local Market", price: 200 },
  { name: "Clove", brand: "Local Market", price: 500 },
  { name: "Dry Coconut / Coconut", brand: "Local Market", price: 150 }
];

export const addMasterIngredientData = (ingredient: MasterIngredientData) => {
  const exists = masterIngredientsData.find(ing => 
    ing.name.toLowerCase() === ingredient.name.toLowerCase()
  );
  
  if (!exists) {
    masterIngredientsData.push(ingredient);
  }
};

export const updateMasterIngredientData = (oldName: string, updatedIngredient: MasterIngredientData) => {
  const index = masterIngredientsData.findIndex(ing => 
    ing.name.toLowerCase() === oldName.toLowerCase()
  );
  
  if (index !== -1) {
    masterIngredientsData[index] = updatedIngredient;
  }
};