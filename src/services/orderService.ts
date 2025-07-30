import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  order_date?: string;
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
  is_enabled: boolean;
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
  try {
    // Return empty array for now - UI will show "No orders yet"
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    // Return empty array for now
    return [];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
};

export const fetchRecipePricing = async (): Promise<RecipePricing[]> => {
  try {
    // Return empty array for now
    return [];
  } catch (error) {
    console.error('Error fetching recipe pricing:', error);
    return [];
  }
};

export const createOrder = async (order: NewOrder, items: NewOrderItem[]): Promise<string> => {
  try {
    // Mock response for now
    console.log('Creating order:', order, items);
    return 'mock-order-id';
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateRecipePrice = async (id: string, price: number): Promise<void> => {
  try {
    // Mock update for now
    console.log('Updating recipe price:', id, price);
  } catch (error) {
    console.error('Error updating recipe price:', error);
    throw error;
  }
};

export const updateRecipeEnabled = async (id: string, isEnabled: boolean): Promise<void> => {
  try {
    // Mock update for now
    console.log('Updating recipe enabled:', id, isEnabled);
  } catch (error) {
    console.error('Error updating recipe enabled status:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    // Mock update for now
    console.log('Updating order status:', orderId, status);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId: string, paymentStatus: string): Promise<void> => {
  try {
    // Mock update for now
    console.log('Updating payment status:', orderId, paymentStatus);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};