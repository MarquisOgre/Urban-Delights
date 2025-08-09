'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  fetchMasterIngredients,
  fetchRecipesWithIngredients,
  type MasterIngredient,
  type RecipeWithIngredients,
} from '@/services/database';
import Recipes from '@/components/Recipes';
import Ingredients from '@/components/Ingredients';
import AddRecipe from '@/components/AddRecipe';
import Indent from '@/components/Indent';
import StockRegister from '@/components/StockRegister';
import ManageRecipes from '@/components/ManageRecipes';
import { useToast } from '@/hooks/use-toast';

import Footer from '@/components/Footer';

const Index = () => {
  const [currentView, setCurrentView] = useState('recipes');
  const { toast } = useToast();


  const { data: masterIngredients = [], refetch: refetchIngredients } = useQuery({
    queryKey: ['masterIngredients'],
    queryFn: fetchMasterIngredients,
  });

  const { data: recipes = [], refetch: refetchRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const refreshData = async () => {
    try {
      await refetchIngredients();
      await refetchRecipes();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const exportAllData = () => {
    const recipesData = recipes.map(recipe => ({
      'Recipe Name': recipe.name,
      'Selling Price (₹)': recipe.selling_price,
      'Overheads (₹)': recipe.overheads,
      'Shelf Life': recipe.shelf_life || '',
      'Storage': recipe.storage || '',
      'Calories': recipe.calories || '',
      'Protein (g)': recipe.protein || '',
      'Fat (g)': recipe.fat || '',
      'Carbs (g)': recipe.carbs || '',
      'Ingredients Count': recipe.ingredients.length,
      'Status': recipe.is_hidden ? 'Hidden' : 'Visible',
    }));

    const wb = XLSX.utils.book_new();
    const recipesWs = XLSX.utils.json_to_sheet(recipesData);
    XLSX.utils.book_append_sheet(wb, recipesWs, 'All Recipes');

    recipes.forEach(recipe => {
      const totalIngredientCost = recipe.ingredients.reduce((sum, ingredient) => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        if (masterIngredient) {
          const costPerUnit = masterIngredient.price_per_kg / 1000;
          return sum + (ingredient.quantity * costPerUnit);
        }
        return sum;
      }, 0);

      const finalCost = totalIngredientCost + recipe.overheads;
      const recipeDetails = [
        { Field: 'Recipe Name', Value: recipe.name },
        { Field: 'Selling Price (₹)', Value: recipe.selling_price },
        { Field: 'Overheads (₹)', Value: recipe.overheads },
        { Field: 'Total Ingredient Cost (₹)', Value: totalIngredientCost.toFixed(2) },
        { Field: 'Final Cost (₹)', Value: finalCost.toFixed(2) },
        { Field: 'Profit (₹)', Value: (recipe.selling_price - finalCost).toFixed(2) },
        { Field: 'Profit Margin (%)', Value: (((recipe.selling_price - finalCost) / recipe.selling_price) * 100).toFixed(2) },
        { Field: '', Value: '' },
        { Field: 'Nutritional Information', Value: '' },
        { Field: 'Calories', Value: recipe.calories || 'N/A' },
        { Field: 'Protein (g)', Value: recipe.protein || 'N/A' },
        { Field: 'Fat (g)', Value: recipe.fat || 'N/A' },
        { Field: 'Carbs (g)', Value: recipe.carbs || 'N/A' },
        { Field: '', Value: '' },
        { Field: 'Storage & Preparation', Value: '' },
        { Field: 'Shelf Life', Value: recipe.shelf_life || 'N/A' },
        { Field: 'Storage', Value: recipe.storage || 'N/A' },
        { Field: 'Preparation Method', Value: recipe.preparation || 'N/A' },
        { Field: '', Value: '' },
        { Field: 'Ingredients', Value: '' },
        ...recipe.ingredients.map(ingredient => {
          const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
          const pricePerKg = masterIngredient ? masterIngredient.price_per_kg : 0;
          const costPerUnit = pricePerKg / 1000;
          const totalCost = ingredient.quantity * costPerUnit;
          return {
            Field: `${ingredient.ingredient_name} (${ingredient.quantity}${ingredient.unit})`,
            Value: `₹${totalCost.toFixed(2)} (₹${pricePerKg}/kg)`
          };
        })
      ];

      const recipeWs = XLSX.utils.json_to_sheet(recipeDetails);
      const sheetName = `${recipe.name.substring(0, 25)}${recipe.name.length > 25 ? '...' : ''}`;
      XLSX.utils.book_append_sheet(wb, recipeWs, sheetName);
    });

    XLSX.writeFile(wb, 'artisan_delights_recipes.xlsx');

    toast({
      title: 'Export Successful',
      description: `Exported ${recipes.length + 1} sheets: All recipes overview and ${recipes.length} individual recipe sheets`,
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-20 md:pb-8">

      <div className="container mx-auto px-2 md:px-4 py-2 max-w-full mb-16 md:mb-0">
        {currentView === 'recipes' && (
          <Recipes 
            recipes={recipes} 
            masterIngredients={masterIngredients} 
            onRecipeUpdated={refreshData} 
          />
        )}

        {currentView === 'ingredients' && (
          <Ingredients masterIngredients={masterIngredients} onRefresh={refetchIngredients} />
        )}

        {currentView === 'add-recipe' && (
          <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={refreshData} />
        )}

        {currentView === 'manage-recipes' && (
          <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />
        )}

        {currentView === 'indent' && (
          <Indent recipes={recipes} masterIngredients={masterIngredients} />
        )}

        {currentView === 'stock-register' && (
          <StockRegister />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;