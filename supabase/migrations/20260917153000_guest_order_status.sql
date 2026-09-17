-- Secure guest order tracking.
-- Guests can look up an order only with the public business Order ID
-- (UD-YYYY-XXXX) AND the phone number used at checkout.
-- No authentication is required.

CREATE OR REPLACE FUNCTION public.fetch_guest_order_status(
  p_order_id TEXT,
  p_phone_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_number INTEGER;
  v_year TEXT;
  v_phone TEXT;
  v_order JSONB;
BEGIN
  v_phone := regexp_replace(COALESCE(p_phone_number, ''), '[^0-9+]', '', 'g');

  IF length(v_phone) NOT BETWEEN 7 AND 20 THEN
    RAISE EXCEPTION 'A valid phone number is required';
  END IF;

  IF upper(trim(COALESCE(p_order_id, ''))) !~ '^UD-[0-9]{4}-[0-9]{4,}$' THEN
    RAISE EXCEPTION 'Invalid Order ID';
  END IF;

  v_year := substring(upper(trim(p_order_id)) FROM '^UD-([0-9]{4})-');
  v_invoice_number := substring(upper(trim(p_order_id)) FROM '-([0-9]+)$')::INTEGER;

  SELECT jsonb_build_object(
    'order_id', 'UD-' || to_char(o.created_at, 'YYYY') || '-' || lpad(o.invoice_number::TEXT, 4, '0'),
    'order_date', o.order_date,
    'created_at', o.created_at,
    'status', o.status,
    'payment_status', o.payment_status,
    'total_amount', o.total_amount,
    'items', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'recipe_name', oi.recipe_name,
          'quantity_type', oi.quantity_type,
          'quantity', oi.quantity,
          'amount', oi.amount
        ) ORDER BY oi.created_at ASC
      )
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ), '[]'::jsonb)
  )
  INTO v_order
  FROM public.orders o
  WHERE o.invoice_number = v_invoice_number
    AND to_char(o.created_at, 'YYYY') = v_year
    AND regexp_replace(COALESCE(o.phone_number, ''), '[^0-9+]', '', 'g') = v_phone
  LIMIT 1;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found. Please check your Order ID and phone number.';
  END IF;

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_guest_order_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_guest_order_status(TEXT, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.fetch_guest_order_status(TEXT, TEXT)
IS 'Public guest order tracking. Requires matching business Order ID and checkout phone number and returns only customer-safe order information.';
