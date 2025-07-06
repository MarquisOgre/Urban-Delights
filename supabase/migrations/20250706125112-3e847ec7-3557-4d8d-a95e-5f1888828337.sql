
-- Create master_ingredients table
CREATE TABLE public.master_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_per_kg DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  preparation TEXT,
  selling_price DECIMAL(10,2) NOT NULL,
  overheads DECIMAL(10,2) NOT NULL DEFAULT 90,
  shelf_life TEXT,
  storage TEXT,
  calories INTEGER,
  protein DECIMAL(5,2),
  fat DECIMAL(5,2),
  carbs DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert master ingredients data
INSERT INTO public.master_ingredients (name, price_per_kg) VALUES
  ('Roasted Chana Dal', 160),
  ('Red Chilies', 200),
  ('Sesame Seeds', 300),
  ('Salt', 20),
  ('Cumin / Jeera', 400),
  ('Garlic', 300),
  ('Roasted Peanuts', 120),
  ('Curry Leaves', 100),
  ('Urad Dal', 150),
  ('Tamarind', 200),
  ('Dry Coconut / Coconut', 150),
  ('Coriander Seeds', 130),
  ('Chana Dal', 100),
  ('Methi', 200),
  ('Hing', 400),
  ('Turmeric', 200),
  ('Pepper', 300),
  ('Jaggery', 150),
  ('Mustard / Mustard Seeds', 200),
  ('Dry Tamarind', 200),
  ('Clove', 500),
  ('Cinnamon', 500),
  ('Toor Dal', 150);

-- Insert recipes data
INSERT INTO public.recipes (name, preparation, selling_price, overheads, shelf_life, storage, calories, protein, fat, carbs) VALUES
  ('Putnalu Podi', 'Dry roast all ingredients individually. Cool and grind together to coarse consistency. Store in airtight container.', 600, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 400, 18, 22, 38),
  ('Palli Podi', 'Roast peanuts and red chilies separately. Cool, blend with garlic, salt, and jeera into powder. Store in airtight container.', 524, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 520, 20, 40, 25),
  ('Karvepaku Podi', 'Wash and sun-dry curry leaves. Dry roast each ingredient separately until crisp. Cool completely and grind together into a fine powder. Store in a dry, airtight container.', 475, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 350, 15, 15, 40),
  ('Kobari Powder', 'Dry roast grated coconut and red chilies separately. Roast garlic slightly. Add tamarind and salt. Cool and grind all ingredients into a coarse powder. Store in airtight jar.', 499, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 520, 7, 45, 25),
  ('Sambar Powder', 'Dry roast coriander seeds, dals, red chilies, jeera and methi. Cool slightly. Blend with turmeric and hing into a fine powder. Store in airtight container.', 350, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 430, 12, 18, 55),
  ('Rasam Powder', 'Dry roast all spices individually until aromatic. Cool and grind together into fine powder. Store in a dry, cool place.', 399, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 360, 10, 15, 45),
  ('Chutney Podi', 'Dry roast urad dal, red chilies, mustard seeds. Add tamarind, jaggery, salt and hing. Cool and grind into a medium coarse chutney powder. Store airtight.', 399, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 420, 10, 20, 50),
  ('Idly Podi', 'Roast urad dal, chana dal, sesame seeds, and red chilies. Add salt and hing. Cool and grind to a fine powder. Use as side for idly/dosa.', 425, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 460, 14, 25, 45),
  ('Polihora Podi', 'Dry roast each ingredient separately until aromatic. Cool completely. Grind into a fine, slightly coarse powder. Best used for mixing with cooked rice.', 399, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 410, 10, 22, 40),
  ('Vangibhat Powder', 'Roast dals, coriander seeds, chilies, and spices till aromatic. Add tamarind. Cool and grind to a fine aromatic powder.', 425, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 430, 11, 18, 52),
  ('Kura Podi', 'Roast all ingredients till golden brown. Cool and grind to a fine powder. Ideal for adding to curries for added flavor.', 450, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 420, 12, 20, 50),
  ('Bisibellebath Powder', 'Dry roast all ingredients separately until aromatic. Cool and grind to a fine powder. Sieve to remove lumps. Store in dry container.', 475, 90, '6 months in sealed packaging, away from moisture and sunlight', 'Store in a cool, dry place in an airtight container after opening', 450, 13, 18, 55);

