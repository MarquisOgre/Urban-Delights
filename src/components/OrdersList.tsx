import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Edit3, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOrders, fetchOrderItems, updateOrderStatus, updatePaymentStatus, deleteOrder } from '@/services/orderService';
import type { Order, OrderItem } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';
import { usePrintInvoice } from '@/components/PrintInvoice';
import EditOrderDialog from '@/components/EditOrderDialog';
import ViewOrderDialog from '@/components/ViewOrderDialog';

interface OrdersListProps {
  refresh: boolean;
  onRefresh: () => void;
  isRecentOrders?: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ refresh, onRefresh, isRecentOrders = false }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handlePrint } = usePrintInvoice();

  useEffect(() => {
    loadOrders();
  }, [refresh]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await fetchOrders();
      
      // If this is for recent orders, only show last 5
      const displayOrders = isRecentOrders ? ordersData.slice(0, 5) : ordersData;
      setOrders(displayOrders);

      // Load items for each order
      const itemsPromises = displayOrders.map(async (order) => {
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

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        toast({
          title: 'Success',
          description: 'Order deleted successfully',
        });
        onRefresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete order',
          variant: 'destructive',
        });
      }
    }
  };

  const getInvoiceNumber = (order: Order) => {
    return order.invoice_number ? `INV-${String(order.invoice_number).padStart(3, '0')}` : `INV-${order.id.substring(0, 3).toUpperCase()}`;
  };

  const handleOrderClick = (orderId: string) => {
    if (isRecentOrders) {
      navigate(`/orders/${orderId}`);
    }
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

  // Recent Orders Layout
  if (isRecentOrders) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Orders</h2>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOrderClick(order.id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-lg font-semibold">{getInvoiceNumber(order)}</div>
                    <div className="text-sm text-gray-600">Customer: {order.customer_name}</div>
                    <div className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-xl font-bold">₹{order.total_amount}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'received' ? 'Order Received' : order.status === 'order_sent' ? 'Order Sent' : order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <ViewOrderDialog order={order} items={orderItems[order.id] || []}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2"
                          title="View Order"
                        >
                          <Eye size={16} />
                        </Button>
                      </ViewOrderDialog>

                      <EditOrderDialog order={order} onOrderUpdated={onRefresh}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2"
                          title="Edit Order"
                        >
                          <Edit3 size={16} />
                        </Button>
                      </EditOrderDialog>

                      <Button
                        onClick={() => handlePrint(order, orderItems[order.id] || [])}
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="Print Invoice"
                      >
                        <Printer size={16} />
                      </Button>

                      <Button
                        onClick={() => handleDeleteOrder(order.id)}
                        size="sm"
                        variant="outline"
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Delete Order"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Full Orders Management Layout
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders Management</h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <div className="text-lg font-semibold">{getInvoiceNumber(order)}</div>
                  <div className="text-sm text-gray-600">Customer: {order.customer_name}</div>
                  <div className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="text-xl font-bold">₹{order.total_amount}</div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'received' ? 'Order Received' : order.status === 'order_sent' ? 'Order Sent' : order.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <ViewOrderDialog order={order} items={orderItems[order.id] || []}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="View Order"
                      >
                        <Eye size={16} />
                      </Button>
                    </ViewOrderDialog>

                    <EditOrderDialog order={order} onOrderUpdated={onRefresh}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="Edit Order"
                      >
                        <Edit3 size={16} />
                      </Button>
                    </EditOrderDialog>

                    <Button
                      onClick={() => handlePrint(order, orderItems[order.id] || [])}
                      size="sm"
                      variant="outline"
                      className="p-2"
                      title="Print Invoice"
                    >
                      <Printer size={16} />
                    </Button>

                    <Button
                      onClick={() => handleDeleteOrder(order.id)}
                      size="sm"
                      variant="outline"
                      className="p-2 text-red-600 hover:text-red-700"
                      title="Delete Order"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-semibold">Items:</h4>
                {(orderItems[order.id] || []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.recipe_name} - {item.quantity_type}</span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Order Status</label>
                  <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Order Received</SelectItem>
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
                    onClick={() => handlePrint(order, orderItems[order.id] || [])}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Printer size={16} className="mr-1" />
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