import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Eye, IndianRupee, ShoppingCart, CheckCircle, Users } from 'lucide-react';
import { fetchOrders, Order } from '@/services/orderService';

interface OrderDashboardProps {
  onBackToDashboard: () => void;
  onCreateOrder: () => void;
  onViewOrders: () => void;
}

const OrderDashboard: React.FC<OrderDashboardProps> = ({ onBackToDashboard, onCreateOrder, onViewOrders }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(console.error);
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
  const pendingOrders = orders.filter(o => o.status === 'received').length;

  const stats = [
    { title: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { title: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: IndianRupee, color: 'bg-green-500' },
    { title: 'Paid Orders', value: paidOrders, icon: CheckCircle, color: 'bg-purple-500' },
    { title: 'Pending', value: pendingOrders, icon: Users, color: 'bg-orange-500' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
      </div>

      <h2 className="text-2xl font-bold text-center">Order Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`${stat.color} rounded-full p-2`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onCreateOrder}>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <div className="bg-blue-500 rounded-full p-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold">Create Order</h3>
            <p className="text-sm text-muted-foreground">Create a new customer order</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onViewOrders}>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <div className="bg-green-500 rounded-full p-4">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold">View Orders</h3>
            <p className="text-sm text-muted-foreground">Manage and track all orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={onViewOrders}>
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">INV-{String(order.invoice_number).padStart(3, '0')} • {order.order_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.total_amount.toFixed(0)}</p>
                    <p className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {(order.payment_status || 'unpaid').toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDashboard;
