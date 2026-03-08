CREATE TABLE public.indent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  recipe_quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  available_qty jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.indent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on indent_sessions"
  ON public.indent_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);