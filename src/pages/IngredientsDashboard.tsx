import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MasterIngredientList from '@/components/MasterIngredientList';
import { fetchMasterIngredients } from '@/services/database';

const IngredientsDashboard: React.FC = () => {
  const { data: masterIngredients = [], refetch } = useQuery({
    queryKey: ['masterIngredients'],
    queryFn: fetchMasterIngredients,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <MasterIngredientList masterIngredients={masterIngredients} onRefresh={refetch} />
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default IngredientsDashboard;