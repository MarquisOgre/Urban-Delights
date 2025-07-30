import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOrders, fetchOrderItems, updateOrderStatus, updatePaymentStatus } from '@/services/orderService';
import type { Order, OrderItem } from '@/services/orderService';

interface OrdersListProps {
  refresh: boolean;
  onRefresh: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ refresh, onRefresh }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [refresh]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await fetchOrders();
      setOrders(ordersData);

      // Load items for each order
      const itemsPromises = ordersData.map(async (order) => {
        const items = await fetchOrderItems(order.id);
        return { orderId: order.id, items };
      });

      const itemsResults = await Promise.all(itemsPromises);
      const itemsMap = itemsResults.reduce((acc, { orderId, items }) => {
        acc[orderId] = items;
        return acc;
      }, {} as { [key: string]: OrderItem[] });

      setOrderItems(itemsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Success',
        description: 'Order status updated',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: string) => {
    try {
      await updatePaymentStatus(orderId, paymentStatus);
      toast({
        title: 'Success',
        description: 'Payment status updated',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const generateInvoice = (order: Order) => {
    const items = orderItems[order.id] || [];
    
    // Create a simple invoice content
    const invoiceContent = `
INVOICE

Customer: ${order.customer_name}
Phone: ${order.phone_number}
Address: ${order.address}
Date: ${new Date(order.created_at).toLocaleDateString()}

Items:
${items.map(item => `${item.recipe_name} - ${item.quantity_type} - ₹${item.amount}`).join('\n')}

Total Amount: ₹${order.total_amount}
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'order_sent': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'invoiced': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                  <p className="text-sm text-gray-600">{order.phone_number}</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                </div>
                <div className="text-right">
                  <div className="flex flex-col gap-1 mb-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    {order.payment_status && (
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">₹{order.total_amount}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold">Items:</h4>
                {(orderItems[order.id] || []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.recipe_name} - {item.quantity_type}</span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Order Status</label>
                  <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="order_sent">Order Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Payment Status</label>
                  <Select 
                    value={order.payment_status || 'unpaid'} 
                    onValueChange={(value) => handlePaymentStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={() => generateInvoice(order)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Download size={16} className="mr-1" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrdersList;