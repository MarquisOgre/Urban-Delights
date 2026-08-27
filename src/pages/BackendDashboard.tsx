import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSwipe } from '@/hooks/use-swipe';

import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Package, Plus, DollarSign, FileText, Archive, ShoppingCart } from 'lucide-react';
import ManageRecipes from '@/components/ManageRecipes';
import AddRecipe from '@/components/AddRecipe';
import MasterIngredientList from '@/components/MasterIngredientList';
import Indent from '@/components/Indent';
import PricingManager from '@/components/PricingManager';
import StockRegister from '@/components/StockRegister';
import Recipes from '@/components/Recipes';
import OrderDashboard from '@/components/OrderDashboard';
import OrderForm from '@/components/OrderForm';
import OrdersList from '@/components/OrdersList';
import Header from '@/components/Header';
import { fetchMasterIngredients, fetchRecipesWithIngredients } from '@/services/database';
import { useAuth } from '@/hooks/use-auth';

const BackendDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState('main');
  const { session } = useAuth();
  const isAuthed = !!session;
  const authOnlyViews = ['order-dashboard', 'create-order', 'orders', 'manage-recipes', 'add-recipe'];

  const allViewOrder = ['main', 'order-dashboard', 'create-order', 'orders', 'recipes', 'manage-recipes', 'ingredients', 'add-recipe', 'pricing', 'indent', 'stock-register'];
  const viewOrder = allViewOrder.filter(v => isAuthed || !authOnlyViews.includes(v));

  React.useEffect(() => {
    if (!isAuthed && authOnlyViews.includes(currentView)) setCurrentView('main');
  }, [isAuthed, currentView]);

  const swipeHandlers = React.useMemo(() => ({
    onSwipeLeft: () => {
      const idx = viewOrder.indexOf(currentView);
      if (idx < viewOrder.length - 1) setCurrentView(viewOrder[idx + 1]);
    },
    onSwipeRight: () => {
      const idx = viewOrder.indexOf(currentView);
      if (idx > 0) setCurrentView(viewOrder[idx - 1]);
    },
  }), [currentView]);

  useSwipe(swipeHandlers);

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
      const { toast } = await import('@/hooks/use-toast');
      toast({ title: "Data synced successfully!", description: "All data has been refreshed." });
    } catch (error) {
      console.error('Error refreshing data:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({ title: "Sync failed", description: "Could not refresh data.", variant: "destructive" });
    }
  };

  const allBackendButtons = [
    { title: 'Orders', description: 'Manage orders and invoices', icon: ShoppingCart, color: 'bg-blue-500', key: 'order-dashboard' },
    { title: 'Recipes', description: 'View all recipes and their details', icon: ChefHat, color: 'bg-orange-500', key: 'recipes' },
    { title: 'Manage Recipes', description: 'Manage recipe visibility and settings', icon: ChefHat, color: 'bg-orange-600', key: 'manage-recipes' },
    { title: 'Ingredients', description: 'Manage master ingredient list and pricing', icon: Package, color: 'bg-green-500', key: 'ingredients' },
    { title: 'Add Recipe', description: 'Create new recipes with ingredients', icon: Plus, color: 'bg-blue-500', key: 'add-recipe' },
    { title: 'Pricing Manager', description: 'Set selling prices for different quantities', icon: DollarSign, color: 'bg-purple-500', key: 'pricing' },
    { title: 'Indent', description: 'Cost calculator and ingredient planning', icon: FileText, color: 'bg-indigo-500', key: 'indent' },
    { title: 'Stock Register', description: 'Track inventory and stock levels', icon: Archive, color: 'bg-red-500', key: 'stock-register' },
  ];

  const backendButtons = allBackendButtons.filter(b => isAuthed || !authOnlyViews.includes(b.key));

  const renderContent = () => {
    if (currentView === 'main') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your recipes, ingredients, pricing and inventory</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {backendButtons.map((item) => {
              const IconComponent = item.icon;
              return (
                <Card key={item.key} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView(item.key)}>
                  <CardHeader className="text-center p-3 sm:p-6 pb-1 sm:pb-2">
                    <div className={`w-10 h-10 sm:w-16 sm:h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4`}>
                      <IconComponent className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <CardTitle className="text-sm sm:text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-3 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-base hidden sm:block">{item.description}</p>
                    <Button onClick={(e) => { e.stopPropagation(); setCurrentView(item.key); }} className="w-full text-xs sm:text-sm" variant="outline" size="sm">
                      Open
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    if (!isAuthed && authOnlyViews.includes(currentView)) return null;

    switch (currentView) {
      case 'order-dashboard':
        return <OrderDashboard onBackToDashboard={() => setCurrentView('main')} onCreateOrder={() => setCurrentView('create-order')} onViewOrders={() => setCurrentView('orders')} />;
      case 'create-order':
        return <OrderForm onBackToDashboard={() => setCurrentView('order-dashboard')} onOrderCreated={refreshData} />;
      case 'orders':
        return <OrdersList onBackToDashboard={() => setCurrentView('order-dashboard')} />;
      case 'recipes':
        return <Recipes recipes={recipes} masterIngredients={masterIngredients} onRecipeUpdated={refreshData} onBackToDashboard={() => setCurrentView('main')} />;
      case 'manage-recipes':
        return <ManageRecipes recipes={recipes} onRecipeUpdated={refreshData} onBackToDashboard={() => setCurrentView('main')} />;
      case 'ingredients':
        return <MasterIngredientList masterIngredients={masterIngredients} onRefresh={refetchIngredients} onBackToDashboard={() => setCurrentView('main')} />;
      case 'add-recipe':
        return <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={refreshData} onBackToDashboard={() => setCurrentView('main')} />;
      case 'pricing':
        return <PricingManager onBackToDashboard={() => setCurrentView('main')} />;
      case 'indent':
        return <Indent recipes={recipes} masterIngredients={masterIngredients} onBackToDashboard={() => setCurrentView('main')} />;
      case 'stock-register':
        return <StockRegister onBackToDashboard={() => setCurrentView('main')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} onRefresh={refreshData} />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-16 sm:pb-24">
        {renderContent()}
      </main>
      <Footer showTopButton={true} />
    </div>
  );
};

export default BackendDashboard;
