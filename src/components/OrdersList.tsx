import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Printer, Download, Pencil, Trash2, RefreshCw, Radio } from 'lucide-react';
import { fetchOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, Order, formatInvoiceNumber } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { quantityToKg } from '@/services/pricingService';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoiceTemplate from './InvoiceTemplate';
import EditOrderDialog from './EditOrderDialog';

interface OrdersListProps { onBackToDashboard: () => void; onEditOrder?: (order: Order) => void; }

const statusOptions = [
  ['pending', 'Pending'], ['received', 'Received'], ['confirmed', 'Confirmed'],
  ['processing', 'Processing'], ['order_sent', 'Order Sent'], ['shipped', 'Shipped'],
  ['delivered', 'Delivered'], ['cancelled', 'Cancelled'],
] as const;

const OrdersList: React.FC<OrdersListProps> = ({ onBackToDashboard }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const loadOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true); else setRefreshing(true);
    try { setOrders(await fetchOrders()); }
    catch (error) { console.error('Error loading orders:', error); toast({ title: 'Failed to load orders', variant: 'destructive' }); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel('urban-delights-orders-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => loadOrders(false))
      .subscribe();
    const interval = window.setInterval(() => loadOrders(false), 30000);
    return () => { window.clearInterval(interval); supabase.removeChannel(channel); };
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try { await updateOrderStatus(id, status); await loadOrders(false); toast({ title: 'Order status updated' }); }
    catch { toast({ title: 'Failed to update status', variant: 'destructive' }); }
  };

  const handlePaymentChange = async (id: string, status: string) => {
    try { await updatePaymentStatus(id, status); await loadOrders(false); toast({ title: 'Payment status updated' }); }
    catch { toast({ title: 'Failed to update payment', variant: 'destructive' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try { await deleteOrder(id); await loadOrders(false); toast({ title: 'Order deleted' }); }
    catch { toast({ title: 'Failed to delete order', variant: 'destructive' }); }
  };

  const formatRupee = (amount: number) => `₹${Number(amount || 0).toFixed(2)}`;
  const getOrderTotals = (order: Order) => {
    const subtotal = (order.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const discountPercent = Number(order.discount_percent) || 0;
    const taxRate = Number(order.tax_rate) || 0;
    const discount = subtotal * discountPercent / 100;
    const tax = (subtotal - discount) * taxRate / 100;
    return { subtotal, discountPercent, discount, taxRate, tax, total: subtotal - discount + tax };
  };
  const getRatePerKg = (amount: number, quantityType: string) => { const kg = quantityToKg(quantityType); return kg > 0 ? amount / kg : 0; };
  const getTotalQuantity = (order: Order) => `${(order.items || []).reduce((sum, item) => sum + quantityToKg(item.quantity_type), 0).toFixed(3)} Kgs`;

  const prepareInvoice = async (order: Order) => {
    setPrintingOrder(order);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!invoiceRef.current) { setPrintingOrder(null); throw new Error('Invoice could not be rendered.'); }
    return invoiceRef.current;
  };
  const getOrderDateStamp = (orderDate: string | null) => {
    if (!orderDate) return '000000';
    const match = orderDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[3]}${match[2]}${match[1].slice(-2)}`;
    const parsed = new Date(orderDate);
    return Number.isNaN(parsed.getTime()) ? '000000' : `${String(parsed.getDate()).padStart(2, '0')}${String(parsed.getMonth() + 1).padStart(2, '0')}${String(parsed.getFullYear()).slice(-2)}`;
  };

  const downloadInvoicePDF = async (order: Order) => {
    try {
      const element = await prepareInvoice(order);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`UrbanDelights-${formatInvoiceNumber(order.invoice_number, order.order_date)}-${getOrderDateStamp(order.order_date)}.pdf`);
    } catch (error) { console.error(error); toast({ title: 'Failed to download invoice', variant: 'destructive' }); }
    finally { setPrintingOrder(null); }
  };

  const printInvoice = async (order: Order) => {
    try {
      const element = await prepareInvoice(order);
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) { toast({ title: 'Please allow pop-ups to print the invoice', variant: 'destructive' }); return; }
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(node => node.outerHTML).join('\n');
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${formatInvoiceNumber(order.invoice_number, order.order_date)}</title>${styles}<style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}body{display:flex;justify-content:center}.print-wrapper{width:794px}.print-wrapper #invoice-print{margin:0!important;left:auto!important;position:relative!important}</style></head><body><div class="print-wrapper">${element.outerHTML}</div></body></html>`);
      printWindow.document.close(); await new Promise(resolve => setTimeout(resolve, 700)); printWindow.focus(); printWindow.print(); printWindow.onafterprint = () => printWindow.close();
    } catch (error) { console.error(error); toast({ title: 'Failed to print invoice', variant: 'destructive' }); }
    finally { setPrintingOrder(null); }
  };

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" size="sm" onClick={onBackToDashboard}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button>
      <div className="flex items-center gap-2"><span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600"><Radio className="h-3 w-3" /> Live</span><Button variant="outline" size="sm" onClick={() => loadOrders(false)} disabled={refreshing}><RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</Button></div>
    </div>
    <Card>
      <CardHeader><CardTitle>Orders Management</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading orders...</p> : orders.length === 0 ? <p className="text-center py-8 text-muted-foreground">No orders found.</p> : <div className="overflow-x-auto">
          <Table><TableHeader><TableRow>
            <TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead className="min-w-[470px]">Items</TableHead><TableHead>Subtotal</TableHead><TableHead>Discount</TableHead><TableHead>Tax</TableHead><TableHead>Total</TableHead><TableHead>Order Status</TableHead><TableHead>Payment</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader><TableBody>
            {orders.map(order => { const totals = getOrderTotals(order); return <TableRow key={order.id}>
              <TableCell className="font-medium align-top whitespace-nowrap">{formatInvoiceNumber(order.invoice_number, order.order_date)}</TableCell>
              <TableCell className="align-top"><div className="font-medium">{order.customer_name}</div><div className="text-xs text-muted-foreground">{order.order_date || order.created_at.slice(0, 10)}</div></TableCell>
              <TableCell className="align-top whitespace-nowrap">{order.phone_number}</TableCell>
              <TableCell className="align-top p-2"><div className="min-w-[450px]">
                <div className="grid grid-cols-[35px_minmax(155px,1fr)_65px_90px_90px] gap-x-2 border-b pb-1 mb-1 text-xs font-semibold text-muted-foreground"><span className="text-center">S.No.</span><span>Product</span><span>Qty</span><span className="text-right">Rate (₹/Kg)</span><span className="text-right">Amount (₹)</span></div>
                {(order.items || []).map((item, i) => { const rate = getRatePerKg(Number(item.amount || 0), item.quantity_type); return <div key={i} className="grid grid-cols-[35px_minmax(155px,1fr)_65px_90px_90px] gap-x-2 text-xs py-0.5"><span className="text-center">{i + 1}</span><span>{item.recipe_name}</span><span>{item.quantity_type}</span><span className="text-right">{rate > 0 ? rate.toFixed(2) : '—'}</span><span className="text-right">{formatRupee(item.amount)}</span></div>; })}
                {(order.items || []).length > 0 && <div className="grid grid-cols-[35px_minmax(155px,1fr)_65px_90px_90px] gap-x-2 border-t mt-1 pt-1 text-xs font-semibold"><span></span><span>Total Quantity</span><span>{getTotalQuantity(order)}</span><span></span><span></span></div>}
              </div></TableCell>
              <TableCell className="align-top whitespace-nowrap">{formatRupee(totals.subtotal)}</TableCell><TableCell className="align-top whitespace-nowrap">{totals.discountPercent > 0 ? `-${formatRupee(totals.discount)}` : formatRupee(0)}{totals.discountPercent > 0 && <div className="text-xs text-muted-foreground">{totals.discountPercent}%</div>}</TableCell><TableCell className="align-top whitespace-nowrap">{formatRupee(totals.tax)}<div className="text-xs text-muted-foreground">{totals.taxRate}%</div></TableCell><TableCell className="font-medium align-top whitespace-nowrap">{formatRupee(totals.total || Number(order.total_amount || 0))}</TableCell>
              <TableCell className="align-top"><Select value={order.status || 'pending'} onValueChange={v => handleStatusChange(order.id, v)}><SelectTrigger className="w-[135px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></TableCell>
              <TableCell className="align-top"><Select value={order.payment_status || 'pending'} onValueChange={v => handlePaymentChange(order.id, v)}><SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select></TableCell>
              <TableCell className="align-top"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" title="Print Invoice" onClick={() => printInvoice(order)}><Printer className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" title="Download Invoice PDF" onClick={() => downloadInvoicePDF(order)}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Order" onClick={() => setEditingOrder(order)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete Order" onClick={() => handleDelete(order.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
            </TableRow>; })}
          </TableBody></Table>
        </div>}
      </CardContent>
    </Card>
    {printingOrder && <div style={{ position: 'fixed', left: '-9999px', top: 0 }}><div ref={invoiceRef}><InvoiceTemplate order={printingOrder} /></div></div>}
    <EditOrderDialog order={editingOrder} open={!!editingOrder} onClose={() => setEditingOrder(null)} onUpdated={() => loadOrders(false)} />
  </div>;
};

export default OrdersList;
