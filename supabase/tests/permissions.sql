-- Exécuter exclusivement sur une base jetable vide, après migrations + seed.
-- Toutes les données de test sont annulées. Ne pas exécuter sur une base en production.
begin;
do $$ begin if exists(select 1 from public.admin_users) then raise exception 'Test réservé à une base sans administrateurs existants';end if;end $$;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','super-admin-test@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','editor-test@example.invalid'),
 ('10000000-0000-4000-8000-000000000003','visitor-test@example.invalid');
insert into public.admin_users(user_id,role) values('10000000-0000-4000-8000-000000000001','super_admin'),('10000000-0000-4000-8000-000000000002','editor');
insert into public.page_content(id,page_key,section_key,title_fr,is_visible) values
 ('20000000-0000-4000-8000-000000000001','test','public','Publié',true),
 ('20000000-0000-4000-8000-000000000002','test','private','Brouillon',false);
insert into public.contact_messages(full_name,email,subject,message) values('Visiteur test','test@example.invalid','Sujet test','Message de test privé.');

set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.page_content where page_key='test')<>1 then raise exception 'Visiteur : visibilité incorrecte';end if;
 if exists(select 1 from public.contact_messages) then raise exception 'Fuite de messages';end if;
 begin insert into public.navigation_items(label_fr,href) values('Interdit','/test');raise exception 'Écriture visiteur acceptée';exception when insufficient_privilege then null;end;
 begin perform * from public.admin_users;raise exception 'Liste admin publique';exception when insufficient_privilege then null;end;
 begin insert into public.contact_messages(full_name,email,subject,message) values('Test','test@example.invalid','Interdit','Message interdit test.');raise exception 'Contact public direct accepté';exception when insufficient_privilege then null;end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$ begin if public.is_admin() then raise exception 'Compte sans rôle autorisé';end if;
 if exists(select 1 from public.contact_messages) then raise exception 'Messages exposés à un utilisateur ordinaire';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
 if not public.is_admin() or public.is_super_admin() then raise exception 'Rôle éditeur incorrect';end if;
 if (select count(*) from public.page_content where page_key='test')<>2 then raise exception 'Brouillon inaccessible à éditeur';end if;
 update public.page_content set title_fr='Modifié' where id='20000000-0000-4000-8000-000000000002';
 if not exists(select 1 from public.contact_messages) then raise exception 'Messages inaccessibles à éditeur';end if;
 if exists(select 1 from public.admin_users) then raise exception 'Liste admin accessible à éditeur';end if;
 begin perform public.set_admin_role('10000000-0000-4000-8000-000000000002','super_admin');raise exception 'Escalade de rôle acceptée';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ begin
 if not public.is_super_admin() then raise exception 'Super administrateur refusé';end if;
 if (select count(*) from public.admin_users)<>2 then raise exception 'Liste admin inaccessible';end if;
 begin perform public.set_admin_role('10000000-0000-4000-8000-000000000001',null);raise exception 'Dernier super_admin supprimé';exception when check_violation then null;end;
 perform public.set_admin_role('10000000-0000-4000-8000-000000000003','editor');
 if not exists(select 1 from public.admin_users where user_id='10000000-0000-4000-8000-000000000003') then raise exception 'Attribution de rôle échouée';end if;
end $$;
reset role;
do $$ begin
 if public.is_safe_url('javascript:alert(1)') or public.is_safe_url('//example.invalid') or public.valid_document_links('{"buttonUrl":"javascript:alert(1)"}'::jsonb) then raise exception 'Destination dangereuse acceptée';end if;
 if exists(select 1 from pg_tables where schemaname='public' and tablename in ('site_settings','navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','players','player_statistics','staff_members','bureau_members','gallery_categories','gallery_images','seasons','competitions','teams','matches','standings','trophies','contact_messages','admin_users','media_assets','activity_logs') and not rowsecurity) then raise exception 'RLS manquante';end if;
end $$;
rollback;
