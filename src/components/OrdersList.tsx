import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Pencil, Trash2 } from 'lucide-react';
import { fetchOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrdersListProps {
  onBackToDashboard: () => void;
  onEditOrder?: (order: Order) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ onBackToDashboard, onEditOrder }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({ title: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      await loadOrders();
      toast({ title: 'Status updated' });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handlePaymentChange = async (id: string, status: string) => {
    try {
      await updatePaymentStatus(id, status);
      await loadOrders();
      toast({ title: 'Payment status updated' });
    } catch {
      toast({ title: 'Failed to update payment', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      await loadOrders();
      toast({ title: 'Order deleted' });
    } catch {
      toast({ title: 'Failed to delete order', variant: 'destructive' });
    }
  };

  const formatInvoiceNo = (num: number) => `INV-${String(num).padStart(3, '0')}`;

  const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(234, 88, 12); // orange-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Artisan Delights', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Spices & Condiments', 14, 28);
    doc.text(`INVOICE`, pageWidth - 14, 18, { align: 'right' });
    doc.text(formatInvoiceNo(order.invoice_number), pageWidth - 14, 26, { align: 'right' });

    // Reset
    doc.setTextColor(0, 0, 0);
    let y = 50;

    // Bill To & Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, y);
    doc.text('Invoice Details:', pageWidth / 2 + 10, y);
    
    doc.setFont('helvetica', 'normal');
    y += 7;
    doc.text(order.customer_name, 14, y);
    doc.text(`Invoice #: ${formatInvoiceNo(order.invoice_number)}`, pageWidth / 2 + 10, y);
    y += 6;
    doc.text(order.phone_number, 14, y);
    doc.text(`Date: ${order.order_date || new Date().toLocaleDateString('en-IN')}`, pageWidth / 2 + 10, y);
    y += 6;
    doc.text(order.address, 14, y);
    doc.text(`Payment: ${(order.payment_status || 'unpaid').toUpperCase()}`, pageWidth / 2 + 10, y);
    y += 6;
    doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth / 2 + 10, y);

    y += 12;

    // Items table
    const tableData = (order.items || []).map((item, i) => [
      String(i + 1),
      item.recipe_name,
      item.quantity_type,
      `₹${item.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Product', 'Quantity', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [234, 88, 12] },
      foot: [['', '', 'Total', `₹${order.total_amount.toFixed(2)}`]],
      footStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Artisan Delights | Premium Spices & Condiments', pageWidth / 2, footerY, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`invoice-${formatInvoiceNo(order.invoice_number)}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'order_sent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string | null) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{formatInvoiceNo(order.invoice_number)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.phone_number}</TableCell>
                      <TableCell>
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="text-xs">{item.recipe_name} ({item.quantity_type})</div>
                        ))}
                      </TableCell>
                      <TableCell className="font-medium">₹{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="order_sent">Order Sent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={order.payment_status || 'unpaid'} onValueChange={(v) => handlePaymentChange(order.id, v)}>
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateInvoicePDF(order)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          {onEditOrder && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditOrder(order)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(order.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersList;
