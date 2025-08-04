import type { Order, OrderItem } from '@/services/orderService';

interface PrintInvoiceProps {
  order: Order;
  items: OrderItem[];
}

const printInvoice = (invoice: any) => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${invoice.invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          position: relative;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .watermark-img {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: auto;
          opacity: 0.05;
          z-index: 0;
          pointer-events: none;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .logo {
          max-width: 50px;
          height: auto;
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .bill-to, .invoice-info {
          flex: 1;
        }
        .bill-to {
          margin-right: 20px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .total-section {
          text-align: right;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .total-final {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #333;
          padding-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
        }
        .footer-business {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .footer-details {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        .footer-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <img src="/logo.png" alt="Watermark" class="watermark-img" />
      <div class="invoice-container">
        <div class="header">
          <img src="/logo.png" alt="Company Logo" class="logo" />
          <div class="company-name">Artisan Delights</div>
        </div>

        <div class="invoice-details">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer_name || 'N/A'}</strong></p>
            <p>${invoice.phone_number || ''}</p>
            <p>${invoice.address || ''}</p>
          </div>
          <div class="invoice-info">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Status:</strong> ${(invoice.payment_status || 'unpaid').toUpperCase()}</p>
            <p><strong>Order Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ccc; background-color: #000; color: #fff; text-align: left;">
                Description
              </th>
              <th style="padding: 8px; border: 1px solid #ccc; background-color: #000; color: #fff; text-align: left;">
                Quantity
              </th>
              <th style="padding: 8px; border: 1px solid #ccc; background-color: #000; color: #fff; text-align: left;">
                Rate (₹)
              </th>
              <th style="padding: 8px; border: 1px solid #ccc; background-color: #000; color: #fff; text-align: left;">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ccc;">${item.recipe_name}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">${item.quantity}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">₹${Number(item.amount).toFixed(2)}</td>
                <td style="padding: 8px; border: 1px solid #ccc;">₹${Number(item.amount).toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row total-final">
            <span>Total:</span>
            <span>₹${(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #444; width: 100%; margin-top: 40px;">
          <hr style="width: 100%; border: none; border-top: 3px solid #333; margin: 10px 0;" />
          <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 6px;">
            Artisan Delights
          </div>
          <div style="display: flex; justify-content: center; align-items: center; gap: 30px; flex-wrap: wrap; font-size: 14px; color: #333;">
            <div style="display: flex; align-items: center; gap: 5px;">
              <span>📍</span>
              <span>Hyderabad - 500001</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span>📞</span>
              <span>+91 8500606000</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span>📧</span>
              <span>orders@artisandelights.com</span>
            </div>
          </div>
          <hr style="width: 100%; border: none; border-top: 1px solid #ccc; margin: 10px 0;" />
          <div style="text-align: center; font-size: 12px; color: #333;">
            <strong>This is a</strong> computer-generated invoice and does not require a signature.
          </div>
        </div>
      </div>

      <script>
        window.onload = function () {
          window.print();
          window.onafterprint = function () {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
};

export const usePrintInvoice = () => {
  const handlePrint = (order: Order, items: OrderItem[]) => {
    const getInvoiceNumber = (order: Order) => {
      return order.invoice_number
        ? `INV-${String(order.invoice_number).padStart(3, '0')}`
        : `INV-${order.id.substring(0, 3).toUpperCase()}`;
    };

    const invoice = {
      ...order,
      invoice_number: getInvoiceNumber(order),
      items: items,
    };

    printInvoice(invoice);
  };

  return { handlePrint };
};

export default printInvoice;