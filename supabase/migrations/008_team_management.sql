-- Gestion complète de l'équipe AJT TAGANT : catégories, joueurs, staff, photos.
-- À exécuter après les migrations existantes 001 à 007 (Supabase → SQL Editor).
-- Réexécutable ; conserve les joueurs, le staff, les catégories et les photos existants.
-- Aucune table existante n'est supprimée.
begin;

-- 1. Catégories de l'équipe (défaut : Gardiens, Défenseurs, Milieux, Attaquants, Staff).
create table if not exists public.team_categories (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null check (length(trim(name_fr)) between 1 and 500),
  name_ar text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Installations antérieures : ajoute les horodatages sans perdre la table existante.
alter table public.team_categories add column if not exists created_at timestamptz not null default now();
alter table public.team_categories add column if not exists updated_at timestamptz not null default now();

insert into public.team_categories(name_fr,slug,sort_order) values
 ('Gardiens','gardiens',10),
 ('Défenseurs / Fixes','defenseurs',20),
 ('Milieux / Ailiers','milieux',30),
 ('Attaquants / Pivots','attaquants',40),
 ('Staff technique','staff',50)
on conflict(slug) do nothing;

-- 2. Joueurs : catégorie dynamique (clé étrangère), poste précis, capitanat,
--    état civil facultatif. Les colonnes manquantes sont ajoutées sans altérer les autres.
alter table public.players add column if not exists category_id uuid
 references public.team_categories(id) on delete restrict;
alter table public.players add column if not exists playing_role text
 check (playing_role is null or length(playing_role) <= 500);
alter table public.players add column if not exists height_cm numeric(5,1)
 check (height_cm is null or (height_cm > 0 and height_cm <= 260));
alter table public.players add column if not exists preferred_foot text
 check (preferred_foot is null or preferred_foot in ('Droit','Gauche'));
alter table public.players add column if not exists is_vice_captain boolean not null default false;
update public.players p set category_id=c.id
from public.team_categories c
where p.category_id is null and c.slug=case p.position
 when 'Gardiens' then 'gardiens' when 'Défenseurs' then 'defenseurs'
 when 'Milieux' then 'milieux' when 'Attaquants' then 'attaquants' end;
create index if not exists players_category_idx on public.players(category_id);

-- 3. Staff technique : horodatages (photo, fonction, description, visibilité, ordre).
alter table public.staff_members add column if not exists created_at timestamptz not null default now();
alter table public.staff_members add column if not exists updated_at timestamptz not null default now();

-- 4. Trigger updated_at partout.
drop trigger if exists touch_team_categories on public.team_categories;
create trigger touch_team_categories before update on public.team_categories
 for each row execute function private.touch_updated_at();
drop trigger if exists touch_staff_members on public.staff_members;
create trigger touch_staff_members before update on public.staff_members
 for each row execute function private.touch_updated_at();

-- 5. Une statistique par joueur et par saison (index unique si aucune donnée dupliquée).
do $$ begin
 if not exists (select 1 from pg_indexes where schemaname='public' and indexname='player_statistics_player_season_idx') then
  if exists (select 1 from public.player_statistics group by player_id,season_id having count(*)>1) then
   raise notice 'Statistiques en double détectées : index unique non créé. Nettoyez puis relancez ce script.';
  else
   create unique index player_statistics_player_season_idx on public.player_statistics(player_id,season_id);
  end if;
 end if;
end $$;

-- 6. RLS : lecture publique des catégories visibles ; écriture réservée aux administrateurs.
alter table public.team_categories enable row level security;
revoke all on public.team_categories from anon,authenticated;
grant select on public.team_categories to anon,authenticated;
grant insert,update,delete on public.team_categories to authenticated;
grant all on public.team_categories to service_role;
drop policy if exists published_read on public.team_categories;
create policy published_read on public.team_categories for select to anon,authenticated
 using(is_visible);
drop policy if exists admin_manage on public.team_categories;
create policy admin_manage on public.team_categories for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));

