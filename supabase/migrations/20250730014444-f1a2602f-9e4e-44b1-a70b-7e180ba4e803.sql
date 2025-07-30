-- First, let's get all existing recipes and add pricing for them
-- Clear existing sample data and add real pricing
DELETE FROM public.recipe_pricing WHERE recipe_name = 'Sample Recipe';

-- Add pricing for common recipes (you can modify these prices)
INSERT INTO public.recipe_pricing (recipe_name, quantity_type, price) VALUES
  -- Idly Podi pricing
  ('Idly Podi', 'Sample Trial', 15),
  ('Idly Podi', '100grms', 35),
  ('Idly Podi', '250grms', 85),
  ('Idly Podi', '500grms', 160),
  ('Idly Podi', '1 Kg', 300),
  
  -- Sambar Powder pricing
  ('Sambar Powder', 'Sample Trial', 20),
  ('Sambar Powder', '100grms', 45),
  ('Sambar Powder', '250grms', 110),
  ('Sambar Powder', '500grms', 210),
  ('Sambar Powder', '1 Kg', 400),
  
  -- Rasam Powder pricing
  ('Rasam Powder', 'Sample Trial', 18),
  ('Rasam Powder', '100grms', 40),
  ('Rasam Powder', '250grms', 95),
  ('Rasam Powder', '500grms', 180),
  ('Rasam Powder', '1 Kg', 350),
  
  -- Karvepaku Podi pricing
  ('Karvepaku Podi', 'Sample Trial', 25),
  ('Karvepaku Podi', '100grms', 55),
  ('Karvepaku Podi', '250grms', 130),
  ('Karvepaku Podi', '500grms', 250),
  ('Karvepaku Podi', '1 Kg', 480),
  
  -- Palli Podi pricing
  ('Palli Podi', 'Sample Trial', 22),
  ('Palli Podi', '100grms', 50),
  ('Palli Podi', '250grms', 120),
  ('Palli Podi', '500grms', 230),
  ('Palli Podi', '1 Kg', 440);

-- Add more recipes as needed - this is just a sample
-- You can add pricing for any other recipes you have