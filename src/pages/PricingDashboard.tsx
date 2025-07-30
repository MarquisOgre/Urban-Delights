import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingManager from '@/components/PricingManager';

const PricingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <PricingManager />
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default PricingDashboard;