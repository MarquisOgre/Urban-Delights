
-- Add the is_hidden column to the recipes table
ALTER TABLE public.recipes 
ADD COLUMN is_hidden BOOLEAN DEFAULT false;
