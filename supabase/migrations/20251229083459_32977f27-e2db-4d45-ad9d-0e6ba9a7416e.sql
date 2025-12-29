-- Create table for Podi stock entries
CREATE TABLE public.podi_stock_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL,
  podi_name TEXT NOT NULL,
  opening_stock NUMERIC NOT NULL DEFAULT 0,
  production NUMERIC NOT NULL DEFAULT 0,
  sales NUMERIC NOT NULL DEFAULT 0,
  closing_stock NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Raw Material stock entries
CREATE TABLE public.raw_material_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL,
  ingredient TEXT NOT NULL,
  opening NUMERIC NOT NULL DEFAULT 0,
  purchased NUMERIC NOT NULL DEFAULT 0,
  used NUMERIC NOT NULL DEFAULT 0,
  closing NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podi_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_material_entries ENABLE ROW LEVEL SECURITY;

-- Allow public access (similar to other tables in this project)
CREATE POLICY "Allow public access on podi_stock_entries"
ON public.podi_stock_entries
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access on raw_material_entries"
ON public.raw_material_entries
FOR ALL
USING (true)
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_podi_stock_entries_updated_at
BEFORE UPDATE ON public.podi_stock_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raw_material_entries_updated_at
BEFORE UPDATE ON public.raw_material_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();