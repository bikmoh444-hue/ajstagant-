import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import ts from 'typescript';
const nodeRequire=createRequire(import.meta.url),memo=new Map();
let locale='fr';
const rows={page_content:[],history_milestones:[],club_values:[],gallery_images:[],gallery_categories:[]};
function load(file){
 file=path.resolve(file);if(memo.has(file))return memo.get(file);
 const loaded={exports:{}};
 const require=id=>{
  if(id==='server-only'||id==='./public-settings')return {};
  if(id==='react')return {cache:fn=>fn};
  if(id==='next/navigation')return {notFound(){throw new Error('not found');}};
  if(id==='@/lib/locale')return {getLocale:async()=>locale};
  if(id==='@/lib/supabase/public')return {createPublicClient:()=>({from:table=>({select:async()=>({data:rows[table]??[],error:null})})})};
  if(id.startsWith('.')||id.startsWith('@/')){let next=id.startsWith('@/')?path.resolve(id.slice(2)):path.resolve(path.dirname(file),id);if(!existsSync(next))next+='.ts';return load(next);}
  return nodeRequire(id);
 };
 const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 new Function('require','exports','module',outputText)(require,loaded.exports,loaded);memo.set(file,loaded.exports);return loaded.exports;
}
const {documentTemplates}=load('lib/data/documents.ts');
const {historyTextDocuments,historyImageSource}=load('lib/data/history-images.ts');
const {loadHistory}=load('lib/data/supabase-repository.ts');
const photo='https://project.supabase.co/storage/v1/object/public/club-assets/photo%20historique.webp?version=2';
const alternate='https://project.supabase.co/storage/v1/object/public/club-assets/ancienne.jpg';
const settings={fr:structuredClone(documentTemplates.histoire),ar:structuredClone(documentTemplates.histoire)};
settings.fr.image={src:photo,alt:'Photo française',caption:'Légende française'};
settings.ar.image={src:null,alt:'صورة الجمعية',caption:'وصف الصورة'};
settings.fr.hero.title='Histoire française';settings.ar.hero.title='تاريخ الجمعية';
const row={page_key:'histoire',section_key:'config',image_url:null,settings_json:settings};rows.page_content=[row];
rows.gallery_categories=[{id:'history',slug:'histoire'}];
rows.gallery_images=[{id:'gallery-image',category_id:'history',image_url:alternate,title_fr:'Photo',title_ar:'صورة',sort_order:0,is_visible:true}];
for(const language of ['fr','ar','fr']){
 locale=language;const content=await loadHistory();
 assert.equal(content.image.src,photo,'Une ancienne image FR doit rester visible en AR puis en FR');
 assert.equal(content.image.alt,settings[language].image.alt);
 assert.equal(content.image.caption,settings[language].image.caption);
 assert.equal(content.hero.title,settings[language].hero.title);
 assert.equal(content.gallery[0].image.src,alternate,'Galerie : même URL quelle que soit la langue');
}
assert.equal(settings.ar.image.src,null,'La lecture ne modifie pas les données enregistrées');
const arabicImage=settings.ar.image;
delete settings.ar.image;locale='ar';assert.equal((await loadHistory()).image.src,photo,'Un ancien document AR sans objet image garde la photo commune');
settings.ar.image=arabicImage;
settings.ar.image.src=alternate;
const migrated=historyTextDocuments(settings,photo);
assert.ok(migrated._legacy_history_image_url.includes(alternate),'Conserver la référence divergente existante');
assert.equal(Object.hasOwn(migrated.fr.image,'src'),false);
assert.equal(Object.hasOwn(migrated.ar.image,'src'),false);
row.settings_json=migrated;row.image_url=photo;
for(const language of ['fr','ar']){locale=language;assert.equal((await loadHistory()).image.src,photo);}
row.image_url=alternate;
assert.equal((await loadHistory()).image.src,alternate,'La colonne commune prévaut sur les anciennes versions');
row.image_url=null;
assert.equal((await loadHistory()).image.src,null,'Une suppression volontaire ne restaure pas une image historique');
assert.equal(historyImageSource({fr:{image:{src:null}},ar:{image:{src:photo}}},null),photo,'Récupérer aussi une image existant seulement en AR');
console.log('PASS images Histoire : FR → AR → FR, URL Storage intacte, photo commune, textes indépendants, galerie et retrait volontaire.');
