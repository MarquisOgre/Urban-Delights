import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManageRecipes from '@/components/ManageRecipes';
import { fetchRecipesWithIngredients } from '@/services/database';

const ManageRecipeDashboard: React.FC = () => {
  const { data: recipes = [], refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const handleRecipeUpdated = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <ManageRecipes recipes={recipes} onRecipeUpdated={handleRecipeUpdated} />
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default ManageRecipeDashboard;