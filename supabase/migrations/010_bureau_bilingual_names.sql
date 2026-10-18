-- Exécuter après 009_ajs_tagant_bureau.sql. Aucun membre ni média supprimé.
begin;
alter table public.bureau_members add column if not exists full_name_ar text;
alter table public.bureau_members add column if not exists full_name_fr text;

-- Conserver le nom historique ; récupérer sa langue sans inventer de traduction.
update public.bureau_members set full_name_ar=full_name
 where full_name_ar is null and full_name ~ '[ء-ي]';
update public.bureau_members set full_name_fr=full_name
 where full_name_fr is null and full_name !~ '[ء-ي]';

-- Transcriptions initiales modifiables dans le dashboard.
update public.bureau_members b set full_name_fr=v.name_fr
from (values
 ('فيصل وعراب','Fayçal Ouarab'),
 ('عادل تغازوت','Adil Taghazout'),
 ('عبد الله معتصيم','Abdellah Mouatassim'),
 ('علي مهنا','Ali Mhenna'),
 ('إسماعيل دودولي','Ismaïl Doudouli'),
 ('عبد الله فتحي','Abdellah Fathi'),
 ('عبد اللطيف جاكوم','Abdellatif Jakoum'),
 ('مصطفى وهيا','Mostapha Ouhia'),
 ('حسن بن يحي','Hassan Ben Yahya')
) v(name_ar,name_fr)
where b.full_name_ar=v.name_ar and b.full_name_fr is null;
-- Les politiques RLS de bureau_members couvrent également ces colonnes.
commit;
