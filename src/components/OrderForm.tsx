import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchRecipesWithIngredients } from '@/services/database';
import { fetchRecipePricing, createOrder, NewOrderItem } from '@/services/orderService';
import type { RecipeWithIngredients } from '@/services/database';
import type { RecipePricing } from '@/services/orderService';

interface OrderFormProps {
  onOrderCreated: () => void;
}

interface OrderItemForm {
  recipe_name: string;
  quantity_type: string;
  amount: number;
}

const QUANTITY_OPTIONS = [
  'Sample Trial',
  '100grms',
  '250grms',
  '500grms',
  '1 Kg'
];

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
    { recipe_name: '', quantity_type: '', amount: 0 }
  ]);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [pricing, setPricing] = useState<RecipePricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipesData, pricingData] = await Promise.all([
        fetchRecipesWithIngredients(),
        fetchRecipePricing()
      ]);
      
      // Filter recipes that are not hidden and have at least one enabled pricing
      const enabledRecipeNames = new Set(
        pricingData.filter(p => p.is_enabled).map(p => p.recipe_name)
      );
      
      const filteredRecipes = recipesData.filter(recipe => 
        !recipe.is_hidden && enabledRecipeNames.has(recipe.name)
      );
      
      setRecipes(filteredRecipes);
      setPricing(pricingData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const getPrice = (recipeName: string, quantityType: string): number => {
    const priceEntry = pricing.find(
      p => p.recipe_name === recipeName && p.quantity_type === quantityType
    );
    console.log('Looking for price:', { recipeName, quantityType, priceEntry, allPricing: pricing });
    return priceEntry?.price || 0;
  };

  const updateItemAmount = (index: number, recipeName: string, quantityType: string) => {
    if (recipeName && quantityType) {
      const price = getPrice(recipeName, quantityType);
      console.log('Updating amount for item:', { index, recipeName, quantityType, price });
      setOrderItems(prev => prev.map((item, i) => 
        i === index ? { ...item, amount: price } : item
      ));
    }
  };

  const handleRecipeChange = (index: number, recipeName: string) => {
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, recipe_name: recipeName, amount: 0 } : item
    ));
    // Check if quantity is already selected and update amount
    const currentItem = orderItems[index];
    if (currentItem.quantity_type) {
      updateItemAmount(index, recipeName, currentItem.quantity_type);
    }
  };

  const handleQuantityChange = (index: number, quantityType: string) => {
    const item = orderItems[index];
    setOrderItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity_type: quantityType } : item
    ));
    // Immediately update the amount when quantity changes
    if (item.recipe_name) {
      updateItemAmount(index, item.recipe_name, quantityType);
    }
  };

  const addItem = () => {
    setOrderItems(prev => [...prev, { recipe_name: '', quantity_type: '', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearFirstItem = () => {
    setOrderItems(prev => prev.map((item, i) => 
      i === 0 ? { recipe_name: '', quantity_type: '', amount: 0 } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to auth page
      window.location.href = '/auth';
      return;
    }
    
    if (!customerName || !phoneNumber || !address) {
      toast({
        title: 'Error',
        description: 'Please fill in all customer details',
        variant: 'destructive',
      });
      return;
    }

    const validItems = orderItems.filter(item => 
      item.recipe_name && item.quantity_type && item.amount > 0
    );

    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one valid item',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0);
      
      await createOrder(
        {
          customer_name: customerName,
          phone_number: phoneNumber,
          address: address,
          total_amount: totalAmount,
          user_id: user?.id
        },
        validItems as NewOrderItem[]
      );

      // Show thank you popup and redirect after 5 seconds
      toast({
        title: 'Thank you for your Order!',
        description: 'Your order has been received successfully',
        duration: 5000,
      });

      // Reset form
      setCustomerName('');
      setPhoneNumber('');
      setAddress('');
      setOrderItems([{ recipe_name: '', quantity_type: '', amount: 0 }]);
      onOrderCreated();
      
      // Redirect to main page after 5 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="h-12" /> {/* Spacer where CardHeader was */}
     {/* <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader> */}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 border rounded-lg">
                <div>
                  <Label>Product</Label>
                  <Select value={item.recipe_name} onValueChange={(value) => handleRecipeChange(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.name}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Select value={item.quantity_type} onValueChange={(value) => handleQuantityChange(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUANTITY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={item.amount}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addItem}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus size={16} />
                  </Button>
                  
                  {index === 0 ? (
                    <Button
                      type="button"
                      onClick={clearFirstItem}
                      size="sm"
                      variant="outline"
                    >
                      <RotateCcw size={16} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-xl font-bold">₹{totalAmount.toFixed(2)}</span>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;