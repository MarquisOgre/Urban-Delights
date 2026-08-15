DELETE FROM public.master_ingredients a
WHERE EXISTS (
  SELECT 1 FROM public.master_ingredients b
  WHERE b.name LIKE a.name || ' / %'
);