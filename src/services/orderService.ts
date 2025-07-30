import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  recipe_name: string;
  quantity_type: string;
  amount: number;
  created_at: string;
}

export interface RecipePricing {
  id: string;
  recipe_name: string;
  quantity_type: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface NewOrder {
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  status?: string;
}

export interface NewOrderItem {
  recipe_name: string;
  quantity_type: string;
  amount: number;
}

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data || [];
};

export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Failed to fetch order items: ${error.message}`);
  }

  return data || [];
};

export const fetchRecipePricing = async (): Promise<RecipePricing[]> => {
  const { data, error } = await supabase
    .from('recipe_pricing')
    .select('*')
    .order('recipe_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch recipe pricing: ${error.message}`);
  }

  return data || [];
};

export const createOrder = async (order: NewOrder, items: NewOrderItem[]): Promise<string> => {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return orderData.id;
};

export const updateRecipePrice = async (id: string, price: number): Promise<void> => {
  const { error } = await supabase
    .from('recipe_pricing')
    .update({ price })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update recipe price: ${error.message}`);
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};