begin;
create function public.is_safe_url(value text) returns boolean language sql immutable set search_path='' as $$
 select value is null or (value !~ '[[:cntrl:]]' and position(chr(92) in value)=0 and (value ~ '^/([^/][^[:cntrl:]]*)?$' or value ~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$'))
$$;
create function public.valid_document_links(value jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text; child jsonb; begin
 if jsonb_typeof(value)='object' then
  for k,child in select * from jsonb_each(value) loop
   if k ~* '(url|href|src)$' and jsonb_typeof(child)='string' and child#>>'{}'<>'' and not public.is_safe_url(child#>>'{}') then return false;end if;
   if not public.valid_document_links(child) then return false;end if;
  end loop;
 elsif jsonb_typeof(value)='array' then
  for child in select * from jsonb_array_elements(value) loop if not public.valid_document_links(child) then return false;end if;end loop;
 end if;return true;
end $$;
revoke all on function public.is_safe_url(text),public.valid_document_links(jsonb) from public;
grant execute on function public.is_safe_url(text),public.valid_document_links(jsonb) to anon,authenticated,service_role;
do $$ declare c record;begin
 for c in select table_name,column_name from information_schema.columns where table_schema='public' and (column_name like '%\_url' escape '\' or column_name='href') loop
 execute format('alter table public.%I add constraint %I check(public.is_safe_url(%I))',c.table_name,c.table_name||'_'||c.column_name||'_safe',c.column_name);
 end loop;
end $$;
alter table public.page_content add constraint safe_page_document check(public.valid_document_links(settings_json));
alter table public.homepage_sections add constraint safe_section_document check(public.valid_document_links(settings_json));
create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create function private.log_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.activity_logs(user_id,table_name,record_id,operation) values(auth.uid(),tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',''),tg_op);
 return coalesce(new,old);
end $$;
do $$ declare t text; begin
 foreach t in array array['site_settings','page_content','homepage_sections','players','matches','standings'] loop
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
 end loop;
 foreach t in array array['site_settings','navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','players','player_statistics','staff_members','bureau_members','gallery_categories','gallery_images','seasons','competitions','teams','matches','standings','trophies','admin_users'] loop
 execute format('create trigger log_change after insert or update or delete on public.%I for each row execute function private.log_change()',t);
 end loop;
end $$;
create function private.calculate_points() returns trigger language plpgsql set search_path='' as $$
declare c public.competitions; begin
 if new.points_mode='calculated' then
  select * into c from public.competitions where id=new.competition_id;
  new.points=new.wins*c.win_points+new.draws*c.draw_points+new.losses*c.loss_points;
 end if; return new;
end $$;
create trigger calculate_points before insert or update on public.standings for each row execute function private.calculate_points();

create function private.protect_last_super_admin() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(842017);
 if old.role='super_admin' and (tg_op='DELETE' or new.role<>'super_admin') and (select count(*) from public.admin_users where role='super_admin')<=1 then
 raise exception 'Le dernier super_admin ne peut pas être retiré.' using errcode='23514'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger protect_last_super_admin before update or delete on public.admin_users for each row execute function private.protect_last_super_admin();
create function public.set_admin_role(target_user uuid, new_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(842017);
 if not public.is_super_admin() then raise exception 'Accès refusé' using errcode='42501'; end if;
 if new_role is null then delete from public.admin_users where user_id=target_user;
 elsif new_role in ('super_admin','editor') then insert into public.admin_users(user_id,role) values(target_user,new_role) on conflict(user_id) do update set role=excluded.role;
 else raise exception 'Rôle invalide' using errcode='22023'; end if;
end $$;
revoke all on function public.set_admin_role(uuid,text) from public,anon;
grant execute on function public.set_admin_role(uuid,text) to authenticated;

create function public.submit_contact(p_key text,p_full_name text,p_email text,p_phone text,p_subject text,p_message text) returns uuid language plpgsql security definer set search_path='' as $$
declare n integer; result uuid; begin
 if length(p_key)<>64 then raise exception 'Invalid quota key'; end if;
 delete from private.contact_rate_limits where expires_at<now();
 insert into private.contact_rate_limits(key,attempts,expires_at) values(p_key,1,now()+interval '15 minutes')
 on conflict(key) do update set attempts=private.contact_rate_limits.attempts+1 returning attempts into n;
 if n>5 then raise exception 'CONTACT_RATE_LIMIT' using errcode='P0001'; end if;
 insert into public.contact_messages(full_name,email,phone,subject,message) values(trim(p_full_name),trim(p_email),nullif(trim(p_phone),''),trim(p_subject),trim(p_message)) returning id into result;
 return result;
end $$;
revoke all on function public.submit_contact(text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_contact(text,text,text,text,text,text) to service_role;
create function public.move_content(p_table text,p_id uuid,p_direction text) returns void language plpgsql security definer set search_path='' as $$
declare current_order integer; other_id uuid; other_order integer; begin
 if not public.is_admin() then raise exception 'Forbidden' using errcode='42501';end if;
 if p_table not in ('navigation_items','page_content','homepage_sections','history_milestones','club_objectives','club_values','players','staff_members','bureau_members','gallery_categories','gallery_images','seasons','competitions','teams','matches','standings','trophies') or p_direction not in ('up','down') then raise exception 'Invalid collection';end if;
 perform pg_advisory_xact_lock(hashtext(p_table));
 execute format('with ranked as (select id,(row_number() over(order by sort_order,id)*10)::integer n from public.%I) update public.%I t set sort_order=r.n from ranked r where t.id=r.id',p_table,p_table);
 execute format('select sort_order from public.%I where id=$1',p_table) into current_order using p_id;
 execute format('select id,sort_order from public.%I where sort_order %s $1 order by sort_order %s limit 1',p_table,case when p_direction='up' then '<' else '>' end,case when p_direction='up' then 'desc' else 'asc' end) into other_id,other_order using current_order;
 if other_id is not null then execute format('update public.%I set sort_order=case when id=$1 then $3 else $4 end where id in ($1,$2)',p_table) using p_id,other_id,other_order,current_order;end if;
end $$;
revoke all on function public.move_content(text,uuid,text) from public,anon;
grant execute on function public.move_content(text,uuid,text) to authenticated;
create function public.media_is_referenced(p_url text) returns boolean language plpgsql security definer set search_path='' as $$
declare t text; found boolean; begin
 if not public.is_admin() then raise exception 'Forbidden' using errcode='42501';end if;
 foreach t in array array['site_settings','page_content','homepage_sections','history_milestones','players','staff_members','bureau_members','gallery_images','teams','competitions'] loop
 execute format('select exists(select 1 from public.%I t where position($1 in to_jsonb(t)::text)>0)',t) into found using p_url;
 if found then return true;end if;end loop;return false;
end $$;
revoke all on function public.media_is_referenced(text) from public,anon;
grant execute on function public.media_is_referenced(text) to authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
commit;
