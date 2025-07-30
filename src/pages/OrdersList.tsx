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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-600">View and manage all customer orders</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/create-order')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
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