-- 7. Protections de suppression.
-- Le slug staff identifie le groupe du staff existant ; son nom et sa visibilité
-- restent modifiables.
create or replace function public.protect_staff_category() returns trigger
language plpgsql set search_path=public as $$
begin
 if old.slug='staff' then
  if TG_OP='DELETE' then raise exception 'La catégorie du staff existant doit être conservée ; vous pouvez la masquer.'; end if;
  if new.slug<>old.slug then raise exception 'L’identifiant staff doit être conservé.'; end if;
 end if;
 if TG_OP='DELETE' then return old; end if;
 return new;
end $$;
drop trigger if exists protect_staff_category on public.team_categories;
create trigger protect_staff_category before update or delete on public.team_categories
 for each row execute function public.protect_staff_category();

-- Une catégorie encore utilisée par des joueurs ne peut pas être supprimée :
-- message explicite avant même la clé étrangère « on delete restrict ».
create or replace function public.protect_category_with_players() returns trigger
language plpgsql set search_path=public as $$
begin
 if exists (select 1 from public.players where category_id=old.id) then
  raise exception 'La catégorie « % » est encore utilisée par des joueurs. Réaffectez-les vers une autre catégorie avant de la supprimer.', old.name_fr;
 end if;
 return old;
end $$;
drop trigger if exists protect_category_with_players on public.team_categories;
create trigger protect_category_with_players before delete on public.team_categories
 for each row execute function public.protect_category_with_players();

-- 8. Buckets de photos (joueurs et staff). Upload admin uniquement,
--    noms de fichiers uniques, type et taille validés, lecture publique.
--    Les politiques existantes de players, staff_members et media_assets limitent
--    déjà les écritures à is_admin(). Aucun droit d’écriture anonyme ajouté.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('players','players',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']),
 ('staff','staff',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
-- Restrictions complémentaires, combinées aux politiques existantes.
drop policy if exists team_upload_guard on storage.objects;
create policy team_upload_guard on storage.objects as restrictive for insert to authenticated
with check(bucket_id not in ('players','staff') or (
 (select public.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text
 and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$'));
drop policy if exists team_update_guard on storage.objects;
create policy team_update_guard on storage.objects as restrictive for update to authenticated
using(bucket_id not in ('players','staff') or (select public.is_admin()))
with check(bucket_id not in ('players','staff') or ((select public.is_admin())
 and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$'));
drop policy if exists team_delete_guard on storage.objects;
create policy team_delete_guard on storage.objects as restrictive for delete to authenticated
using(bucket_id not in ('players','staff') or (select public.is_admin()));

-- 9. Réordonnancement depuis le Dashboard, catégories de l'équipe incluses.
create or replace function public.move_content(p_table text,p_id uuid,p_direction text) returns void language plpgsql security definer set search_path='' as $$
declare current_order integer; other_id uuid; other_order integer; begin
 if not public.is_admin() then raise exception 'Forbidden' using errcode='42501';end if;
 if p_table not in ('team_categories','navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','players','staff_members','bureau_members','gallery_categories','gallery_images','seasons','competitions','teams','matches','standings','trophies') or p_direction not in ('up','down') then raise exception 'Invalid collection';end if;
 perform pg_advisory_xact_lock(hashtext(p_table));
 execute format('with ranked as (select id,(row_number() over(order by sort_order,id)*10)::integer n from public.%I) update public.%I t set sort_order=r.n from ranked r where t.id=r.id',p_table,p_table);
 execute format('select sort_order from public.%I where id=$1',p_table) into current_order using p_id;
 execute format('select id,sort_order from public.%I where sort_order %s $1 order by sort_order %s limit 1',p_table,case when p_direction='up' then '<' else '>' end,case when p_direction='up' then 'desc' else 'asc' end) into other_id,other_order using current_order;
 if other_id is not null then execute format('update public.%I set sort_order=case when id=$1 then $3 else $4 end where id in ($1,$2)',p_table) using p_id,other_id,other_order,current_order;end if;
end $$;
revoke all on function public.move_content(text,uuid,text) from public,anon;
grant execute on function public.move_content(text,uuid,text) to authenticated;

commit;
