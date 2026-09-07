import React from 'react';
import { Order } from '@/services/orderService';
import { quantityToKg } from '@/services/pricingService';

interface InvoiceTemplateProps { order: Order; }
const ORANGE = '#ea580c';
const formatInvoiceNo = (num: number) => `INV-${String(num).padStart(3, '0')}`;
const formatRupee = (amount: number) => `\u20B9${Number(amount || 0).toFixed(2)}`;
const formatRate = (amount: number, quantityType: string) => {
  const kg = quantityToKg(quantityType);
  if (kg <= 0) return '—';
  const rate = Number(amount || 0) / kg;
  return `${Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(2)}/Kg`;
};
const formatTotalQuantity = (items: Order['items'] = []) => {
  const totalKg = items.reduce((sum, item) => sum + quantityToKg(item.quantity_type), 0);
  return `${totalKg.toFixed(3)} Kgs`;
};

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
  const discountPercent = Number(order.discount_percent) || 0;
  const taxRate = Number(order.tax_rate) || 0;
  const itemSubtotal = (order.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const discountAmount = (itemSubtotal * discountPercent) / 100;
  const taxableAmount = itemSubtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const calculatedTotal = taxableAmount + taxAmount;
  const totalAmount = (order.items || []).length > 0 ? calculatedTotal : Number(order.total_amount || 0);

  return (
    <div id="invoice-print" style={{ width: '794px', height: '1123px', background: '#fff', fontFamily: 'Arial, Helvetica, sans-serif', color: '#222', padding: '40px 50px', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="text-center" style={{ borderBottom: `2px solid ${ORANGE}`, paddingBottom: '10px', marginBottom: '16px' }}>
        <div className="flex justify-center" style={{ marginBottom: '2px' }}><img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" /></div>
        <p className="text-sm text-slate-600" style={{ margin: 0 }}>Premium Spices & Condiments</p>
      </div>
      <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', letterSpacing: '3px', color: '#1e293b', margin: '0 0 14px 0' }}>INVOICE</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 6px 0' }}>Bill To:</p>
          <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 3px 0' }}>{order.customer_name}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '0 0 1px 0' }}>{order.phone_number}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{order.address}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 6px 0', textDecoration: 'underline' }}>Invoice Details:</p>
          <p style={{ fontSize: '13px', margin: '0 0 3px 0' }}><strong>Invoice #:</strong> {formatInvoiceNo(order.invoice_number)}</p>
          <p style={{ fontSize: '13px', margin: '0 0 3px 0' }}><strong>Date:</strong> {order.order_date || new Date().toLocaleDateString('en-IN')}</p>
          <p style={{ fontSize: '13px', margin: 0 }}><strong>Status:</strong>{' '}<span style={{ color: order.payment_status === 'paid' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{(order.payment_status || 'unpaid').charAt(0).toUpperCase() + (order.payment_status || 'unpaid').slice(1)}</span></p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <thead><tr style={{ borderBottom: `2px solid ${ORANGE}` }}>
          <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold' }}>Description</th>
          <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold', width: '100px' }}>Qty</th>
          <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold', width: '120px' }}>Rate (₹)</th>
          <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold', width: '130px' }}>Amount (₹)</th>
        </tr></thead>
        <tbody>
          {(order.items || []).map((item, i) => <tr key={i} style={{ borderBottom: `1px solid ${ORANGE}` }}>
            <td style={{ padding: '12px 8px' }}>{item.recipe_name}</td>
            <td style={{ padding: '12px 8px' }}>{item.quantity_type}</td>
            <td style={{ padding: '12px 8px' }}>{formatRate(Number(item.amount || 0), item.quantity_type)}</td>
            <td style={{ padding: '12px 8px' }}>{Number(item.amount || 0).toFixed(2)}</td>
          </tr>)}
          {(order.items || []).length > 0 && <tr style={{ borderTop: `2px solid ${ORANGE}` }}>
            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>Total Quantity</td>
            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{formatTotalQuantity(order.items)}</td>
            <td colSpan={2} style={{ padding: '12px 8px' }}></td>
          </tr>}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}><div style={{ width: '280px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}><span>Subtotal:</span><span>{formatRupee(itemSubtotal)}</span></div>
        {discountPercent > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}><span>Discount ({discountPercent}%):</span><span>-{formatRupee(discountAmount)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}><span>Tax ({taxRate}%):</span><span>{formatRupee(taxAmount)}</span></div>
        <div style={{ borderTop: `2px solid ${ORANGE}`, display: 'flex', justifyContent: 'space-between', padding: '10px 0 6px 0', fontSize: '16px', fontWeight: 'bold' }}><span>Total:</span><span>{formatRupee(totalAmount)}</span></div>
      </div></div>
      <div style={{ marginTop: 'auto', borderTop: `2px solid ${ORANGE}`, paddingTop: '20px' }}>
        <div className="text-center"><div className="flex justify-center gap-8 text-sm text-slate-600" style={{ flexWrap: 'wrap' }}><span>📍 #202, RK Residency, Ravalkole, Medchal</span><span>📞 +91 8500 60 6000</span><span>📧 support@urbandelights.com</span></div></div>
        <p className="text-center text-xs text-slate-500" style={{ marginTop: '16px', marginBottom: 0 }}>This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
};
export default InvoiceTemplate;
