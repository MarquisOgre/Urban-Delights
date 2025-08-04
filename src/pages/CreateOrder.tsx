import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();

  const handleOrderCreated = () => {
    // This will be called when an order is successfully created
    console.log('Order created successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView="create-order" 
        setCurrentView={() => {}}
        exportAllData={() => {}}
      />
      
    <main className="container mx-auto px-4 py-6 pb-24">
      <div className="space-y-6">

        {/* Header Row with Padding-Top */}
        <div className="relative flex items-center justify-between pt-6">
          {/* Centered Heading */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="text-gray-600">Fill in the details to create a new customer order</p>
          </div>

          {/* Right-Aligned Button */}
          <div className="h-12" /> {/* Spacer where CardHeader was */}
          {/* <Button 
            variant="outline" 
            onClick={() => navigate('/orders')}
            className="ml-auto flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button> */}
        </div>

        {/* Order Form */}
        <OrderForm onOrderCreated={handleOrderCreated} />

      </div>
    </main>    
      <Footer showTopButton={true} />
    </div>
  );
};

export default CreateOrder;