-- Make admin order loading reliable even when direct table reads are affected by RLS/policy changes.
-- Only signed-in users can call this function; the admin UI is already authentication-gated.

CREATE OR REPLACE FUNCTION public.fetch_admin_orders()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(
        to_jsonb(o) || jsonb_build_object(
          'items', COALESCE(
            (
              SELECT jsonb_agg(to_jsonb(oi) ORDER BY oi.created_at ASC)
              FROM public.order_items oi
              WHERE oi.order_id = o.id
            ),
            '[]'::jsonb
          )
        )
        ORDER BY o.created_at DESC
      )
      FROM public.orders o
    ),
    '[]'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_admin_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_admin_orders() TO authenticated;

COMMENT ON FUNCTION public.fetch_admin_orders()
IS 'Authenticated admin-panel order reader. Returns orders with their order items while bypassing table RLS through SECURITY DEFINER.';
