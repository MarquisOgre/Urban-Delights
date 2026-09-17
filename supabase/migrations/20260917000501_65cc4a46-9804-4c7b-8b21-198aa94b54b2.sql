CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated staff can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders
  ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN customer_email TEXT,
  ADD COLUMN expected_delivery_date DATE,
  ADD COLUMN delivered_date DATE;

CREATE INDEX customers_phone_number_idx ON public.customers(phone_number);
CREATE INDEX customers_email_idx ON public.customers(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX orders_delivery_dates_idx ON public.orders(expected_delivery_date, delivered_date);

DROP POLICY IF EXISTS "anyone" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "anyone" ON public.order_items;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON SEQUENCE public.orders_invoice_number_seq FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.orders_invoice_number_seq TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON SEQUENCE public.orders_invoice_number_seq TO service_role;
CREATE POLICY "Authenticated staff can manage orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated staff can manage order items" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.place_storefront_order(
  p_address TEXT,
  p_customer_name TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT 'pending',
  p_phone_number TEXT DEFAULT NULL,
  p_total_amount NUMERIC DEFAULT 0,
  p_customer_email TEXT DEFAULT NULL,
  p_discount_percent NUMERIC DEFAULT 0,
  p_tax_rate NUMERIC DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_customer_id UUID;
  v_invoice_number INTEGER;
  v_phone TEXT := regexp_replace(COALESCE(p_phone_number, ''), '[^0-9+]', '', 'g');
  v_email TEXT := lower(NULLIF(TRIM(COALESCE(p_customer_email, '')), ''));
  v_discount NUMERIC := GREATEST(0, LEAST(COALESCE(p_discount_percent, 0), 100));
  v_tax NUMERIC := GREATEST(0, LEAST(COALESCE(p_tax_rate, 0), 100));
BEGIN
  IF length(TRIM(COALESCE(p_customer_name, ''))) NOT BETWEEN 1 AND 150 THEN RAISE EXCEPTION 'A valid customer name is required'; END IF;
  IF length(v_phone) NOT BETWEEN 7 AND 20 THEN RAISE EXCEPTION 'A valid phone number is required'; END IF;
  IF length(TRIM(COALESCE(p_address, ''))) NOT BETWEEN 5 AND 1000 THEN RAISE EXCEPTION 'A valid delivery address is required'; END IF;
  IF v_email IS NOT NULL AND (length(v_email) > 254 OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') THEN RAISE EXCEPTION 'A valid email address is required'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN RAISE EXCEPTION 'Between 1 and 50 order items are required'; END IF;
  IF p_total_amount IS NULL OR p_total_amount < 0 OR p_total_amount > 10000000 THEN RAISE EXCEPTION 'Invalid total amount'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) item WHERE length(TRIM(COALESCE(item->>'recipe_name', ''))) NOT BETWEEN 1 AND 200 OR length(TRIM(COALESCE(item->>'quantity_type', ''))) NOT BETWEEN 1 AND 100 OR COALESCE((item->>'quantity')::INTEGER, 0) NOT BETWEEN 1 AND 10000 OR COALESCE((item->>'amount')::NUMERIC, -1) < 0) THEN RAISE EXCEPTION 'One or more order items are invalid'; END IF;

  INSERT INTO public.customers (name, phone_number, email, address, notes)
  VALUES (TRIM(p_customer_name), v_phone, v_email, TRIM(p_address), NULLIF(TRIM(COALESCE(p_notes, '')), ''))
  ON CONFLICT (phone_number) DO UPDATE SET
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, public.customers.email),
    address = EXCLUDED.address,
    notes = COALESCE(EXCLUDED.notes, public.customers.notes),
    updated_at = now()
  RETURNING id INTO v_customer_id;

  LOCK TABLE public.orders IN SHARE ROW EXCLUSIVE MODE;
  SELECT COALESCE(MAX(invoice_number), 0) + 1 INTO v_invoice_number FROM public.orders;

  INSERT INTO public.orders (invoice_number, customer_id, customer_name, customer_email, phone_number, address, total_amount, discount_percent, tax_rate, notes, status, payment_status, order_date, user_id)
  VALUES (v_invoice_number, v_customer_id, TRIM(p_customer_name), v_email, v_phone, TRIM(p_address), p_total_amount, v_discount, v_tax, NULLIF(TRIM(COALESCE(p_notes, '')), ''), 'received', COALESCE(NULLIF(TRIM(p_payment_status), ''), 'pending'), CURRENT_DATE, auth.uid())
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, recipe_name, quantity_type, quantity, amount)
  SELECT v_order_id, TRIM(item->>'recipe_name'), TRIM(item->>'quantity_type'), COALESCE((item->>'quantity')::INTEGER, 1), COALESCE((item->>'amount')::NUMERIC, 0)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.place_storefront_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, NUMERIC, TEXT, NUMERIC, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_storefront_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, NUMERIC, TEXT, NUMERIC, NUMERIC) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_delivered_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' AND NEW.delivered_date IS NULL THEN NEW.delivered_date := CURRENT_DATE; END IF;
  IF NEW.status IS DISTINCT FROM 'delivered' AND OLD.status = 'delivered' THEN NEW.delivered_date := NULL; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER orders_set_delivered_date BEFORE UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_delivered_date();