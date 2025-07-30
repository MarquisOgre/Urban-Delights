import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderDashboard from '@/components/OrderDashboard';
import ManageRecipes from '@/components/ManageRecipes';
import AddRecipe from '@/components/AddRecipe';
import MasterIngredientList from '@/components/MasterIngredientList';
import CostCalculator from '@/components/CostCalculator';
import OrderForm from '@/components/OrderForm';
import OrdersList from '@/components/OrdersList';
import PricingManager from '@/components/PricingManager';
import StockRegister from './StockRegister';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchMasterIngredients, fetchRecipesWithIngredients } from '@/services/database';

const RecipesDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshOrders, setRefreshOrders] = useState(false);

  // Fetch data for backend components
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

  const exportAllData = async () => {
    try {
      const [masterIngredients, recipes] = await Promise.all([
        fetchMasterIngredients(),
        fetchRecipesWithIngredients()
      ]);

      const wb = XLSX.utils.book_new();

      // Export Master Ingredients
      const ingredientsWS = XLSX.utils.json_to_sheet(masterIngredients);
      XLSX.utils.book_append_sheet(wb, ingredientsWS, 'Master Ingredients');

      // Export Recipes
      const recipesData = recipes.map(recipe => ({
        name: recipe.name,
        selling_price: recipe.selling_price,
        overheads: recipe.overheads,
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        preparation: recipe.preparation,
        shelf_life: recipe.shelf_life,
        storage: recipe.storage,
        is_hidden: recipe.is_hidden
      }));
      const recipesWS = XLSX.utils.json_to_sheet(recipesData);
      XLSX.utils.book_append_sheet(wb, recipesWS, 'Recipes');

      // Export Recipe Ingredients
      const ingredientsData = recipes.flatMap(recipe => 
        recipe.ingredients.map(ingredient => ({
          recipe_name: recipe.name,
          ingredient_name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        }))
      );
      const recipeIngredientsWS = XLSX.utils.json_to_sheet(ingredientsData);
      XLSX.utils.book_append_sheet(wb, recipeIngredientsWS, 'Recipe Ingredients');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `artisan-delights-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleOrderCreated = () => {
    setRefreshOrders(!refreshOrders);
    setCurrentView('orders');
  };

  const handleCreateOrder = () => {
    setCurrentView('create-order');
  };

  const handleViewOrders = () => {
    setCurrentView('orders');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <OrderDashboard onCreateOrder={handleCreateOrder} onViewOrders={handleViewOrders} />;
      case 'orders':
        return <OrdersList refresh={refreshOrders} onRefresh={() => setRefreshOrders(false)} />;
      case 'create-order':
        return <OrderForm onOrderCreated={handleOrderCreated} />;
      case 'pricing':
        return <PricingManager />;
      case 'recipes':
        return <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />;
      case 'ingredients':
        return <MasterIngredientList masterIngredients={masterIngredients} onRefresh={refetchIngredients} />;
      case 'add-recipe':
        return <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={refreshData} />;
      case 'indent':
        return <CostCalculator />;
      case 'stock-register':
        return <StockRegister />;
      case 'manage-recipes':
        return <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />;
      default:
        return <OrderDashboard onCreateOrder={handleCreateOrder} onViewOrders={handleViewOrders} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        exportAllData={exportAllData}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default RecipesDashboard;