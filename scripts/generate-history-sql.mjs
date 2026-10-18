import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import ts from 'typescript';
const require=createRequire(import.meta.url),memo=new Map();
function load(file){
 file=path.resolve(file);if(memo.has(file))return memo.get(file);
 const result={exports:{}};
 const local=id=>{if(id.startsWith('.')||id.startsWith('@/')){let next=id.startsWith('@/')?path.resolve(id.slice(2)):path.resolve(path.dirname(file),id);if(!existsSync(next))next+='.ts';return load(next);}return require(id);};
 const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
 new Function('require','exports','module',outputText)(local,result.exports,result);memo.set(file,result.exports);return result.exports;
}
const {documentTemplates}=load('lib/data/documents.ts');
const {officialHistory,officialValues}=load('lib/data/official-history.ts');
const json=value=>`'${JSON.stringify(value).replaceAll("'","''")}'::jsonb`;
const defaults=Object.fromEntries(['fr','ar'].map(locale=>[locale,{...documentTemplates.histoire,...officialHistory[locale],future:{...documentTemplates.histoire.future,...officialHistory[locale].future},is_demo:false}]));
const sql=`-- AJT TAGANT : contenus officiels FR/AR de la page Histoire.
-- À exécuter dans le SQL Editor Supabase après les migrations existantes.
-- Les colonnes FR/AR et le document JSON bilingue existent déjà : aucun ALTER
-- TABLE nécessaire. Images, liens, autres pages, anciens messages et RLS conservés.
begin;

insert into public.page_content(page_key,section_key,settings_json)
values ('histoire','config',${json(defaults)})
on conflict(page_key,section_key) do nothing;

do $migration$
declare
 patches jsonb := ${json(officialHistory)};
 baseline jsonb := ${json(defaults)};
 language text;
 document jsonb;
 patch jsonb;
begin
 foreach language in array array['fr','ar'] loop
  select settings_json->language into document from public.page_content
   where page_key='histoire' and section_key='config' for update;
  patch:=patches->language;
  document:=(baseline->language) || coalesce(document,'{}'::jsonb) || (patch - 'future');
  document:=jsonb_set(document,'{future}',coalesce(document->'future','{}'::jsonb) || (patch->'future'));
  document:=jsonb_set(document,'{is_demo}','false'::jsonb);
  update public.page_content set settings_json=jsonb_set(settings_json,array[language],document)
   where page_key='histoire' and section_key='config';
 end loop;
end $migration$;

-- Réutiliser les cartes connues ; conserver toute autre valeur personnalisée.
do $values$
declare item jsonb; target uuid; ordinal integer:=0;
begin
 for item in select value from jsonb_array_elements(${json(officialValues)}) loop
  select id into target from public.club_values
   where title_fr=item->>'title_fr' or title_ar=item->>'title_ar'
    or (item->>'title_fr'='Ambition' and title_fr='Rigueur')
   order by sort_order,id limit 1;
  if target is null then
   insert into public.club_values(title_fr,title_ar,description_fr,description_ar,icon,sort_order,is_visible)
    values(item->>'title_fr',item->>'title_ar',item->>'description_fr',item->>'description_ar',item->>'icon',ordinal,true);
  else
   update public.club_values set title_fr=item->>'title_fr',title_ar=item->>'title_ar',
    description_fr=item->>'description_fr',description_ar=item->>'description_ar',
    icon=item->>'icon',sort_order=ordinal where id=target;
  end if;
  ordinal:=ordinal+10;
 end loop;
end $values$;

-- L'API fournit un sujet interne pour les nouveaux messages à trois champs.
-- La RPC submit_contact et ses quotas restent inchangés et réservés au service_role.
-- Les politiques admin_manage existantes protègent page_content et club_values.
commit;
`;
writeFileSync('sql/ajt_tagant_bilingual_content.sql',sql);
console.log('SQL généré : sql/ajt_tagant_bilingual_content.sql');
