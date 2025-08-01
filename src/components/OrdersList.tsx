import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Edit3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOrders, fetchOrderItems, updateOrderStatus, updatePaymentStatus, deleteOrder } from '@/services/orderService';
import type { Order, OrderItem } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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

  const generateInvoice = (order: Order) => {
    const items = orderItems[order.id] || [];
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Company Logo/Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SPICE HOUSE', pageWidth / 2, 30, { align: 'center' });
    
    // Draw line under header
    pdf.line(20, 40, pageWidth - 20, 40);
    
    // Two-column layout for Bill To and Invoice Details
    const leftColumnX = 20;
    const rightColumnX = pageWidth / 2 + 10;
    
    // Bill To section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', leftColumnX, 60);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(order.customer_name, leftColumnX, 70);
    pdf.text(order.phone_number, leftColumnX, 78);
    pdf.text(order.address, leftColumnX, 86);
    
    // Invoice Details section
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice #: ${getInvoiceNumber(order)}`, rightColumnX, 60);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, rightColumnX, 68);
    pdf.text(`Payment Status: ${(order.payment_status || 'unpaid').toUpperCase()}`, rightColumnX, 76);
    pdf.text(`Order Status: ${order.status.toUpperCase()}`, rightColumnX, 84);
    
    // Table section
    const tableTop = 110;
    
    // Table background for header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableTop - 8, pageWidth - 40, 16, 'F');
    
    // Table headers
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', 25, tableTop);
    pdf.text('Quantity', 100, tableTop);
    pdf.text('Rate (₹)', 130, tableTop);
    pdf.text('Amount (₹)', 160, tableTop);
    
    // Table content
    pdf.setFont('helvetica', 'normal');
    let yPosition = tableTop + 15;
    let subtotal = 0;
    
    items.forEach((item, index) => {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, yPosition - 6, pageWidth - 40, 12, 'F');
      }
      
      pdf.text(item.recipe_name, 25, yPosition);
      pdf.text(item.quantity_type, 100, yPosition);
      pdf.text(`₹${Number(item.amount).toFixed(2)}`, 130, yPosition);
      pdf.text(`₹${Number(item.amount).toFixed(2)}`, 160, yPosition);
      
      subtotal += Number(item.amount);
      yPosition += 12;
    });
    
    // Totals section
    const totalsStartY = yPosition + 10;
    
    // Subtotal
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', 130, totalsStartY);
    pdf.text(`₹${subtotal.toFixed(2)}`, 160, totalsStartY);
    
    // Tax (5%)
    const tax = subtotal * 0.05;
    pdf.text('Tax (5%):', 130, totalsStartY + 10);
    pdf.text(`₹${tax.toFixed(2)}`, 160, totalsStartY + 10);
    
    // Draw line above total
    pdf.line(130, totalsStartY + 18, pageWidth - 20, totalsStartY + 18);
    
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Total:', 130, totalsStartY + 25);
    pdf.text(`₹${order.total_amount}`, 160, totalsStartY + 25);
    
    // Footer with company details
    const footerY = pageHeight - 30;
    
    // Company logo/name in footer
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SPICE HOUSE', pageWidth / 2, footerY - 10, { align: 'center' });
    
    // Contact details in single line
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('123 Spice Market, Food Street, Hyderabad - 500001 | +91 9876543210 | orders@spicehouse.com', pageWidth / 2, footerY, { align: 'center' });
    
    // Computer generated invoice disclaimer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 8, { align: 'center' });
    
    // Save the PDF
    pdf.save(`${getInvoiceNumber(order)}.pdf`);
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
                      <Button
                        onClick={() => generateInvoice(order)}
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="Print Invoice"
                      >
                        <Printer size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="Edit Order"
                      >
                        <Edit3 size={16} />
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
                    <Button
                      onClick={() => generateInvoice(order)}
                      size="sm"
                      variant="outline"
                      className="p-2"
                      title="Print Invoice"
                    >
                      <Printer size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2"
                      title="Edit Order"
                    >
                      <Edit3 size={16} />
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
                    onClick={() => generateInvoice(order)}
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