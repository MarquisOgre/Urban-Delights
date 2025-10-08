-- Step 1: Add ingredients column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate data from recipe_ingredients into recipes.ingredients
UPDATE recipes r
SET ingredients = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'ingredient_name', ri.ingredient_name,
      'quantity', ri.quantity,
      'unit', ri.unit
    )
  )
  FROM recipe_ingredients ri
  WHERE ri.recipe_id = r.id
)
WHERE EXISTS (
  SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id
);

-- Step 3: Drop the recipe_ingredients table
DROP TABLE IF EXISTS recipe_ingredients CASCADE;