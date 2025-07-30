-- Update orders table to include better status options
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add constraint for new status values
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('received', 'order_sent', 'paid', 'pending', 'invoiced', 'completed'));

-- Update existing records to use new status if needed
UPDATE public.orders 
SET status = 'received' 
WHERE status = 'pending';

-- Add payment_status column to track payment separately
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' 
CHECK (payment_status IN ('unpaid', 'paid', 'partial'));

-- Add order_date column for better tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;