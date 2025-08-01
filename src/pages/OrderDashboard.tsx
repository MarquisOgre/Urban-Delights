import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrdersList from '@/components/OrdersList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CreditCard, ShoppingCart, Plus, Eye } from 'lucide-react';
import { fetchOrders } from '@/services/orderService';
import type { Order } from '@/services/orderService';

const OrderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    paidOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading dashboard data...');
      const ordersData = await fetchOrders();
      console.log('Fetched orders:', ordersData);
      setOrders(ordersData);

      // Calculate statistics
      const totalOrders = ordersData.length;
      const totalSales = ordersData.filter(order => 
        order.status === 'order_sent' || order.status === 'paid' || order.payment_status === 'paid'
      ).length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = ordersData.filter(order => 
        order.status === 'received' || order.status === 'pending'
      ).length;
      const paidOrders = ordersData.filter(order => 
        order.payment_status === 'paid' || order.status === 'paid'
      ).length;
      const uniqueCustomers = new Set(ordersData.map(order => order.customer_name)).size;

      setStats({
        totalOrders,
        totalSales,
        totalRevenue,
        pendingOrders,
        paidOrders,
        activeCustomers: uniqueCustomers
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = () => {
    navigate('/create-order');
  };

  const handleViewOrders = () => {
    navigate('/orders-list');
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView="orders" 
        setCurrentView={() => {}}
        exportAllData={() => {}}
      />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management System</h1>
            <p className="text-gray-600">Manage your orders and track business performance</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {isLoading ? '-' : stats.totalOrders}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {isLoading ? '-' : stats.totalSales}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {isLoading ? '-' : `₹${stats.totalRevenue.toLocaleString()}`}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {isLoading ? '-' : stats.pendingOrders}
                </div>
                <div className="text-sm text-gray-600">Pending Orders</div>
              </CardContent>
            </Card>

            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-teal-100 rounded-full">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-teal-600 mb-1">
                  {isLoading ? '-' : stats.activeCustomers}
                </div>
                <div className="text-sm text-gray-600">Active Customers</div>
              </CardContent>
            </Card>
          </div>

          {/* Business Management Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Business Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateOrder}>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Order</h3>
                  <p className="text-gray-600">Create new customer orders</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewOrders}>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <Eye className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
                  <p className="text-gray-600">View and manage all orders</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewOrders}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                View All
              </Button>
            </div>
            <OrdersList 
              refresh={false} 
              onRefresh={loadDashboardData} 
              isRecentOrders={true}
            />
          </div>
        </div>
      </main>
      
      <Footer showTopButton={true} />
    </div>
  );
};

export default OrderDashboard;