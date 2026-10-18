-- Complément RLS non destructif. Requiert les migrations 001 à 008.
-- À exécuter dans Supabase SQL Editor après vérification sur une base de test.
begin;
-- Une catégorie masquée ne doit pas exposer ses joueurs via l'API REST,
-- l'accueil, leurs statistiques ou une autre lecture publique.
drop policy if exists public_player_category_guard on public.players;
create policy public_player_category_guard on public.players as restrictive
 for select to anon,authenticated
 using ((select public.is_admin()) or category_id is null or exists(
  select 1 from public.team_categories category
  where category.id=category_id and category.is_visible
 ));
commit;
