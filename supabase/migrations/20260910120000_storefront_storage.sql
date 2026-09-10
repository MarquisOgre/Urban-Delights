-- Storefront media bucket used by the Visual Store Manager.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'storefront',
  'storefront',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public storefront images must be readable by visitors.
drop policy if exists "Public can view storefront images" on storage.objects;
create policy "Public can view storefront images"
on storage.objects for select
to public
using (bucket_id = 'storefront');

-- The Store Manager is already protected by application authentication.
drop policy if exists "Authenticated users can upload storefront images" on storage.objects;
create policy "Authenticated users can upload storefront images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'storefront');

drop policy if exists "Authenticated users can update storefront images" on storage.objects;
create policy "Authenticated users can update storefront images"
on storage.objects for update
to authenticated
using (bucket_id = 'storefront')
with check (bucket_id = 'storefront');

drop policy if exists "Authenticated users can delete storefront images" on storage.objects;
create policy "Authenticated users can delete storefront images"
on storage.objects for delete
to authenticated
using (bucket_id = 'storefront');
