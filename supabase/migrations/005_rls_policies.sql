begin;
do $$ declare t text; begin
 foreach t in array array['site_settings','navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','players','player_statistics','staff_members','bureau_members','gallery_categories','gallery_images','seasons','competitions','teams','matches','standings','trophies','contact_messages','media_assets','activity_logs'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to anon, authenticated',t);
  if t not in ('activity_logs') then
   execute format('grant insert,update,delete on public.%I to authenticated',t);
   execute format('create policy admin_manage on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
  else
   execute format('create policy admin_read on public.%I for select to authenticated using ((select public.is_admin()))',t);
  end if;
 end loop;
 foreach t in array array['navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','staff_members','bureau_members','gallery_categories','seasons','teams'] loop
  execute format('create policy published_read on public.%I for select to anon,authenticated using (is_visible)',t);
 end loop;
end $$;
create policy public_settings on public.site_settings for select to anon,authenticated using(true);
create policy published_players on public.players for select to anon,authenticated using(is_visible and is_active);
create policy published_statistics on public.player_statistics for select to anon,authenticated using(
 exists(select 1 from public.players p where p.id=player_id and p.is_active and p.is_visible) and exists(select 1 from public.seasons s where s.id=season_id and s.is_visible));
create policy published_competition on public.competitions for select to anon,authenticated using(is_visible and exists(select 1 from public.seasons s where s.id=season_id and s.is_visible));
create policy published_gallery on public.gallery_images for select to anon,authenticated using(is_visible and exists(select 1 from public.gallery_categories c where c.id=category_id and c.is_visible));
create policy published_matches on public.matches for select to anon,authenticated using(is_visible and
 exists(select 1 from public.competitions c where c.id=competition_id) and
 exists(select 1 from public.teams t where t.id=home_team_id and t.is_visible) and exists(select 1 from public.teams t where t.id=away_team_id and t.is_visible));
create policy published_standings on public.standings for select to anon,authenticated using(is_visible and exists(select 1 from public.competitions c where c.id=competition_id) and exists(select 1 from public.teams t where t.id=team_id and t.is_visible));
create policy published_trophies on public.trophies for select to anon,authenticated using(is_visible and (competition_id is null or exists(select 1 from public.competitions c where c.id=competition_id)));
revoke all on public.admin_users from anon,authenticated;
grant select on public.admin_users to authenticated;
create policy super_admin_list on public.admin_users for select to authenticated using((select public.is_super_admin()));
-- Aucun INSERT public de contact, même pour un utilisateur connecté sans rôle.
revoke insert on public.contact_messages from anon,authenticated;
revoke update on public.contact_messages from authenticated;
grant update(status) on public.contact_messages to authenticated;
grant insert on public.contact_messages to service_role;
grant all on all tables in schema public to service_role;
commit;