-- Insert recipe ingredients for each recipe
-- Putnalu Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Roasted Chana Dal', 500, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Sesame Seeds', 100, 'g'),
  ('Salt', 50, 'g'),
  ('Cumin / Jeera', 50, 'g'),
  ('Garlic', 100, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Putnalu Podi';

-- Palli Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Roasted Peanuts', 600, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Garlic', 100, 'g'),
  ('Salt', 50, 'g'),
  ('Cumin / Jeera', 50, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Palli Podi';

-- Karvepaku Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Curry Leaves', 300, 'g'),
  ('Urad Dal', 200, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Tamarind', 100, 'g'),
  ('Salt', 100, 'g'),
  ('Cumin / Jeera', 100, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Karvepaku Podi';

-- Kobari Powder ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Dry Coconut / Coconut', 600, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Garlic', 100, 'g'),
  ('Tamarind', 50, 'g'),
  ('Salt', 50, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Kobari Powder';

-- Sambar Powder ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Coriander Seeds', 300, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Chana Dal', 100, 'g'),
  ('Urad Dal', 100, 'g'),
  ('Cumin / Jeera', 75, 'g'),
  ('Methi', 75, 'g'),
  ('Hing', 75, 'g'),
  ('Turmeric', 75, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Sambar Powder';

-- Rasam Powder ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Coriander Seeds', 200, 'g'),
  ('Pepper', 150, 'g'),
  ('Cumin / Jeera', 150, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Hing', 150, 'g'),
  ('Garlic', 150, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Rasam Powder';

-- Chutney Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Urad Dal', 400, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Tamarind', 100, 'g'),
  ('Jaggery', 100, 'g'),
  ('Salt', 75, 'g'),
  ('Hing', 75, 'g'),
  ('Mustard / Mustard Seeds', 50, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Chutney Podi';

-- Idly Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Urad Dal', 400, 'g'),
  ('Chana Dal', 200, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Salt', 75, 'g'),
  ('Hing', 75, 'g'),
  ('Sesame Seeds', 50, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Idly Podi';

-- Polihora Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Dry Tamarind', 300, 'g'),
  ('Chana Dal', 150, 'g'),
  ('Urad Dal', 150, 'g'),
  ('Mustard / Mustard Seeds', 100, 'g'),
  ('Hing', 50, 'g'),
  ('Curry Leaves', 50, 'g'),
  ('Turmeric', 100, 'g'),
  ('Red Chilies', 100, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Polihora Podi';

-- Vangibhat Powder ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Chana Dal', 150, 'g'),
  ('Urad Dal', 150, 'g'),
  ('Coriander Seeds', 200, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Clove', 50, 'g'),
  ('Cinnamon', 50, 'g'),
  ('Tamarind', 200, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Vangibhat Powder';

-- Kura Podi ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Chana Dal', 150, 'g'),
  ('Urad Dal', 150, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Dry Coconut / Coconut', 150, 'g'),
  ('Coriander Seeds', 150, 'g'),
  ('Salt', 100, 'g'),
  ('Hing', 100, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Kura Podi';

-- Bisibellebath Powder ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit) 
SELECT r.id, ingredient_name, quantity, unit FROM public.recipes r, (VALUES
  ('Toor Dal', 200, 'g'),
  ('Chana Dal', 200, 'g'),
  ('Red Chilies', 200, 'g'),
  ('Clove', 100, 'g'),
  ('Cinnamon', 100, 'g'),
  ('Hing', 100, 'g'),
  ('Tamarind', 100, 'g')
) AS ingredients(ingredient_name, quantity, unit)
WHERE r.name = 'Bisibellebath Powder';

-- Enable Row Level Security (make tables public for now - you can add authentication later)
ALTER TABLE public.master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (you can restrict this later with authentication)
CREATE POLICY "Allow public read access on master_ingredients" ON public.master_ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read access on recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on recipe_ingredients" ON public.recipe_ingredients FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on master_ingredients" ON public.master_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on recipe_ingredients" ON public.recipe_ingredients FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on master_ingredients" ON public.master_ingredients FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on recipes" ON public.recipes FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on recipe_ingredients" ON public.recipe_ingredients FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on master_ingredients" ON public.master_ingredients FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on recipes" ON public.recipes FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on recipe_ingredients" ON public.recipe_ingredients FOR DELETE USING (true);
