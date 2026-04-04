import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  recipe_name: string;
  quantity_type: string;
  amount: number;
}

export interface Order {
  id: string;
  invoice_number: number;
  customer_name: string;
  phone_number: string;
  address: string;
  status: string;
  payment_status: string | null;
  order_date: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const fetchOrders = async (): Promise<Order[]> => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const ordersWithItems: Order[] = [];
  for (const order of orders || []) {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    ordersWithItems.push({
      ...order,
      items: items || [],
    });
  }

  return ordersWithItems;
};

export const createOrder = async (
  customerName: string,
  phoneNumber: string,
  address: string,
  items: OrderItem[]
): Promise<void> => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      phone_number: phoneNumber,
      address: address,
      total_amount: totalAmount,
      status: 'received',
      payment_status: 'unpaid',
      order_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: order.id,
    recipe_name: item.recipe_name,
    quantity_type: item.quantity_type,
    amount: item.amount,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;
};

export const updateOrderStatus = async (id: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const updatePaymentStatus = async (id: string, paymentStatus: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id);
  if (itemsError) throw itemsError;

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const updateOrder = async (
  id: string,
  customerName: string,
  phoneNumber: string,
  address: string,
  items: OrderItem[]
): Promise<void> => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const { error: orderError } = await supabase
    .from('orders')
    .update({
      customer_name: customerName,
      phone_number: phoneNumber,
      address: address,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (orderError) throw orderError;

  // Delete existing items and re-insert
  const { error: delError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id);
  if (delError) throw delError;

  const orderItems = items.map((item) => ({
    order_id: id,
    recipe_name: item.recipe_name,
    quantity_type: item.quantity_type,
    amount: item.amount,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;
};
