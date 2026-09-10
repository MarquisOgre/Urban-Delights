-- Storefront CMS settings.
-- This table is used by the Visual Store Manager and the public storefront.
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  setting_type text not null,
  setting_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- There is one global storefront configuration (user_id IS NULL).
create unique index if not exists settings_global_setting_type_idx
  on public.settings (setting_type)
  where user_id is null;

-- Keep the table protected while allowing the public storefront to read the
-- global storefront configuration. Authenticated Store Manager users can edit it.
alter table public.settings enable row level security;

drop policy if exists "Public can view global storefront settings" on public.settings;
create policy "Public can view global storefront settings"
on public.settings for select
to anon, authenticated
using (user_id is null and setting_type = 'storefront');

drop policy if exists "Authenticated users can insert storefront settings" on public.settings;
create policy "Authenticated users can insert storefront settings"
on public.settings for insert
to authenticated
with check (user_id is null and setting_type = 'storefront');

drop policy if exists "Authenticated users can update storefront settings" on public.settings;
create policy "Authenticated users can update storefront settings"
on public.settings for update
to authenticated
using (user_id is null and setting_type = 'storefront')
with check (user_id is null and setting_type = 'storefront');

drop policy if exists "Authenticated users can delete storefront settings" on public.settings;
create policy "Authenticated users can delete storefront settings"
on public.settings for delete
to authenticated
using (user_id is null and setting_type = 'storefront');

-- Automatically maintain updated_at when the CMS record changes.
create or replace function public.set_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
before update on public.settings
for each row execute function public.set_settings_updated_at();

-- Ask PostgREST to reload its schema cache after this migration.
notify pgrst, 'reload schema';
