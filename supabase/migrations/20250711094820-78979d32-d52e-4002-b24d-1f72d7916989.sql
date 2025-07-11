-- Add brand column to master_ingredients table
ALTER TABLE public.master_ingredients 
ADD COLUMN brand TEXT;