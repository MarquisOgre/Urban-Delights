-- Create the RPC used by the public storefront checkout.
-- This function inserts the order and its line items atomically.

CREATE OR REPLACE FUNCTION public.place_storefront_order(
  p_address TEXT,
  p_customer_name TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT 'pending',
  p_phone_number TEXT,
  p_total_amount NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_invoice_number INTEGER;
BEGIN
  IF COALESCE(TRIM(p_customer_name), '') = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF COALESCE(TRIM(p_phone_number), '') = '' THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;

  IF COALESCE(TRIM(p_address), '') = '' THEN
    RAISE EXCEPTION 'Delivery address is required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_total_amount IS NULL OR p_total_amount < 0 THEN
    RAISE EXCEPTION 'Invalid total amount';
  END IF;

  -- Lock the orders table while allocating the next invoice number so two
  -- simultaneous storefront orders cannot receive the same number.
  LOCK TABLE public.orders IN SHARE ROW EXCLUSIVE MODE;

  SELECT COALESCE(MAX(invoice_number), 0) + 1
    INTO v_invoice_number
  FROM public.orders;

  INSERT INTO public.orders (
    invoice_number,
    customer_name,
    phone_number,
    address,
    total_amount,
    discount_percent,
    tax_rate,
    notes,
    status,
    payment_status,
    order_date,
    user_id
  )
  VALUES (
    v_invoice_number,
    TRIM(p_customer_name),
    TRIM(p_phone_number),
    TRIM(p_address),
    p_total_amount,
    0,
    0,
    NULLIF(TRIM(COALESCE(p_notes, '')), ''),
    'received',
    COALESCE(NULLIF(TRIM(p_payment_status), ''), 'pending'),
    CURRENT_DATE,
    auth.uid()
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (
    order_id,
    recipe_name,
    quantity_type,
    quantity,
    amount
  )
  SELECT
    v_order_id,
    item->>'recipe_name',
    item->>'quantity_type',
    COALESCE((item->>'quantity')::INTEGER, 1),
    COALESCE((item->>'amount')::NUMERIC, 0)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_order_id;
END;
$$;

-- The public storefront does not require a logged-in customer.
REVOKE ALL ON FUNCTION public.place_storefront_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_storefront_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, NUMERIC) TO anon, authenticated;
