import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Package, Plus, DollarSign, FileText, Archive } from 'lucide-react';

const Backend: React.FC = () => {
  const navigate = useNavigate();

  const backendButtons = [
    {
      title: 'Recipe',
      description: 'View all recipes and their details',
      icon: ChefHat,
      color: 'bg-orange-500',
      route: '/recipes-dashboard'
    },
    {
      title: 'Manage Recipe',
      description: 'Manage recipe visibility and settings',
      icon: ChefHat,
      color: 'bg-orange-600',
      route: '/manage-recipe-dashboard'
    },
    {
      title: 'Ingredients',
      description: 'Manage master ingredient list and pricing',
      icon: Package,
      color: 'bg-green-500',
      route: '/ingredients-dashboard'
    },
    {
      title: 'Add Recipe',
      description: 'Create new recipes with ingredients',
      icon: Plus,
      color: 'bg-blue-500',
      route: '/add-recipe-dashboard'
    },
    {
      title: 'Pricing',
      description: 'Set selling prices for different quantities',
      icon: DollarSign,
      color: 'bg-purple-500',
      route: '/pricing-dashboard'
    },
    {
      title: 'Indent',
      description: 'Cost calculator and ingredient planning',
      icon: FileText,
      color: 'bg-indigo-500',
      route: '/indent-dashboard'
    },
    {
      title: 'Stock Register',
      description: 'Track inventory and stock levels',
      icon: Archive,
      color: 'bg-red-500',
      route: '/stock-register'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Management</h1>
        <p className="text-gray-600">Manage your recipes, ingredients, pricing and inventory</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {backendButtons.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Button 
                  onClick={() => navigate(item.route)}
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

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Management</h1>
          <p className="text-gray-600">Manage your recipes, ingredients, pricing and inventory</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backendButtons.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Button 
                    onClick={() => navigate(item.route)}
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default Backend;