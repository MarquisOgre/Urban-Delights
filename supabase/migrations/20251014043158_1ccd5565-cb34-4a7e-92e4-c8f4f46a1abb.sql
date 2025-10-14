-- Function to update ingredient names in recipes when master ingredient name changes
CREATE OR REPLACE FUNCTION update_recipe_ingredient_names()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only proceed if the name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all recipes that contain the old ingredient name
    UPDATE recipes
    SET ingredients = (
      SELECT jsonb_agg(
        CASE 
          WHEN ingredient->>'ingredient_name' = OLD.name 
          THEN jsonb_set(ingredient, '{ingredient_name}', to_jsonb(NEW.name))
          ELSE ingredient
        END
      )
      FROM jsonb_array_elements(ingredients) AS ingredient
    )
    WHERE ingredients @> jsonb_build_array(
      jsonb_build_object('ingredient_name', OLD.name)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on master_ingredients
DROP TRIGGER IF EXISTS sync_ingredient_names_in_recipes ON master_ingredients;
CREATE TRIGGER sync_ingredient_names_in_recipes
AFTER UPDATE ON master_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_recipe_ingredient_names();