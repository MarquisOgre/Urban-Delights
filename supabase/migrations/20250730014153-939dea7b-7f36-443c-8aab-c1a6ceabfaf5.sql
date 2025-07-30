-- Insert some sample data for testing
INSERT INTO public.orders (customer_name, phone_number, address, total_amount, status, payment_status) VALUES
  ('John Doe', '+91 9876543210', '123 Main Street, Mumbai', 500.00, 'received', 'unpaid'),
  ('Jane Smith', '+91 8765432109', '456 Park Avenue, Delhi', 750.00, 'order_sent', 'paid'),
  ('Bob Johnson', '+91 7654321098', '789 Oak Road, Bangalore', 300.00, 'received', 'unpaid');

-- Insert some sample order items
INSERT INTO public.order_items (order_id, recipe_name, quantity_type, amount) 
SELECT 
  o.id,
  'Idly Podi',
  '500grms',
  250.00
FROM public.orders o 
WHERE o.customer_name = 'John Doe'
LIMIT 1;

INSERT INTO public.order_items (order_id, recipe_name, quantity_type, amount) 
SELECT 
  o.id,
  'Sambar Powder',
  '1 Kg',
  300.00
FROM public.orders o 
WHERE o.customer_name = 'Jane Smith'
LIMIT 1;