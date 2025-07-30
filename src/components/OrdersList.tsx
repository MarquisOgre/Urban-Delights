import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOrders, fetchOrderItems, updateOrderStatus } from '@/services/orderService';
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
      onRefresh();
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

  const convertToInvoice = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'invoiced');
      toast({
        title: 'Success',
        description: 'Order converted to invoice',
      });
      loadOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert order to invoice',
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'invoiced': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-lg font-bold mt-2">₹{order.total_amount}</p>
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
              
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => convertToInvoice(order.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText size={16} className="mr-1" />
                    Convert to Invoice
                  </Button>
                )}
                
                <Button
                  onClick={() => generateInvoice(order)}
                  size="sm"
                  variant="outline"
                >
                  <Download size={16} className="mr-1" />
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrdersList;