-- Unify the order workflow across Admin, guest tracking, and the database.
-- Active workflow (exactly five steps):
--   received -> confirmed -> processing -> shipped -> delivered
-- 'cancelled' is retained only as a terminal exception for historical orders.

-- Normalize legacy workflow values before applying the database rule.
UPDATE public.orders
SET status = CASE
  WHEN lower(trim(COALESCE(status, ''))) = 'pending' THEN 'received'
  WHEN lower(trim(COALESCE(status, ''))) = 'order_sent' THEN 'shipped'
  WHEN lower(trim(COALESCE(status, ''))) IN ('received', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    THEN lower(trim(status))
  ELSE 'received'
END
WHERE lower(trim(COALESCE(status, ''))) NOT IN (
  'received', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

-- Remove an older workflow constraint if one exists under this name.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_five_step_check;

-- Keep the five active workflow statuses aligned in the database.
-- 'cancelled' remains available only for historical/terminal cancelled orders.
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_five_step_check
  CHECK (status IN ('received', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Ensure all new storefront orders start at step 1.
-- The checkout function already inserts 'received'; this migration also
-- normalizes its phone validation to the same 10-digit rule used by tracking.
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
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_customer_id UUID;
  v_invoice_number INTEGER;
  v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
  v_phone TEXT := regexp_replace(COALESCE(p_phone_number, ''), '[^0-9]', '', 'g');
  v_email TEXT := lower(NULLIF(trim(COALESCE(p_customer_email, '')), ''));
  v_discount NUMERIC := greatest(0, least(COALESCE(p_discount_percent, 0), 100));
  v_tax NUMERIC := greatest(0, least(COALESCE(p_tax_rate, 0), 100));
BEGIN
  IF length(trim(COALESCE(p_customer_name, ''))) NOT BETWEEN 1 AND 150 THEN
    RAISE EXCEPTION 'A valid customer name is required';
  END IF;
  IF v_phone !~ '^[0-9]{10}$' THEN
    RAISE EXCEPTION 'A valid 10-digit phone number is required';
  END IF;
  IF length(trim(COALESCE(p_address, ''))) NOT BETWEEN 5 AND 1000 THEN
    RAISE EXCEPTION 'A valid delivery address is required';
  END IF;
  IF v_email IS NOT NULL AND (length(v_email) > 254 OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') THEN
    RAISE EXCEPTION 'A valid email address is required';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Between 1 and 50 order items are required';
  END IF;
  IF p_total_amount IS NULL OR p_total_amount < 0 OR p_total_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid total amount';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_items) item
    WHERE length(trim(COALESCE(item->>'recipe_name', ''))) NOT BETWEEN 1 AND 200
       OR length(trim(COALESCE(item->>'quantity_type', ''))) NOT BETWEEN 1 AND 100
       OR COALESCE((item->>'quantity')::INTEGER, 0) NOT BETWEEN 1 AND 10000
       OR COALESCE((item->>'amount')::NUMERIC, -1) < 0
  ) THEN
    RAISE EXCEPTION 'One or more order items are invalid';
  END IF;

  INSERT INTO public.customers (name, phone_number, email, address, notes)
  VALUES (
    trim(p_customer_name), v_phone, v_email, trim(p_address),
    NULLIF(trim(COALESCE(p_notes, '')), '')
  )
  ON CONFLICT (phone_number) DO UPDATE SET
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, public.customers.email),
    address = EXCLUDED.address,
    notes = COALESCE(EXCLUDED.notes, public.customers.notes),
    updated_at = now()
  RETURNING id INTO v_customer_id;

  LOCK TABLE public.orders IN SHARE ROW EXCLUSIVE MODE;
  SELECT COALESCE(MAX(invoice_number), 0) + 1 INTO v_invoice_number FROM public.orders;

  INSERT INTO public.orders (
    invoice_number, customer_id, customer_name, customer_email, phone_number,
    address, total_amount, discount_percent, tax_rate, notes, status,
    payment_status, order_date, user_id
  )
  VALUES (
    v_invoice_number, v_customer_id, trim(p_customer_name), v_email, v_phone,
    trim(p_address), p_total_amount, v_discount, v_tax,
    NULLIF(trim(COALESCE(p_notes, '')), ''), 'received',
    COALESCE(NULLIF(trim(p_payment_status), ''), 'pending'), CURRENT_DATE, auth.uid()
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, recipe_name, quantity_type, quantity, amount)
  SELECT
    v_order_id,
    trim(item->>'recipe_name'),
    trim(item->>'quantity_type'),
    COALESCE((item->>'quantity')::INTEGER, 1),
    COALESCE((item->>'amount')::NUMERIC, 0)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN 'UD-' || v_year || '-' || lpad(v_invoice_number::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_storefront_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, NUMERIC, TEXT, NUMERIC, NUMERIC) TO anon, authenticated;

COMMENT ON CONSTRAINT orders_status_five_step_check ON public.orders
IS 'Five-step order workflow: received, confirmed, processing, shipped, delivered. Cancelled is retained only as a terminal historical exception.';
