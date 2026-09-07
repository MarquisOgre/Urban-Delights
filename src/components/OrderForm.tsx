import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { createOrder, OrderItem } from '@/services/orderService';
import { fetchRecipePricing, RecipePricing, amountFromQuantityAndRate, ratePerKg } from '@/services/pricingService';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  onBackToDashboard: () => void;
  onOrderCreated?: () => void;
}

interface FormItem {
  recipe_name: string;
  quantity_type: string;
  rate: number;
  amount: number;
  customProduct?: boolean;
  customQuantity?: boolean;
}

const CUSTOM_OPTION = '__custom__';

const TAX_OPTIONS = [
  { value: '0', label: '0% (No Tax)' },
  { value: '5', label: '5% GST' },
  { value: '12', label: '12% GST' },
  { value: '18', label: '18% GST' },
  { value: '28', label: '28% GST' },
];

const OrderForm: React.FC<OrderFormProps> = ({ onBackToDashboard, onOrderCreated }) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ recipe_name: '', quantity_type: '', rate: 0, amount: 0 }]);
  const [pricing, setPricing] = useState<RecipePricing[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRecipePricing().then(setPricing).catch(console.error);
  }, []);

  const recipeNames = [...new Set(pricing.filter(p => p.is_enabled).map(p => p.recipe_name))].sort();

  const getQuantityTypes = (recipeName: string) => {
    return pricing.filter(p => p.recipe_name === recipeName && p.is_enabled);
  };

  const getPricing = (recipeName: string, quantityType: string): RecipePricing | undefined => {
    return pricing.find(pr => pr.recipe_name === recipeName && pr.quantity_type === quantityType && pr.is_enabled);
  };

  const recalculateAmount = (item: FormItem): FormItem => ({
    ...item,
    amount: amountFromQuantityAndRate(item.quantity_type, item.rate),
  });

  const updateItem = (index: number, field: keyof FormItem, value: string | number | boolean) => {
    const updated = [...items];
    let next = { ...updated[index], [field]: value } as FormItem;

    if (field === 'recipe_name') {
      next = { ...next, quantity_type: '', rate: 0, amount: 0 };
    } else if (field === 'quantity_type' || field === 'rate') {
      next = recalculateAmount(next);
    }

    updated[index] = next;
    setItems(updated);
  };

  const selectProduct = (index: number, value: string) => {
    const updated = [...items];
    if (value === CUSTOM_OPTION) {
      updated[index] = {
        recipe_name: '', quantity_type: '', rate: 0, amount: 0,
        customProduct: true, customQuantity: true,
      };
    } else {
      updated[index] = {
        recipe_name: value, quantity_type: '', rate: 0, amount: 0,
        customProduct: false, customQuantity: false,
      };
    }
    setItems(updated);
  };

  const selectQuantity = (index: number, value: string) => {
    const updated = [...items];
    if (value === CUSTOM_OPTION) {
      updated[index] = { ...updated[index], quantity_type: '', amount: 0, customQuantity: true };
    } else {
      const item = updated[index];
      const p = getPricing(item.recipe_name, value);
      const rate = p ? ratePerKg(p.price, value) : 0;
      updated[index] = {
        ...item,
        quantity_type: value,
        rate,
        customQuantity: false,
        amount: amountFromQuantityAndRate(value, rate),
      };
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { recipe_name: '', quantity_type: '', rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const clearItem = (index: number) => {
    const updated = [...items];
    updated[index] = { recipe_name: '', quantity_type: '', rate: 0, amount: 0 };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const totalAmount = subtotal - discountAmount + taxAmount;

  const handleSubmit = async () => {
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      toast({ title: 'Please fill all customer details', variant: 'destructive' });
      return;
    }

    const validItems: OrderItem[] = items
      .filter(item => item.recipe_name.trim() && item.quantity_type.trim() && item.amount > 0)
      .map(item => ({ recipe_name: item.recipe_name.trim(), quantity_type: item.quantity_type.trim(), amount: item.amount }));

    if (validItems.length === 0) {
      toast({ title: 'Please add at least one product', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(customerName, phoneNumber, address, validItems, discountPercent, taxRate, notes);
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
        <CardHeader><CardTitle>Create New Order</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Customer Name</label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" /></div>
            <div><label className="text-sm font-medium">Phone Number</label><Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone" /></div>
          </div>
          <div><label className="text-sm font-medium">Address</label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" /></div>

          <div className="space-y-3">
            <h3 className="font-medium">Products</h3>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-[minmax(180px,1fr)_140px_120px_120px_auto] items-end gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0">
                  <label className="text-xs text-muted-foreground">Product</label>
                  {item.customProduct ? (
                    <div className="flex gap-1">
                      <Input value={item.recipe_name} onChange={(e) => updateItem(index, 'recipe_name', e.target.value)} placeholder="Type product name" />
                      <Button variant="outline" size="icon" type="button" onClick={() => selectProduct(index, '')}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Select value={item.recipe_name} onValueChange={(v) => selectProduct(index, v)}>
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>{recipeNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}<SelectItem value={CUSTOM_OPTION}>Custom…</SelectItem></SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  {item.customQuantity ? (
                    <Input value={item.quantity_type} onChange={(e) => updateItem(index, 'quantity_type', e.target.value)} placeholder="e.g. 750g" />
                  ) : (
                    <Select value={item.quantity_type} onValueChange={(v) => selectQuantity(index, v)} disabled={!item.recipe_name}>
                      <SelectTrigger><SelectValue placeholder="Select qty" /></SelectTrigger>
                      <SelectContent>{getQuantityTypes(item.recipe_name).map(qt => <SelectItem key={qt.quantity_type} value={qt.quantity_type}>{qt.quantity_type}</SelectItem>)}<SelectItem value={CUSTOM_OPTION}>Custom…</SelectItem></SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Rate (₹/Kg)</label>
                  <Input type="number" min="0" step="0.01" value={item.rate || ''} onChange={(e) => updateItem(index, 'rate', Number(e.target.value))} placeholder="Per Kg" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Amount (₹)</label>
                  <Input value={item.amount ? item.amount.toFixed(2) : ''} readOnly className="bg-white" />
                </div>

                <div className="flex gap-1">
                  <Button variant="outline" size="icon" type="button" onClick={addItem}><Plus className="h-4 w-4" /></Button>
                  {index === 0 ? <Button variant="outline" size="icon" type="button" onClick={() => clearItem(index)}><X className="h-4 w-4" /></Button> : <Button variant="outline" size="icon" type="button" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Discount (%)</label><Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} /></div>
            <div><label className="text-sm font-medium">Tax Rate (%)</label><Select value={String(taxRate)} onValueChange={(v) => setTaxRate(Number(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TAX_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note (optional)" /></div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discountPercent > 0 && <div className="flex justify-between text-sm"><span>Discount ({discountPercent}%):</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm"><span>Tax ({taxRate}%):</span><span>₹{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>₹{totalAmount.toFixed(2)}</span></div>
          </div>

          <div className="flex justify-end"><Button onClick={handleSubmit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700">{submitting ? 'Submitting...' : 'Submit Order'}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderForm;
