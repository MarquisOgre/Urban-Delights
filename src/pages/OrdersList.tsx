import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrdersList from '@/components/OrdersList';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView="orders-list" 
        setCurrentView={() => {}}
        exportAllData={() => {}}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600">View and manage all customer orders</p>
          </div>

          {/* Orders List */}
          <OrdersList refresh={refresh} onRefresh={handleRefresh} />
        </div>
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default OrdersListPage;