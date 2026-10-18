import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import ts from 'typescript';
const require=createRequire(import.meta.url);const memo=new Map();
function load(file){file=path.resolve(file);if(memo.has(file))return memo.get(file);const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});const result={exports:{}};const local=id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id);new Function('require','exports','module',outputText)(local,result.exports,result);memo.set(file,result.exports);return result.exports;}
const {rowSchema,safeDestination,validateNestedLinks}=load('lib/admin/validation.ts');
const {documentTemplates,validateDocument}=load('lib/data/documents.ts');
// The empty database seed has no season/competition; both selections are optional.
const sportsDocument=structuredClone(documentTemplates.matchs);
assert.equal(validateDocument('matchs',sportsDocument).default_season_id,null);
assert.equal(validateDocument('matchs',sportsDocument).default_competition_id,null);
assert.doesNotThrow(()=>validateDocument('matchs',{...sportsDocument,default_season_id:'season-id',default_competition_id:'competition-id'}));
assert.throws(()=>validateDocument('matchs',{...sportsDocument,default_season_id:12}));
assert.throws(()=>validateDocument('matchs',{...sportsDocument,default_competition_id:{}}));
assert.equal(safeDestination('/histoire'),true);assert.equal(safeDestination('/'),true);
for(const url of ['javascript:alert(1)','data:text/html,x','//example.com','/\\example.com','https://name:password@example.com'])assert.equal(safeDestination(url),false,url);
assert.equal(validateNestedLinks({buttons:[{href:'javascript:alert(1)'}]}),false);
assert.equal(rowSchema('navigation_items').safeParse({label_fr:'Test',href:'/test',is_visible:true,sort_order:0}).success,true);
assert.equal(rowSchema('navigation_items').safeParse({label_fr:'Test',href:'javascript:alert(1)'}).success,false);
assert.equal(rowSchema('players').safeParse({full_name:'Joueur test',position:'Gardiens',is_active:true,is_visible:true}).success,true);
assert.equal(rowSchema('players').safeParse({full_name:'Joueur test',position:'Gardiens',role:'super_admin'}).success,false);
assert.equal(rowSchema('site_settings').safeParse({primary_color:'#2F4294'}).success,true);
assert.equal(rowSchema('site_settings').safeParse({primary_color:'red;display:none'}).success,false);
assert.equal(rowSchema('site_settings').safeParse({heading_font:'unsafe-font'}).success,false);
assert.equal(rowSchema('site_settings').safeParse({header_logo_url:'https://example.com/logo.png',footer_logo_url:null}).success,true);
assert.equal(rowSchema('site_settings').safeParse({header_logo_url:'javascript:alert(1)'}).success,false);
// Les documents enregistrés avant les nouveaux liens restent compatibles.
const oldHome=structuredClone(documentTemplates.home);
delete oldHome.copy.playersButtonUrl;delete oldHome.copy.galleryButtonUrl;delete oldHome.copy.galleryCardUrl;
assert.equal(validateDocument('home',oldHome).copy.playersButtonUrl,'/equipe');
const files=['001_initial_schema','002_content_tables','003_sports_tables','004_storage_policies','005_rls_policies','006_functions_triggers'];
const sources=files.map(name=>readFileSync(`supabase/migrations/${name}.sql`,'utf8'));
for(const sql of sources){assert.ok(sql.startsWith('begin;'));assert.ok(sql.trim().endsWith('commit;'));}
assert.match(sources[4],/revoke insert on public.contact_messages from anon,authenticated/);
assert.match(sources[4],/revoke all on public.admin_users from anon,authenticated/);
assert.match(sources[5],/pg_advisory_xact_lock\(842017\)/);
assert.match(sources[5],/revoke all on function public.submit_contact[^;]+from public,anon,authenticated/);
assert.match(sources[3],/file_size_limit/);assert.match(sources[0],/security definer set search_path = ''/);
for(const filename of ['client.ts','public.ts','server.ts'])assert.doesNotMatch(readFileSync(`lib/supabase/${filename}`,'utf8'),/SUPABASE_SERVICE_ROLE_KEY/);
assert.match(readFileSync('lib/supabase/service.ts','utf8'),/import 'server-only'/);
const seed=readFileSync('supabase/seed.sql','utf8');for(const table of ['players','matches','standings','admin_users','bureau_members','player_statistics'])assert.doesNotMatch(seed,new RegExp(`insert into public\\.${table}\\(`));
console.log('PASS contrats sécurité : validation, destinations, champs autorisés, migrations ordonnées et absence de seed fictif.');
console.log('Ces contrôles ne remplacent pas l’exécution SQL de supabase/tests/permissions.sql sur une base jetable.');
