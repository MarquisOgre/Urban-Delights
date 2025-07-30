import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Package, Plus, DollarSign, FileText, Archive } from 'lucide-react';
import ManageRecipes from '@/components/ManageRecipes';
import AddRecipe from '@/components/AddRecipe';
import MasterIngredientList from '@/components/MasterIngredientList';
import CostCalculator from '@/components/CostCalculator';
import PricingManager from '@/components/PricingManager';
import StockRegisterComponent from '@/components/StockRegister';
import RecipesDisplay from '@/components/RecipesDashboard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchMasterIngredients, fetchRecipesWithIngredients } from '@/services/database';

const Backend: React.FC = () => {
  const [currentView, setCurrentView] = useState('main');

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

  const backendButtons = [
    {
      title: 'Recipe',
      description: 'View all recipes and their details',
      icon: ChefHat,
      color: 'bg-orange-500',
      key: 'recipe-display'
    },
    {
      title: 'Manage Recipe',
      description: 'Manage recipe visibility and settings',
      icon: ChefHat,
      color: 'bg-orange-600',
      key: 'recipes'
    },
    {
      title: 'Ingredients',
      description: 'Manage master ingredient list and pricing',
      icon: Package,
      color: 'bg-green-500',
      key: 'ingredients'
    },
    {
      title: 'Add Recipe',
      description: 'Create new recipes with ingredients',
      icon: Plus,
      color: 'bg-blue-500',
      key: 'add-recipe'
    },
    {
      title: 'Pricing',
      description: 'Set selling prices for different quantities',
      icon: DollarSign,
      color: 'bg-purple-500',
      key: 'pricing'
    },
    {
      title: 'Indent',
      description: 'Cost calculator and ingredient planning',
      icon: FileText,
      color: 'bg-indigo-500',
      key: 'indent'
    },
    {
      title: 'Stock Register',
      description: 'Track inventory and stock levels',
      icon: Archive,
      color: 'bg-red-500',
      key: 'stock-register'
    }
  ];

  const renderContent = () => {
    if (currentView === 'main') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Management</h1>
            <p className="text-gray-600">Manage your recipes, ingredients, pricing and inventory</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backendButtons.map((item) => {
              const IconComponent = item.icon;
              return (
                <Card key={item.key} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <Button 
                      onClick={() => setCurrentView(item.key)}
                      className="w-full"
                      variant="outline"
                    >
                      Open {item.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    // Render specific backend components
    switch (currentView) {
      case 'recipe-display':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <RecipesDisplay recipes={recipes} onExport={exportAllData} />
          </div>
        );
      case 'recipes':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} />
          </div>
        );
      case 'ingredients':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <MasterIngredientList masterIngredients={masterIngredients} onRefresh={refetchIngredients} />
          </div>
        );
      case 'add-recipe':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={refreshData} />
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <PricingManager />
          </div>
        );
      case 'indent':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <CostCalculator />
          </div>
        );
      case 'stock-register':
        return (
          <div className="space-y-4">
            <Button onClick={() => setCurrentView('main')} variant="outline">
              ← Back to Backend
            </Button>
            <StockRegisterComponent />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Management</h1>
              <p className="text-gray-600">Manage your recipes, ingredients, pricing and inventory</p>
            </div>
          </div>
        );
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

export default Backend;