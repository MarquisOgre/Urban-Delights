import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Pencil, Trash2 } from 'lucide-react';
import { fetchOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { quantityToKg } from '@/services/pricingService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoiceTemplate from './InvoiceTemplate';
import EditOrderDialog from './EditOrderDialog';

interface OrdersListProps { onBackToDashboard: () => void; onEditOrder?: (order: Order) => void; }

const OrdersList: React.FC<OrdersListProps> = ({ onBackToDashboard }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const loadOrders = async () => {
    setLoading(true);
    try { setOrders(await fetchOrders()); }
    catch (error) { console.error('Error loading orders:', error); toast({ title: 'Failed to load orders', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateOrderStatus(id, status); await loadOrders(); toast({ title: 'Status updated' }); }
    catch { toast({ title: 'Failed to update status', variant: 'destructive' }); }
  };

  const handlePaymentChange = async (id: string, status: string) => {
    try { await updatePaymentStatus(id, status); await loadOrders(); toast({ title: 'Payment status updated' }); }
    catch { toast({ title: 'Failed to update payment', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try { await deleteOrder(id); await loadOrders(); toast({ title: 'Order deleted' }); }
    catch { toast({ title: 'Failed to delete order', variant: 'destructive' }); }
  };

  const formatInvoiceNo = (num: number) => `INV-${String(num).padStart(3, '0')}`;
  const formatRupee = (amount: number) => `₹${Number(amount || 0).toFixed(2)}`;

  const getOrderTotals = (order: Order) => {
    const subtotal = (order.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discountPercent = Number(order.discount_percent) || 0;
    const taxRate = Number(order.tax_rate) || 0;
    const discount = subtotal * discountPercent / 100;
    const tax = (subtotal - discount) * taxRate / 100;
    return { subtotal, discountPercent, discount, taxRate, tax, total: subtotal - discount + tax };
  };

  const getRatePerKg = (amount: number, quantityType: string) => {
    const kg = quantityToKg(quantityType);
    return kg > 0 ? amount / kg : 0;
  };

  const getTotalQuantity = (order: Order) => {
    const totalKg = (order.items || []).reduce((sum, item) => sum + quantityToKg(item.quantity_type), 0);
    return `${totalKg.toFixed(3)} Kgs`;
  };

  const generateInvoicePDF = async (order: Order) => {
    setPrintingOrder(order);
    await new Promise(resolve => setTimeout(resolve, 300));
    const element = invoiceRef.current;
    if (!element) { setPrintingOrder(null); return; }
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${formatInvoiceNo(order.invoice_number)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: 'Failed to generate invoice', variant: 'destructive' });
    } finally { setPrintingOrder(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBackToDashboard}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Orders Management</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading orders...</p> : orders.length === 0 ? <p className="text-center py-8 text-muted-foreground">No orders found.</p> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Phone</TableHead>
                  <TableHead className="min-w-[430px]">Items</TableHead><TableHead>Subtotal</TableHead><TableHead>Discount</TableHead><TableHead>Tax</TableHead><TableHead>Total</TableHead>
                  <TableHead>Order Status</TableHead><TableHead>Payment</TableHead><TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {orders.map(order => {
                    const totals = getOrderTotals(order);
                    return <TableRow key={order.id}>
                      <TableCell className="font-medium align-top">{formatInvoiceNo(order.invoice_number)}</TableCell>
                      <TableCell className="align-top">{order.customer_name}</TableCell>
                      <TableCell className="align-top whitespace-nowrap">{order.phone_number}</TableCell>
                      <TableCell className="align-top p-2">
                        <div className="min-w-[410px]">
                          <div className="grid grid-cols-[minmax(170px,1fr)_70px_90px_90px] gap-x-2 border-b pb-1 mb-1 text-xs font-semibold text-muted-foreground"><span>Product</span><span>Qty</span><span className="text-right">Rate (₹/Kg)</span><span className="text-right">Amount (₹)</span></div>
                          {(order.items || []).map((item, i) => { const rate = getRatePerKg(Number(item.amount || 0), item.quantity_type); return <div key={i} className="grid grid-cols-[minmax(170px,1fr)_70px_90px_90px] gap-x-2 text-xs py-0.5"><span>{item.recipe_name}</span><span>{item.quantity_type}</span><span className="text-right">{rate > 0 ? rate.toFixed(2) : '—'}</span><span className="text-right">{formatRupee(item.amount)}</span></div>; })}
                          {(order.items || []).length > 0 && <div className="grid grid-cols-[minmax(170px,1fr)_70px_90px_90px] gap-x-2 border-t mt-1 pt-1 text-xs font-semibold"><span>Total Quantity</span><span>{getTotalQuantity(order)}</span><span></span><span></span></div>}
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-nowrap">{formatRupee(totals.subtotal)}</TableCell>
                      <TableCell className="align-top whitespace-nowrap">{totals.discountPercent > 0 ? `-${formatRupee(totals.discount)}` : formatRupee(0)}{totals.discountPercent > 0 && <div className="text-xs text-muted-foreground">{totals.discountPercent}%</div>}</TableCell>
                      <TableCell className="align-top whitespace-nowrap">{formatRupee(totals.tax)}<div className="text-xs text-muted-foreground">{totals.taxRate}%</div></TableCell>
                      <TableCell className="font-medium align-top whitespace-nowrap">{formatRupee(totals.total)}</TableCell>
                      <TableCell className="align-top"><Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="received">Received</SelectItem><SelectItem value="order_sent">Order Sent</SelectItem></SelectContent></Select></TableCell>
                      <TableCell className="align-top"><Select value={order.payment_status || 'unpaid'} onValueChange={v => handlePaymentChange(order.id, v)}><SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unpaid">Unpaid</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></TableCell>
                      <TableCell className="align-top"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateInvoicePDF(order)}><Printer className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingOrder(order)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(order.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                    </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {printingOrder && <div style={{ position: 'fixed', left: '-9999px', top: 0 }}><div ref={invoiceRef}><InvoiceTemplate order={printingOrder} /></div></div>}
      <EditOrderDialog order={editingOrder} open={!!editingOrder} onClose={() => setEditingOrder(null)} onUpdated={loadOrders} />
    </div>
  );
};

export default OrdersList;
