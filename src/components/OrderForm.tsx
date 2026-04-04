import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { createOrder, OrderItem } from '@/services/orderService';
import { fetchRecipePricing, RecipePricing } from '@/services/pricingService';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  onBackToDashboard: () => void;
  onOrderCreated?: () => void;
}

interface FormItem {
  recipe_name: string;
  quantity_type: string;
  amount: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ onBackToDashboard, onOrderCreated }) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ recipe_name: '', quantity_type: '', amount: 0 }]);
  const [pricing, setPricing] = useState<RecipePricing[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    fetchRecipePricing().then(setPricing).catch(console.error);
  }, []);

  const recipeNames = [...new Set(pricing.filter(p => p.is_enabled).map(p => p.recipe_name))].sort();

  const getQuantityTypes = (recipeName: string) => {
    return pricing.filter(p => p.recipe_name === recipeName && p.is_enabled);
  };

  const getPrice = (recipeName: string, quantityType: string): number => {
    const p = pricing.find(pr => pr.recipe_name === recipeName && pr.quantity_type === quantityType);
    return p ? p.price : 0;
  };

  const updateItem = (index: number, field: keyof FormItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'recipe_name') {
      updated[index].quantity_type = '';
      updated[index].amount = 0;
    }
    if (field === 'quantity_type') {
      updated[index].amount = getPrice(updated[index].recipe_name, value as string);
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { recipe_name: '', quantity_type: '', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const clearItem = (index: number) => {
    const updated = [...items];
    updated[index] = { recipe_name: '', quantity_type: '', amount: 0 };
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      toast({ title: 'Please fill all customer details', variant: 'destructive' });
      return;
    }

    const validItems = items.filter(item => item.recipe_name && item.quantity_type && item.amount > 0);
    if (validItems.length === 0) {
      toast({ title: 'Please add at least one product', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(customerName, phoneNumber, address, validItems);
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        onOrderCreated?.();
        onBackToDashboard();
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({ title: 'Failed to create order', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <CardContent className="space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">Thank you for your Order!</h2>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Customer Name</label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-medium">Products</h3>
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-muted-foreground">Product</label>
                  <Select value={item.recipe_name} onValueChange={(v) => updateItem(index, 'recipe_name', v)}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {recipeNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[140px]">
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <Select value={item.quantity_type} onValueChange={(v) => updateItem(index, 'quantity_type', v)} disabled={!item.recipe_name}>
                    <SelectTrigger><SelectValue placeholder="Select qty" /></SelectTrigger>
                    <SelectContent>
                      {getQuantityTypes(item.recipe_name).map(qt => (
                        <SelectItem key={qt.quantity_type} value={qt.quantity_type}>{qt.quantity_type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[100px]">
                  <label className="text-xs text-muted-foreground">Amount (₹)</label>
                  <Input type="number" value={item.amount || ''} onChange={(e) => updateItem(index, 'amount', Number(e.target.value))} />
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  {index === 0 ? (
                    <Button variant="outline" size="icon" onClick={() => clearItem(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-bold">Total: ₹{totalAmount.toFixed(2)}</div>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? 'Submitting...' : 'Submit Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderForm;
