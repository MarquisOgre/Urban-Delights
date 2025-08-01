import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchOrderItems, fetchRecipePricing } from '@/services/orderService';
import type { Order, OrderItem, RecipePricing } from '@/services/orderService';
import { Trash2, Plus } from 'lucide-react';

interface EditOrderDialogProps {
  order: Order;
  onOrderUpdated: () => void;
  children: React.ReactNode;
}

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({ order, onOrderUpdated, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: order.customer_name,
    phone_number: order.phone_number,
    address: order.address,
  });
  const [orderItems, setOrderItems] = useState<OrderItemEdit[]>([]);
  const [availablePricing, setAvailablePricing] = useState<RecipePricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadOrderData();
    }
  }, [isOpen, order]);

  const loadOrderData = async () => {
    try {
      setFormData({
        customer_name: order.customer_name,
        phone_number: order.phone_number,
        address: order.address,
      });

      // Load order items and available pricing
      const [items, pricing] = await Promise.all([
        fetchOrderItems(order.id),
        fetchRecipePricing()
      ]);

      setOrderItems(items);
      setAvailablePricing(pricing.filter(p => p.is_enabled));
    } catch (error) {
      console.error('Error loading order data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order data',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate new total
      const newTotal = orderItems.reduce((sum, item) => sum + Number(item.amount), 0);

      // Update order details
      const { error: orderError } = await (supabase as any)
        .from('orders')
        .update({
          customer_name: formData.customer_name,
          phone_number: formData.phone_number,
          address: formData.address,
          total_amount: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Delete all existing order items
      const { error: deleteError } = await (supabase as any)
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (deleteError) throw deleteError;

      // Insert updated order items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        recipe_name: item.recipe_name,
        quantity_type: item.quantity_type,
        amount: Number(item.amount)
      }));

      const { error: insertError } = await (supabase as any)
        .from('order_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });

      setIsOpen(false);
      onOrderUpdated();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // If recipe and quantity are selected, auto-fill amount from pricing
      if (field === 'recipe_name' || field === 'quantity_type') {
        const item = newItems[index];
        if (item.recipe_name && item.quantity_type) {
          const pricing = availablePricing.find(p => 
            p.recipe_name === item.recipe_name && p.quantity_type === item.quantity_type
          );
          if (pricing) {
            newItems[index].amount = pricing.price;
          }
        }
      }
      
      return newItems;
    });
  };

  const addNewItem = () => {
    const newItem: OrderItemEdit = {
      id: `temp-${Date.now()}`,
      order_id: order.id,
      recipe_name: '',
      quantity_type: '',
      amount: 0,
      created_at: new Date().toISOString(),
      isNew: true
    };
    setOrderItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableQuantityTypes = (recipeName: string) => {
    return availablePricing
      .filter(p => p.recipe_name === recipeName)
      .map(p => ({ value: p.quantity_type, label: p.quantity_type }));
  };

  const uniqueRecipes = Array.from(new Set(availablePricing.map(p => p.recipe_name)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order - {order.invoice_number ? `INV-${String(order.invoice_number).padStart(3, '0')}` : `INV-${order.id.substring(0, 3).toUpperCase()}`}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button
                type="button"
                onClick={addNewItem}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <Label>Recipe</Label>
                    <Select 
                      value={item.recipe_name} 
                      onValueChange={(value) => handleItemChange(index, 'recipe_name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueRecipes.map((recipe) => (
                          <SelectItem key={recipe} value={recipe}>
                            {recipe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity Type</Label>
                    <Select 
                      value={item.quantity_type} 
                      onValueChange={(value) => handleItemChange(index, 'quantity_type', value)}
                      disabled={!item.recipe_name}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableQuantityTypes(item.recipe_name).map((qty) => (
                          <SelectItem key={qty.value} value={qty.value}>
                            {qty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      disabled={orderItems.length === 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-right p-4 bg-gray-100 rounded-lg">
              <div className="text-xl font-bold">
                Total: ₹{orderItems.reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || orderItems.length === 0}>
              {isLoading ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;