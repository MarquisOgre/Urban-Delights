-- Update the default status for orders to be 'received' instead of 'pending'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'received';