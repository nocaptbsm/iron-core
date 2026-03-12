insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'avatars' );

create policy "Authenticated Users can upload avatars" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'avatars' );

create policy "Authenticated Users can update avatars" 
on storage.objects for update 
to authenticated 
with check ( bucket_id = 'avatars' );
