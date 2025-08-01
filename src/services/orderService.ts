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
  invoice_number?: number;
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
    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as OrderItem[];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
};

export const fetchRecipePricing = async (): Promise<RecipePricing[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('recipe_pricing')
      .select('*')
      .order('recipe_name', { ascending: true });
    
    if (error) throw error;
    return (data || []) as RecipePricing[];
  } catch (error) {
    console.error('Error fetching recipe pricing:', error);
    return [];
  }
};

export const createOrder = async (order: NewOrder, items: NewOrderItem[]): Promise<string> => {
  try {
    const { data: orderData, error: orderError } = await (supabase as any)
      .from('orders')
      .insert([{
        customer_name: order.customer_name,
        phone_number: order.phone_number,
        address: order.address,
        total_amount: order.total_amount,
        status: order.status || 'received',
        payment_status: 'unpaid'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: orderData.id,
      recipe_name: item.recipe_name,
      quantity_type: item.quantity_type,
      amount: item.amount
    }));

    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderData.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateRecipePrice = async (id: string, price: number): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('recipe_pricing')
      .update({ price, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating recipe price:', error);
    throw error;
  }
};

export const updateRecipeEnabled = async (id: string, isEnabled: boolean): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('recipe_pricing')
      .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating recipe enabled status:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId: string, paymentStatus: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    // First delete order items
    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Then delete the order
    const { error: orderError } = await (supabase as any)
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (orderError) throw orderError;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};