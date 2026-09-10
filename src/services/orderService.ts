import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  recipe_name: string;
  quantity_type: string;
  amount: number;
  quantity?: number;
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
  discount_percent?: number | null;
  tax_rate?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const computeTotal = (items: OrderItem[], discountPercent: number = 0, taxRate: number = 0): number => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const afterDiscount = subtotal - (subtotal * (discountPercent || 0)) / 100;
  return afterDiscount + (afterDiscount * (taxRate || 0)) / 100;
};

export const formatInvoiceNumber = (num: number, orderDate?: string | null): string => {
  const dateMatch = orderDate?.match(/^(\d{4})-/);
  const year = dateMatch?.[1] || String(new Date().getFullYear());
  return `US-${year}-${String(Number(num) || 0).padStart(3, '0')}`;
};

const getNextAvailableInvoiceNumber = async (): Promise<number> => {
  const { data, error } = await supabase.from('orders').select('invoice_number').order('invoice_number', { ascending: true });
  if (error) throw error;
  const usedNumbers = new Set((data || []).map(order => Number(order.invoice_number)).filter(number => Number.isInteger(number) && number > 0));
  let invoiceNumber = 1;
  while (usedNumbers.has(invoiceNumber)) invoiceNumber += 1;
  return invoiceNumber;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const ordersWithItems: Order[] = [];
  for (const order of orders || []) {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    ordersWithItems.push({ ...order, items: (items || []).map((item: any) => ({ ...item, quantity: Number(item.quantity ?? 1) })) } as Order);
  }
  return ordersWithItems;
};

export const createOrder = async (customerName: string, phoneNumber: string, address: string, items: OrderItem[], discountPercent: number = 0, taxRate: number = 0, notes: string = ''): Promise<void> => {
  const totalAmount = computeTotal(items, discountPercent, taxRate);
  const invoiceNumber = await getNextAvailableInvoiceNumber();
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    invoice_number: invoiceNumber, customer_name: customerName, phone_number: phoneNumber, address,
    total_amount: totalAmount, discount_percent: discountPercent, tax_rate: taxRate, notes: notes || null,
    status: 'received', payment_status: 'unpaid', order_date: new Date().toISOString().split('T')[0],
  }).select().single();
  if (orderError) throw orderError;
  const orderItems = items.map(item => ({ order_id: order.id, recipe_name: item.recipe_name, quantity_type: item.quantity_type, quantity: item.quantity ?? 1, amount: item.amount }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems as never[]);
  if (itemsError) throw itemsError;
};

export const updateOrderStatus = async (id: string, status: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
};

export const updatePaymentStatus = async (id: string, paymentStatus: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
  if (itemsError) throw itemsError;
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
};

export const updateOrder = async (id: string, customerName: string, phoneNumber: string, address: string, items: OrderItem[], discountPercent: number = 0, taxRate: number = 0, notes: string = '', orderDate?: string): Promise<void> => {
  const totalAmount = computeTotal(items, discountPercent, taxRate);
  const { error: orderError } = await supabase.from('orders').update({
    customer_name: customerName, phone_number: phoneNumber, address, total_amount: totalAmount,
    discount_percent: discountPercent, tax_rate: taxRate, notes: notes || null,
    ...(orderDate ? { order_date: orderDate } : {}), updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (orderError) throw orderError;
  const { error: delError } = await supabase.from('order_items').delete().eq('order_id', id);
  if (delError) throw delError;
  const orderItems = items.map(item => ({ order_id: id, recipe_name: item.recipe_name, quantity_type: item.quantity_type, quantity: item.quantity ?? 1, amount: item.amount }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems as never[]);
  if (itemsError) throw itemsError;
};
