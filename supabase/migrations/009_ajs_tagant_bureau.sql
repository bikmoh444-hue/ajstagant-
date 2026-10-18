-- À exécuter dans le SQL Editor Supabase après les migrations existantes.
-- Réexécutable : conserve les membres et leurs photos déjà enregistrés.
begin;

-- Remplace uniquement le nom dans les champs éditoriaux, sans toucher
-- aux identifiants techniques, liens, fichiers, contacts ou comptes.
do $$
declare col record;
begin
 for col in
  select table_name, column_name, data_type from information_schema.columns
  where table_schema='public' and table_name in
   ('site_settings','page_content','homepage_sections','navigation_items',
    'history_milestones','club_objectives','club_values','teams','competitions','trophies')
   and column_name in ('club_name','slogan','footer_text','seo_title','seo_description',
    'title_fr','title_ar','description_fr','description_ar','content_fr','content_ar',
    'label_fr','label_ar','name','short_name','subtitle','settings_json')
   and data_type in ('text','jsonb')
 loop
  execute format(
   'update public.%I set %I = regexp_replace(%I::text, %L, %L, ''g'')::%s where %I::text ~ %L',
   col.table_name,col.column_name,col.column_name,
   '\mAJT( TAGANT)?\M','A.J.S TAGANT',col.data_type,col.column_name,'\mAJT\M');
 end loop;
end $$;

-- Les politiques existantes sont conservées ; lecture publique des membres
-- visibles uniquement et écriture réservée aux administrateurs autorisés.
alter table public.bureau_members enable row level security;
drop policy if exists published_read on public.bureau_members;
create policy published_read on public.bureau_members for select
 to anon, authenticated using (is_visible);
drop policy if exists admin_manage on public.bureau_members;
create policy admin_manage on public.bureau_members for all to authenticated
 using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.bureau_members to anon, authenticated;
grant insert, update, delete on public.bureau_members to authenticated;

insert into public.bureau_members
 (full_name,role_fr,role_ar,sort_order,is_president,is_featured,is_visible)
select member.full_name,member.role_fr,member.role_ar,member.sort_order,
 member.sort_order=0 and not exists
  (select 1 from public.bureau_members where is_president and is_visible),true,true
from (values
 ('فيصل وعراب','Président','الرئيس',0),
 ('عادل تغازوت','Vice-président','نائب الرئيس',10),
 ('عبد الله معتصيم','Secrétaire général','الكاتب العام',20),
 ('علي مهنا','Secrétaire général adjoint','نائب الكاتب العام',30),
 ('إسماعيل دودولي','Trésorier','أمين المال',40),
 ('عبد الله فتحي','Trésorier adjoint','نائب أمين المال',50),
 ('عبد اللطيف جاكوم','Conseiller','مستشار',60),
 ('مصطفى وهيا','Conseiller','مستشار',70),
 ('حسن بن يحي','Conseiller','مستشار',80)
) as member(full_name,role_fr,role_ar,sort_order)
where not exists
 (select 1 from public.bureau_members existing where existing.full_name=member.full_name);

commit;
