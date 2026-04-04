import React from 'react';
import { Order } from '@/services/orderService';

interface InvoiceTemplateProps {
  order: Order;
}

const formatInvoiceNo = (num: number) => `INV-${String(num).padStart(3, '0')}`;
const formatRupee = (amount: number) => `\u20B9${amount.toFixed(2)}`;

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
  return (
    <div
      id="invoice-print"
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#222',
        padding: '40px 50px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#ea580c',
            margin: '0 0 4px 0',
            letterSpacing: '2px',
          }}
        >
          ARTISAN DELIGHTS
        </h1>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          Premium Spices & Condiments
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '2px solid #ea580c', margin: '16px 0 24px 0' }} />

      {/* Bill To & Invoice Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 8px 0' }}>Bill To:</p>
          <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '0 0 4px 0' }}>{order.customer_name}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px 0' }}>{order.phone_number}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{order.address}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 8px 0', textDecoration: 'underline' }}>
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
            <span style={{ color: order.payment_status === 'paid' ? '#16a34a' : '#dc2626' }}>
              {(order.payment_status || 'Unpaid').charAt(0).toUpperCase() + (order.payment_status || 'unpaid').slice(1)}
            </span>
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '24px',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 'bold' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 'bold', width: '70px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 'bold', width: '110px' }}>
              Rate ({'\u20B9'})
            </th>
            <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 'bold', width: '120px' }}>
              Amount ({'\u20B9'})
            </th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 8px' }}>
                {item.recipe_name} - {item.quantity_type}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '12px 8px', textAlign: 'right' }}>{formatRupee(item.amount)}</td>
              <td style={{ padding: '12px 8px', textAlign: 'right' }}>{formatRupee(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span>Subtotal:</span>
            <span>{formatRupee(order.total_amount)}</span>
          </div>
          <div
            style={{
              borderTop: '2px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0 6px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            <span>Total:</span>
            <span>{formatRupee(order.total_amount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
              fontSize: '13px',
              color: order.payment_status === 'paid' ? '#16a34a' : '#dc2626',
            }}
          >
            <span>{order.payment_status === 'paid' ? 'Paid:' : 'Balance:'}</span>
            <span>
              {order.payment_status === 'paid' ? formatRupee(order.total_amount) : formatRupee(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50px',
          right: '50px',
          textAlign: 'center',
        }}
      >
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0', color: '#ea580c' }}>
            ARTISAN DELIGHTS
          </p>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px 0' }}>
            Premium Spices & Condiments
          </p>
          <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
