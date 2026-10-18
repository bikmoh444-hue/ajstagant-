import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
const require=createRequire(import.meta.url),memo=new Map();let previewPath='/admin';
const database={};let sequence=0,authorized=true;
class Query{
 constructor(table){this.table=table;this.filters=[];this.mode='read';}
 select(_columns,options={}){this.options=options;return this;}
 eq(key,value){this.filters.push([key,value]);return this;}
 insert(rows){this.mode='insert';this.payload=rows;return this;}
 update(rows){this.mode='update';this.payload=rows;return this;}
 delete(){this.mode='delete';return this;}
 upsert(rows,options){this.mode='upsert';this.payload=rows;this.conflict=options.onConflict.split(',');return this;}
 single(){this.one=true;return this;}
 maybeSingle(){this.one=true;this.optional=true;return this;}
 then(resolve,reject){return Promise.resolve().then(()=>{
  const rows=database[this.table]??=[];const matches=row=>this.filters.every(([key,value])=>row[key]===value);
  let output=rows.filter(matches);
  if(this.mode==='insert'||this.mode==='upsert'){
   output=[];for(const item of Array.isArray(this.payload)?this.payload:[this.payload]){
    if(this.mode==='upsert'&&rows.some(old=>this.conflict.every(key=>old[key]===item[key])))continue;
    const row={id:`row-${++sequence}`,updated_at:`version-${sequence}`,is_visible:true,...structuredClone(item)};rows.push(row);output.push(row);
   }
  }else if(this.mode==='update'){for(const row of output)Object.assign(row,structuredClone(this.payload));}
  else if(this.mode==='delete'){database[this.table]=rows.filter(row=>!matches(row));}
  return {data:this.one?output[0]??null:output,error:this.one&&!this.optional&&!output.length?{message:'missing'}:null,count:this.options?.count?output.length:null};
 }).then(resolve,reject);}
}
function load(file){
 file=path.resolve(file);if(memo.has(file))return memo.get(file);
 const result={exports:{}};
 const local=id=>{
  if(id==='server-only')return {};
  if(id.endsWith('.css'))return {};
  if(id==='next/cache')return {revalidatePath(){}};
  if(id==='@/lib/admin/auth')return {requireAdmin:async()=>{if(!authorized)throw new Error('unauthorized');return {client:{from:table=>new Query(table)}};}};
  if(id==='next/navigation')return {usePathname:()=>previewPath,useRouter:()=>({refresh(){}})};
  if(id==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
  if(id==='next/image')return {__esModule:true,default:(input)=>{const props={...input};for(const key of ['fill','unoptimized','priority'])delete props[key];return React.createElement('img',props);}};
  if(id==='@/app/admin/actions')return {logoutAction:async()=>{},saveContent:async()=>({ok:true,message:'mock'})};
  if(id==='@/app/admin/starter-actions')return {prepareStarterContent:async()=>({ok:true,message:'mock'})};
  if(id==='@/app/admin/media-actions')return {uploadMedia:async()=>({ok:true,message:'mock'})};
  if(id==='@/components/admin/draft-preview')return {DraftPreview:()=>null};
  if(id.startsWith('@/')||id.startsWith('.')){
   let next=id.startsWith('@/')?path.resolve(id.slice(2)):path.resolve(path.dirname(file),id);
   if(!existsSync(next))next+=existsSync(next+'.ts')?'.ts':'.tsx';return load(next);
  }
  return require(id);
 };
 const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}});
 new Function('require','exports','module',outputText)(local,result.exports,result);memo.set(file,result.exports);return result.exports;
}
const {adminPages}=load('lib/admin/pages.ts');
assert.deepEqual(Object.keys(adminPages),['accueil','histoire','equipe','matchs','galerie','bureau','contact','parametres']);
assert.ok(adminPages.accueil.tables.includes('club_objectives'));
assert.ok(adminPages.equipe.tables.includes('staff_members'));
assert.ok(adminPages.matchs.tables.includes('standings'));
assert.ok(adminPages.contact.tables.includes('contact_messages'));
const {starterDocuments,completeStarterContent}=load('lib/admin/starter-content.ts');
const {validateDocument}=load('lib/data/documents.ts');
const documents=starterDocuments();
for(const [key,locales] of Object.entries(documents))for(const [locale,doc] of Object.entries(locales))assert.doesNotThrow(()=>validateDocument(key,doc),`${key}/${locale}`);
assert.deepEqual(completeStarterContent({title:'Mon vrai titre',src:null,enabled:false},{title:'Titre exemple',src:'/images/starter/terrain.svg',enabled:true}),{title:'Mon vrai titre',src:'/images/starter/terrain.svg',enabled:false});
assert.equal(completeStarterContent('Texte provisoire : à compléter','Présentation du club'),'Présentation du club');
assert.deepEqual(completeStarterContent(['Mon texte'],['Texte exemple']),['Mon texte']);
assert.equal(completeStarterContent('/storage/mon-logo.png','/images/starter/logo.svg'),'/storage/mon-logo.png');
const {prepareStarterContent}=load('app/admin/starter-actions.ts');
assert.equal((await prepareStarterContent()).ok,true);
assert.equal(database.page_content.length,7);assert.equal(database.players.length,4);assert.equal(database.matches.length,1);
assert.ok(database.players.every(row=>row.is_visible===false));assert.ok(database.bureau_members.every(row=>row.is_visible===false));assert.equal(database.matches[0].is_visible,false);
database.page_content.find(row=>row.page_key==='home').settings_json.fr.heroTitle='Mon titre personnalisé';
database.site_settings[0].logo_url='/mon-vrai-logo.png';
const counts=Object.fromEntries(Object.entries(database).map(([table,rows])=>[table,rows.length]));
assert.equal((await prepareStarterContent()).ok,true);
assert.deepEqual(Object.fromEntries(Object.entries(database).map(([table,rows])=>[table,rows.length])),counts);
assert.equal(database.page_content.find(row=>row.page_key==='home').settings_json.fr.heroTitle,'Mon titre personnalisé');
assert.equal(database.site_settings[0].logo_url,'/mon-vrai-logo.png');
authorized=false;await assert.rejects(()=>prepareStarterContent(),/unauthorized/);authorized=true;
// Exercer la vraie action de sauvegarde avec le dépôt simulé, dans les deux sens.
const {saveContent,deleteContent}=load('app/admin/actions.ts');
const {collections}=load('lib/admin/collections.generated.ts');
assert.equal(collections.gallery_images.fields.find(field=>field.name==='category_id').reference,'gallery_categories');
const syntheticValue={title_fr:'Test de valeur',title_ar:'اختبار',description_fr:'Test synthétique',description_ar:'اختبار',icon:'respect',sort_order:0,is_visible:false};
const createdValue=await saveContent('club_values',null,syntheticValue);assert.equal(createdValue.ok,true);
const valueRow=database.club_values.find(row=>row.id===createdValue.id);valueRow.id='fa5e7e41-1364-449d-9b4b-396a2c3c7048';
assert.equal((await saveContent('club_values',valueRow.id,{...syntheticValue,title_fr:'Valeur modifiée'})).ok,true);
assert.equal(database.club_values.find(row=>row.id===valueRow.id).title_fr,'Valeur modifiée');
authorized=false;await assert.rejects(()=>deleteContent('club_values',valueRow.id),/unauthorized/);authorized=true;
assert.equal((await deleteContent('club_values',valueRow.id)).ok,true);
assert.ok(!database.club_values.some(row=>row.id===valueRow.id));
const historyRow=database.page_content.find(row=>row.page_key==='histoire');
historyRow.id='82af9aab-b92b-4bee-ae6f-72a121fcdcc2';
historyRow.image_url=null;
const historyPhoto='https://example.invalid/storage/v1/object/public/club-assets/history.jpg';
historyRow.settings_json.fr.image.src=historyPhoto;historyRow.settings_json.ar.image.src=null;
const historyPayload=structuredClone(historyRow.settings_json);
const arabicBefore=structuredClone(historyPayload.ar);
delete arabicBefore.image.src;
historyPayload.fr.hero.title='Titre français modifié';
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:historyPayload,is_visible:true})).ok,true);
assert.deepEqual(historyRow.settings_json.ar,arabicBefore);
assert.equal(historyRow.image_url,historyPhoto);
assert.equal(Object.hasOwn(historyRow.settings_json.fr.image,'src'),false);
const frenchBefore=structuredClone(historyRow.settings_json.fr);
const arabicEdit=structuredClone(historyRow.settings_json);arabicEdit.ar.vision.title='رؤية معدلة';
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:arabicEdit,is_visible:true})).ok,true);
assert.deepEqual(historyRow.settings_json.fr,frenchBefore);
assert.equal(historyRow.image_url,historyPhoto);
const replacementPhoto='https://example.invalid/storage/v1/object/public/club-assets/replacement.jpg';
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:historyRow.settings_json,image_url:replacementPhoto,is_visible:true})).ok,true);
assert.equal(historyRow.image_url,replacementPhoto);
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:historyRow.settings_json,image_url:null,is_visible:true})).ok,true);
assert.equal(historyRow.image_url,null);
const stale=structuredClone(historyPayload);
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:stale,is_visible:true})).ok,true);
assert.equal(historyRow.image_url,null,'Un ancien onglet arabe ne doit pas restaurer une photo retirée');
assert.equal((await saveContent('page_content',historyRow.id,{page_key:'histoire',section_key:'config',settings_json:historyRow.settings_json,image_url:'javascript:alert(1)',is_visible:true})).ok,false);
assert.equal(historyRow.image_url,null);
authorized=false;await assert.rejects(()=>saveContent('page_content',historyRow.id,{}),/unauthorized/);authorized=true;
const {DashboardHome}=load('components/admin/dashboard-home.tsx');
const {AdminShell}=load('components/admin/admin-shell.tsx');
const {PageContentEditor}=load('components/admin/page-content-editor.tsx');
const historyEditorMarkup=renderToStaticMarkup(React.createElement(PageContentEditor,{row:{...historyRow,image_url:historyPhoto},site:null}));
assert.ok(historyEditorMarkup.includes('Photo commune FR / AR'));
assert.equal((historyEditorMarkup.match(/aria-label="URL du média"/g)??[]).length,1,'Un seul champ image commun aux deux langues');
assert.ok(!historyEditorMarkup.includes('>Statistiques<'),'Aucun éditeur de compteurs pour Histoire');
const {HistoryPage}=load('components/history/history-page.tsx');
const {historyPresentation}=load('lib/data/history-presentation.ts');
for(const locale of ['fr','ar']){
 const content=structuredClone(documents.histoire[locale]);
 content.statistics=[{id:'pending',label:'في انتظار التأكيد',value:null,is_visible:true,sort_order:0}];
 content.quote='في انتظار التأكيد';
 const story=renderToStaticMarkup(React.createElement(HistoryPage,{content,locale,logoUrl:null,clubName:'A.J.S TAGANT',clubNameAr:'الجمعية الشبابية لرياضة تكانت',slogan:''}));
 assert.ok(!story.includes('history-stats-strip'));assert.ok(!story.includes('page-statistics'));
 assert.ok(!story.includes('في انتظار التأكيد'));
 assert.ok(story.includes('2026'));
 assert.ok(story.includes(`dir="${locale==='ar'?'rtl':'ltr'}"`));
 assert.ok((story.match(/class="body-copy"/g)??[]).length>=4);
 assert.equal(historyPresentation(content,locale).image.src,content.image.src);
 assert.equal(historyPresentation({...content,paragraphs:['Paragraphe personnalisé']},locale).paragraphs[0],'Paragraphe personnalisé');
}
const render=children=>renderToStaticMarkup(React.createElement(AdminShell,{name:'A.J.S TAGANT',logo:'/images/starter/logo.svg',role:'super_admin',email:'admin@example.invalid'},children));
const home=render(React.createElement(DashboardHome));
for(const page of Object.keys(adminPages))assert.ok(home.includes(`/admin/${page}`));
assert.ok(!home.includes('/admin/joueurs'));
assert.ok(home.includes('PRÉPARER LE CONTENU'));
const row={id:'preview',page_key:'home',section_key:'config',settings_json:documents.home,is_visible:true};
const editor=render(React.createElement(PageContentEditor,{row,site:null}));
assert.ok(editor.includes('Grande bannière'));assert.ok(editor.includes('/images/starter/terrain.svg'));assert.ok(editor.includes('ENREGISTRER'));
const {BureauMembers}=load('components/bureau/bureau-members.tsx');
const frenchNames=new Map([...readFileSync('supabase/migrations/010_bureau_bilingual_names.sql','utf8').matchAll(/\('([^']+)','([^']+)'\)/g)].map(match=>[match[1],match[2]]));
const bureauMembers=[...readFileSync('supabase/migrations/009_ajs_tagant_bureau.sql','utf8').matchAll(/\('([^']+)','([^']+)','([^']+)',(\d+)\)/g)].map(match=>({id:match[4],name:match[1],nameAr:match[1],nameFr:frenchNames.get(match[1]),role:match[2],roleFr:match[2],roleAr:match[3],president:match[4]==='0',image:{src:null,alt:match[1]},is_demo:false,is_visible:true,sort_order:Number(match[4])}));
assert.equal(bureauMembers.length,9);
const bureau=renderToStaticMarkup(React.createElement('main',{className:'container',style:{paddingBlock:40}},React.createElement(BureauMembers,{members:bureauMembers})));
assert.ok(bureau.includes('bureau-advisors-title'));assert.ok(bureau.includes('Conseillers'));
for(const member of bureauMembers){assert.ok(bureau.includes(member.nameAr));assert.ok(bureau.includes(member.nameFr));assert.ok(bureau.includes(member.roleAr));assert.ok(bureau.includes(member.roleFr));}
assert.ok(bureau.includes('lang="ar" dir="rtl"'));assert.ok(bureau.includes('lang="fr" dir="ltr"'));assert.ok(!bureau.includes('club-media'));
const {CollectionManager}=load('components/admin/collection-manager.tsx');
const sectionPreviews=[];
for(const [key,page] of Object.entries(adminPages)){
 previewPath='/admin/'+key;
 const doc=database.page_content.find(row=>row.page_key===page.pageKey);
 const content=doc?React.createElement(PageContentEditor,{row:doc,site:null}):React.createElement(CollectionManager,{table:page.tables[0],rows:database[page.tables[0]]??[],references:{},site:null});
 sectionPreviews.push(['admin-section-'+key,render(content)]);
}
previewPath='/admin';
mkdirSync('test-results',{recursive:true});
const styles=existsSync('.next-production/static/css')?readdirSync('.next-production/static/css').filter(file=>file.endsWith('.css')).map(file=>`<link rel="stylesheet" href="../.next-production/static/css/${file}"/>`).join(''):'';
for(const [name,content] of [['admin-simple',home],['admin-accueil',editor],['bureau-bilingual',bureau],...sectionPreviews]){
 const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>${styles}</head><body><div class="${name==='bureau-bilingual'?'bureau-preview':'admin-area'}">${content}</div><script>document.body.dataset.overflow=String(document.documentElement.scrollWidth>innerWidth)</script></body></html>`;
 writeFileSync(`test-results/${name}.html`,html.replaceAll('src="/images/','src="../public/images/'));
}
console.log('PASS administration simple : 8 rubriques, regroupements, documents FR/AR valides, conservation des contenus personnalisés et rendu des composants Mon site/Accueil.');
console.log('Aperçus statiques générés dans test-results. Les écritures Supabase restent à vérifier en session authentifiée.');
if(process.argv.includes('--browser')){
 const chrome=process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe';
 assert.ok(existsSync(chrome),'Chromium requis pour le contrôle visuel');
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--allow-file-access-from-files','--remote-debugging-port=0',`--user-data-dir=${path.resolve('test-results/admin-browser-profile')}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
 let log='',socket;browser.stderr.on('data',data=>{log+=data;});
 const until=async(check)=>{for(let i=0;i<150;i++){if(await check())return;await new Promise(resolve=>setTimeout(resolve,100));}throw new Error('Délai Chromium dépassé');};
 try{
  await until(()=>/DevTools listening on (ws:\/\/[^\s]+)/.test(log));
  socket=new WebSocket(log.match(/DevTools listening on (ws:\/\/[^\s]+)/)[1]);await once(socket,'open');
  const pending=new Map();let sequence=0;
  socket.addEventListener('message',event=>{const message=JSON.parse(String(event.data));if(message.id&&pending.has(message.id)){const {resolve,reject,timer}=pending.get(message.id);clearTimeout(timer);pending.delete(message.id);if(message.error)reject(new Error(JSON.stringify(message.error)));else resolve(message.result);}});
  const request=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error(method));},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
  const {targetId}=await request('Target.createTarget',{url:'about:blank'});const {sessionId}=await request('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params)=>request(method,params,sessionId);await send('Page.enable');await send('Runtime.enable');
  const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
  for(const [name,width,height] of [['mobile320',320,1000],['mobile375',375,1000],['mobile390',390,1000],['mobile430',430,1000],['tablet',768,1100],['desktop',1440,1200]])for(const page of ['admin-simple','admin-accueil','bureau-bilingual',...sectionPreviews.map(([name])=>name)]){
   await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   await send('Page.navigate',{url:pathToFileURL(path.resolve(`test-results/${page}.html`)).href});
   await until(()=>evaluate(`document.readyState==='complete'&&!!document.querySelector('.admin-workspace,.bureau-members-grid')`));
   assert.equal(await evaluate('innerWidth'),width);
   assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`Débordement ${name}/${page}`);
   if(page==='bureau-bilingual'){
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.bureau-members-grid')).gridTemplateColumns.split(' ').length"),width>1023?3:width>640?2:1);
    assert.equal(await evaluate("document.querySelectorAll('.bureau-profile').length"),9);
    const widths=await evaluate("Array.from(document.querySelectorAll('.bureau-members-grid .bureau-profile')).map(card=>Math.round(card.getBoundingClientRect().width))");
    assert.ok(widths.every(value=>Math.abs(value-widths[0])<=1),'Cartes de meme largeur');
   }
   const metrics=await send('Page.getLayoutMetrics');
   const image=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:Math.ceil(metrics.cssContentSize.height),scale:1}});
   writeFileSync(`test-results/${page}-${name}.png`,Buffer.from(image.data,'base64'));
  }
 }finally{socket?.close();browser.kill();}
 console.log('PASS Chromium : bureau bilingue, grilles 3/2/1 et aucun debordement aux six resolutions demandees.');
}
