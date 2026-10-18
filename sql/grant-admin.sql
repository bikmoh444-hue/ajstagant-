-- Exécuter dans Supabase SQL Editor avec le compte propriétaire.
-- Remplacer l'UUID ci-dessous par celui de Authentication > Users.
-- Aucun utilisateur Auth ni mot de passe n'est créé par ce script.
begin;
do $$
declare
 target_id uuid := '00000000-0000-0000-0000-000000000000';
begin
 if not exists(select 1 from auth.users where id=target_id) then
  raise exception 'UUID introuvable dans auth.users : remplacez target_id par votre UUID Supabase.';
 end if;
 perform pg_advisory_xact_lock(842017);
 insert into public.admin_users(user_id,role) values(target_id,'super_admin')
 on conflict(user_id) do update set role=excluded.role;
end $$;
commit;
