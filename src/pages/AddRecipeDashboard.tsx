import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddRecipe from '@/components/AddRecipe';
import { fetchMasterIngredients } from '@/services/database';

const AddRecipeDashboard: React.FC = () => {
  const { data: masterIngredients = [], refetch } = useQuery({
    queryKey: ['masterIngredients'],
    queryFn: fetchMasterIngredients,
  });

  const handleRecipeAdded = () => {
    // Refresh master ingredients if needed
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <AddRecipe masterIngredients={masterIngredients} onRecipeAdded={handleRecipeAdded} />
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default AddRecipeDashboard;