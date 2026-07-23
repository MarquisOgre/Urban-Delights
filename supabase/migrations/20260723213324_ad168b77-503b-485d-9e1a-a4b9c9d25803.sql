
-- Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Master ingredients
CREATE TABLE public.master_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_per_kg numeric(10,2) NOT NULL,
  brand text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_ingredients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.master_ingredients TO authenticated;
GRANT ALL ON public.master_ingredients TO service_role;
ALTER TABLE public.master_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.master_ingredients FOR SELECT USING (true);
CREATE POLICY "anyone write" ON public.master_ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER mi_updated BEFORE UPDATE ON public.master_ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipes (with jsonb ingredients + description + yield_output as expected by app)
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  preparation text,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  overheads numeric(10,2) NOT NULL DEFAULT 90,
  shelf_life text,
  storage text,
  calories integer,
  protein numeric(5,2),
  fat numeric(5,2),
  carbs numeric(5,2),
  yield_output numeric NOT NULL DEFAULT 1000,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_hidden boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "anyone write" ON public.recipes FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER rec_updated BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipe pricing
CREATE TABLE public.recipe_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_name text NOT NULL,
  quantity_type text NOT NULL,
  price numeric NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipe_pricing TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_pricing TO authenticated;
GRANT ALL ON public.recipe_pricing TO service_role;
ALTER TABLE public.recipe_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.recipe_pricing FOR SELECT USING (true);
CREATE POLICY "anyone write" ON public.recipe_pricing FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER rp_updated BEFORE UPDATE ON public.recipe_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders + items
CREATE SEQUENCE public.orders_invoice_number_seq AS integer START WITH 1;
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  address text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'received',
  payment_status text DEFAULT 'unpaid',
  order_date date DEFAULT CURRENT_DATE,
  invoice_number integer NOT NULL DEFAULT nextval('public.orders_invoice_number_seq'),
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER SEQUENCE public.orders_invoice_number_seq OWNED BY public.orders.invoice_number;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.orders_invoice_number_seq TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON SEQUENCE public.orders_invoice_number_seq TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER ord_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  recipe_name text NOT NULL,
  quantity_type text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Profiles + user_roles + has_role (kept for future auth use)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Auth trigger to create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  IF NEW.email = 'admin@artisandelights.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indent sessions
CREATE TABLE public.indent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recipe_quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  available_qty jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.indent_sessions TO anon, authenticated;
GRANT ALL ON public.indent_sessions TO service_role;
ALTER TABLE public.indent_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone" ON public.indent_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER is_updated BEFORE UPDATE ON public.indent_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stock register: podi
CREATE TABLE public.podi_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL,
  podi_name text NOT NULL,
  opening_stock numeric NOT NULL DEFAULT 0,
  production numeric NOT NULL DEFAULT 0,
  sales numeric NOT NULL DEFAULT 0,
  closing_stock numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podi_stock_entries TO anon, authenticated;
GRANT ALL ON public.podi_stock_entries TO service_role;
ALTER TABLE public.podi_stock_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone" ON public.podi_stock_entries FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER pse_updated BEFORE UPDATE ON public.podi_stock_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stock register: raw material
CREATE TABLE public.raw_material_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL,
  ingredient text NOT NULL,
  opening numeric NOT NULL DEFAULT 0,
  purchased numeric NOT NULL DEFAULT 0,
  used numeric NOT NULL DEFAULT 0,
  closing numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_material_entries TO anon, authenticated;
GRANT ALL ON public.raw_material_entries TO service_role;
ALTER TABLE public.raw_material_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone" ON public.raw_material_entries FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER rme_updated BEFORE UPDATE ON public.raw_material_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
