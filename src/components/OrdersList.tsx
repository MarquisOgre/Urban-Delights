import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Pencil, Trash2 } from 'lucide-react';
import { fetchOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoiceTemplate from './InvoiceTemplate';
import EditOrderDialog from './EditOrderDialog';

interface OrdersListProps {
  onBackToDashboard: () => void;
  onEditOrder?: (order: Order) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ onBackToDashboard }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const generateInvoicePDF = async (order: Order) => {
    setPrintingOrder(order);
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 300));

    const element = invoiceRef.current;
    if (!element) {
      setPrintingOrder(null);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${formatInvoiceNo(order.invoice_number)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: 'Failed to generate invoice', variant: 'destructive' });
    } finally {
      setPrintingOrder(null);
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
                      <TableCell className="font-medium">{'\u20B9'}{order.total_amount.toFixed(2)}</TableCell>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingOrder(order)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(order.id)}>
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

      {/* Hidden invoice template for PDF generation */}
      {printingOrder && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div ref={invoiceRef}>
            <InvoiceTemplate order={printingOrder} />
          </div>
        </div>
      )}

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={editingOrder}
        open={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdated={loadOrders}
      />
    </div>
  );
};

export default OrdersList;
