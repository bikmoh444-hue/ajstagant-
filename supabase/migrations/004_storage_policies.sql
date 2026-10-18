begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
select name,name,true,5242880,array['image/jpeg','image/png','image/webp','image/avif','image/x-icon','image/vnd.microsoft.icon']
from unnest(array['club-assets','players','gallery','staff','bureau','match-assets']) as name
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- Ces buckets sont exclusivement destinés aux médias publics, jamais aux données personnelles.
create policy ajt_media_read on storage.objects for select to anon, authenticated
 using(bucket_id in ('club-assets','players','gallery','staff','bureau','match-assets'));
create policy ajt_media_insert on storage.objects for insert to authenticated
 with check((select public.is_admin()) and bucket_id in ('club-assets','players','gallery','staff','bureau','match-assets') and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif|ico)$' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy ajt_media_update on storage.objects for update to authenticated
 using((select public.is_admin()) and bucket_id in ('club-assets','players','gallery','staff','bureau','match-assets'))
 with check((select public.is_admin()) and bucket_id in ('club-assets','players','gallery','staff','bureau','match-assets'));
create policy ajt_media_delete on storage.objects for delete to authenticated
 using((select public.is_admin()) and bucket_id in ('club-assets','players','gallery','staff','bureau','match-assets'));
commit;
