-- Add yield_output column to recipes table (in grams)
ALTER TABLE public.recipes 
ADD COLUMN yield_output numeric DEFAULT 1000;