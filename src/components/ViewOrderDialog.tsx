import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderItem } from '@/services/orderService';

interface ViewOrderDialogProps {
  order: Order;
  items: OrderItem[];
  children: React.ReactNode;
}

const ViewOrderDialog: React.FC<ViewOrderDialogProps> = ({ order, items, children }) => {
  const getInvoiceNumber = (order: Order) => {
    return order.invoice_number ? `INV-${String(order.invoice_number).padStart(3, '0')}` : `INV-${order.id.substring(0, 3).toUpperCase()}`;
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center w-full">Order Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Header */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
            </div>
          </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {/* Customer Information - Left */}
          <div className="md:w-1/2">
            <h4 className="font-semibold mb-3 text-center">Customer Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div><strong>Name:</strong> {order.customer_name}</div>
              <div><strong>Phone:</strong> {order.phone_number}</div>
              <div><strong>Address:</strong> {order.address}</div>
            </div>
          </div>

          {/* Invoice Info - Right */}
          <div className="md:w-1/2">
            <h4 className="font-semibold mb-3 text-center">Invoice Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 md:text-left">
              <div><strong>Invoice:</strong> {getInvoiceNumber(order)}</div>
              <div><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
              <div className="h-4" /> {/* This adds ~1 line of space */}

          {/* Order Summary */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h5 className="font-medium text-gray-700">Order Status</h5>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'received' ? 'Order Received' : order.status === 'order_sent' ? 'Order Sent' : order.status}
                      </Badge>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700">Payment Status</h5>
                      <Badge className={getPaymentStatusColor(order.payment_status || 'unpaid')}>
                        {(order.payment_status || 'unpaid').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
            </div>
          </div>
        </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-3">Order Items</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Item</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">{item.recipe_name}</td>
                      <td className="p-3">{item.quantity_type}</td>
                      <td className="p-3 text-right font-medium">₹{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan={2} className="p-3 font-semibold text-right">Total:</td>
                    <td className="p-3 text-right font-bold text-lg">₹{order.total_amount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h5 className="font-medium text-gray-700">Order Status</h5>
              <Badge className={getStatusColor(order.status)}>
                {order.status === 'received' ? 'Order Received' : order.status === 'order_sent' ? 'Order Sent' : order.status}
              </Badge>
            </div>
            <div>
              <h5 className="font-medium text-gray-700">Payment Status</h5>
              <Badge className={getPaymentStatusColor(order.payment_status || 'unpaid')}>
                {(order.payment_status || 'unpaid').toUpperCase()}
              </Badge>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrderDialog;