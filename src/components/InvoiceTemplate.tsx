import React from 'react';
import { Order } from '@/services/orderService';

interface InvoiceTemplateProps {
  order: Order;
}

const ORANGE = '#ea580c';

const formatInvoiceNo = (num: number) =>
  `INV-${String(num).padStart(3, '0')}`;

const formatRupee = (amount: number) =>
  `\u20B9${Number(amount || 0).toFixed(2)}`;

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
  const paymentStatus = order.payment_status || 'unpaid';
  const isPaid = paymentStatus === 'paid';

  const discountPercent = Number(order.discount_percent) || 0;
  const taxRate = Number(order.tax_rate) || 0;
  const itemSubtotal = (order.items || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const discountAmount = (itemSubtotal * discountPercent) / 100;
  const taxableAmount = itemSubtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const calculatedTotal = taxableAmount + taxAmount;

  const totalAmount = (order.items || []).length > 0
    ? calculatedTotal
    : Number(order.total_amount || 0);

  return (
    <div
      id="invoice-print"
      style={{
        width: '794px',
        height: '1123px',
        background: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#222',
        padding: '40px 50px',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="text-center pb-6 mb-6"
        style={{ borderBottom: `2px solid ${ORANGE}` }}
      >
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Premium Spices & Condiments
        </p>
      </div>

      <h1
        style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          letterSpacing: '3px',
          color: '#1e293b',
          margin: '0 0 24px 0',
        }}
      >
        INVOICE
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 8px 0' }}>
            Bill To:
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 4px 0' }}>
            {order.customer_name}
          </p>
          <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px 0' }}>
            {order.phone_number}
          </p>
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            {order.address}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontWeight: 'bold',
              fontSize: '13px',
              margin: '0 0 8px 0',
              textDecoration: 'underline',
            }}
          >
            Invoice Details:
          </p>
          <p style={{ fontSize: '13px', margin: '0 0 4px 0' }}>
            <strong>Invoice #:</strong> {formatInvoiceNo(order.invoice_number)}
          </p>
          <p style={{ fontSize: '13px', margin: '0 0 4px 0' }}>
            <strong>Date:</strong> {order.order_date || new Date().toLocaleDateString('en-IN')}
          </p>
          <p style={{ fontSize: '13px', margin: 0 }}>
            <strong>Status:</strong>{' '}
            <span
              style={{
                color: isPaid ? '#16a34a' : '#dc2626',
                fontWeight: 'bold',
              }}
            >
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </span>
          </p>
        </div>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '24px',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: `2px solid ${ORANGE}` }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold' }}>
              Description
            </th>
            <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 'bold', width: '70px' }}>
              Qty
            </th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 'bold', width: '110px' }}>
              Rate (\u20B9)
            </th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 'bold', width: '120px' }}>
              Amount (\u20B9)
            </th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${ORANGE}` }}>
              <td style={{ padding: '12px 8px' }}>
                {item.recipe_name} - {item.quantity_type}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                {formatRupee(item.amount)}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                {formatRupee(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span>Subtotal:</span>
            <span>{formatRupee(itemSubtotal)}</span>
          </div>

          {discountPercent > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span>Discount ({discountPercent}%):</span>
              <span>-{formatRupee(discountAmount)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span>Tax ({taxRate}%):</span>
            <span>{formatRupee(taxAmount)}</span>
          </div>

          <div style={{ borderTop: `2px solid ${ORANGE}`, display: 'flex', justifyContent: 'space-between', padding: '10px 0 6px 0', fontSize: '16px', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>{formatRupee(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 'auto',
          borderTop: `2px solid ${ORANGE}`,
          paddingTop: '20px',
        }}
      >
        <div className="text-center">
          <div className="flex justify-center gap-8 text-sm text-slate-600" style={{ flexWrap: 'wrap' }}>
            <span>📍 #202, RK Residency, Ravalkole, Medchal</span>
            <span>📞 +91 8500 60 6000</span>
            <span>📧 support@urbandelights.com</span>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500" style={{ marginTop: '16px', marginBottom: 0 }}>
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
