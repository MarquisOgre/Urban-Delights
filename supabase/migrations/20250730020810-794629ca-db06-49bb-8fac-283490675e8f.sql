-- Add is_enabled column to recipe_pricing table
ALTER TABLE public.recipe_pricing 
ADD COLUMN is_enabled BOOLEAN NOT NULL DEFAULT true;

-- Create default pricing for all recipes and quantities if they don't exist
INSERT INTO public.recipe_pricing (recipe_name, quantity_type, price, is_enabled)
SELECT 
    r.name as recipe_name,
    qty.quantity_type,
    CASE 
        WHEN qty.quantity_type = 'Sample Trial' THEN 50
        WHEN qty.quantity_type = '100grms' THEN 150
        WHEN qty.quantity_type = '250grms' THEN 350
        WHEN qty.quantity_type = '500grms' THEN 650
        WHEN qty.quantity_type = '1 Kg' THEN 1200
        ELSE 100
    END as price,
    true as is_enabled
FROM 
    public.recipes r
CROSS JOIN (
    SELECT unnest(ARRAY['Sample Trial', '100grms', '250grms', '500grms', '1 Kg']) as quantity_type
) qty
WHERE NOT EXISTS (
    SELECT 1 FROM public.recipe_pricing rp 
    WHERE rp.recipe_name = r.name AND rp.quantity_type = qty.quantity_type
) AND r.is_hidden = false;