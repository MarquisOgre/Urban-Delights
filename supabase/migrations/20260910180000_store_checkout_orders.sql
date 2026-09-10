-- Customer checkout orders for the public Urban Delights storefront.
-- Uses the existing backend order tables shape so admin order management remains compatible.

create or replace function public.place_storefront_order(
  p_customer_name text,
  p_phone_number text,
  p_address text,
  p_total_amount numeric,
  p_payment_status text default 'pending',
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_item jsonb;
  v_quantity numeric;
  v_amount numeric;
begin
  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'Customer name is required';
  end if;
  if coalesce(trim(p_phone_number), '') = '' then
    raise exception 'Phone number is required';
  end if;
  if coalesce(trim(p_address), '') = '' then
    raise exception 'Address is required';
  end if;
  if p_total_amount is null or p_total_amount < 0 then
    raise exception 'Invalid order amount';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required';
  end if;

  insert into public.orders (
    id,
    customer_name,
    phone_number,
    address,
    total_amount,
    payment_status,
    status,
    notes,
    order_date,
    updated_at
  ) values (
    v_order_id,
    trim(p_customer_name),
    trim(p_phone_number),
    trim(p_address),
    p_total_amount,
    coalesce(nullif(trim(p_payment_status), ''), 'pending'),
    'pending',
    p_notes,
    current_date,
    now()
  );

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := greatest(coalesce((v_item->>'quantity')::numeric, 0), 0);
    v_amount := greatest(coalesce((v_item->>'amount')::numeric, 0), 0);

    if coalesce(trim(v_item->>'recipe_name'), '') = '' or coalesce(trim(v_item->>'quantity_type'), '') = '' then
      raise exception 'Invalid order item';
    end if;
    if v_quantity <= 0 or v_amount < 0 then
      raise exception 'Invalid order item values';
    end if;

    insert into public.order_items (
      id,
      order_id,
      recipe_name,
      quantity_type,
      amount,
      created_at
    ) values (
      gen_random_uuid(),
      v_order_id,
      trim(v_item->>'recipe_name'),
      trim(v_item->>'quantity_type'),
      v_amount,
      now()
    );
  end loop;

  return v_order_id;
end;
$$;

-- Public customers can submit an order through this function without receiving
-- direct insert permission on the order tables.
revoke all on function public.place_storefront_order(text, text, text, numeric, text, text, jsonb) from public;
grant execute on function public.place_storefront_order(text, text, text, numeric, text, text, jsonb) to anon, authenticated;
