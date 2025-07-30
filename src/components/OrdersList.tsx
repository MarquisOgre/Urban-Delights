import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOrders, fetchOrderItems, updateOrderStatus, updatePaymentStatus } from '@/services/orderService';
import type { Order, OrderItem } from '@/services/orderService';
import jsPDF from 'jspdf';

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
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Company Logo/Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SPICE HOUSE', pageWidth / 2, 30, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Premium Quality Spices & Powders', pageWidth / 2, 38, { align: 'center' });
    
    // Invoice title and number
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INVOICE', pageWidth / 2, 55, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice #: INV-${order.id.substring(0, 8).toUpperCase()}`, 20, 70);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 20, 78);
    
    // Customer details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', 20, 95);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(order.customer_name, 20, 105);
    pdf.text(order.phone_number, 20, 113);
    
    // Split address into multiple lines if too long
    const addressLines = pdf.splitTextToSize(order.address, 80);
    let addressY = 121;
    addressLines.forEach((line: string) => {
      pdf.text(line, 20, addressY);
      addressY += 8;
    });
    
    // Table header
    const tableTop = Math.max(140, addressY + 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    // Table headers
    pdf.text('Item', 20, tableTop);
    pdf.text('Quantity', 100, tableTop);
    pdf.text('Amount (₹)', 150, tableTop);
    
    // Draw header line
    pdf.line(20, tableTop + 2, pageWidth - 20, tableTop + 2);
    
    // Table content
    pdf.setFont('helvetica', 'normal');
    let yPosition = tableTop + 12;
    let subtotal = 0;
    
    items.forEach((item) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(item.recipe_name, 20, yPosition);
      pdf.text(item.quantity_type, 100, yPosition);
      pdf.text(`₹${item.amount.toFixed(2)}`, 150, yPosition);
      
      subtotal += Number(item.amount);
      yPosition += 10;
    });
    
    // Draw line before totals
    pdf.line(100, yPosition + 5, pageWidth - 20, yPosition + 5);
    
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Amount:', 100, yPosition + 15);
    pdf.text(`₹${order.total_amount}`, 150, yPosition + 15);
    
    // Payment status
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Payment Status: ${order.payment_status?.toUpperCase() || 'UNPAID'}`, 20, yPosition + 25);
    pdf.text(`Order Status: ${order.status?.toUpperCase() || 'PENDING'}`, 20, yPosition + 33);
    
    // Company address at bottom
    const footerY = pageHeight - 40;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SPICE HOUSE', pageWidth / 2, footerY, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('123 Spice Market, Food Street', pageWidth / 2, footerY + 8, { align: 'center' });
    pdf.text('Hyderabad, Telangana - 500001', pageWidth / 2, footerY + 16, { align: 'center' });
    pdf.text('Phone: +91 9876543210 | Email: orders@spicehouse.com', pageWidth / 2, footerY + 24, { align: 'center' });
    
    // Save the PDF
    pdf.save(`invoice-${order.id.substring(0, 8)}.pdf`);
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