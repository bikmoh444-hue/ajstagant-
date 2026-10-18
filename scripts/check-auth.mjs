import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const redirect=url=>{throw Object.assign(new Error('redirect'),{url});};
let scenario;let calls;
const client={
 auth:{
  async signInWithPassword(credentials){calls.push(['signin',credentials]);if(scenario.network)throw new Error('network');return {error:scenario.authError??null};},
  async getUser(){return {data:{user:scenario.user??null},error:null};},
  async signOut(options){calls.push(['signout',options]);return {error:null};},
 },
 async rpc(name){calls.push(['rpc',name]);return {data:scenario.role??null,error:scenario.roleError??null};},
};
const memo=new Map();
function load(file){
 file=path.resolve(file);if(memo.has(file))return memo.get(file);
 const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
 const result={exports:{}};
 const local=id=>{
  if(id==='server-only')return {};
  if(id==='next/navigation')return {redirect};
  if(id==='next/cache')return {revalidatePath:(...args)=>calls.push(['revalidate',...args])};
  if(id==='@/lib/supabase/config')return {isSupabaseConfigured:()=>scenario.configured!==false};
  if(id==='@/lib/supabase/server')return {createClient:async options=>{calls.push(['client',options]);return client;}};
  if(id.startsWith('@/'))return load(id.slice(2)+'.ts');
  if(id.startsWith('.'))return load(path.join(path.dirname(file),id+'.ts'));
  return require(id);
 };
 new Function('require','exports','module',outputText)(local,result.exports,result);memo.set(file,result.exports);return result.exports;
}
const {loginAction,logoutAction}=load('app/admin/actions.ts');
const {getAdmin,requireAdmin}=load('lib/admin/auth.ts');
const {loginSchema,loginErrorMessage}=load('lib/admin/login.ts');
function reset(value={}){scenario=value;calls=[];}
function form(email='  owner@example.com  ',password=' secret '){const f=new FormData();f.set('email',email);f.set('password',password);f.set('$ACTION_ID_ignored','metadata');return f;}
const initial={ok:false,message:''};
reset({configured:false});assert.equal((await loginAction(initial,form())).ok,false);assert.equal(calls.length,0);
reset();assert.equal((await loginAction(initial,form('bad'))).ok,false);assert.equal(calls.length,0);
assert.equal(loginSchema.parse({email:' owner@example.com ',password:' secret '}).password,' secret ');
for(const role of ['editor','super_admin']){
 reset({role});await assert.rejects(()=>loginAction(initial,form()),error=>error.url==='/admin');
 assert.deepEqual(calls.find(c=>c[0]==='signin')[1],{email:'owner@example.com',password:' secret '});
 assert.deepEqual(calls[0],['client',{writable:true}]);
 assert.ok(!calls.some(c=>c[0]==='signout'));
}
for(const role of [null,'authenticated','admin','SUPER_ADMIN']){
 reset({role});const result=await loginAction(initial,form());assert.equal(result.ok,false);assert.match(result.message,/aucun rôle/);
 assert.deepEqual(calls.find(c=>c[0]==='signout')[1],{scope:'local'});
 assert.ok(!calls.some(c=>c[0]==='revalidate'));
}
reset({roleError:{code:'PGRST202'}});assert.match((await loginAction(initial,form())).message,/migrations SQL/);
reset({network:true});assert.match((await loginAction(initial,form())).message,/réseau/);
for(const [authError,expected] of [[{code:'email_not_confirmed',status:400},/Confirmez/],[{code:'invalid_credentials',status:400},/incorrect/],[{status:429},/Trop de tentatives/],[{name:'AuthRetryableFetchError',status:0},/indisponible/]]){
 reset({authError});assert.match((await loginAction(initial,form())).message,expected);assert.ok(!calls.some(c=>c[0]==='rpc'));
}
assert.match(loginErrorMessage({code:'email_provider_disabled',status:400}),/désactivée/);
reset();assert.equal(await getAdmin(),null);await assert.rejects(()=>requireAdmin(),e=>e.url==='/admin/login?reason=session');
reset({user:{id:'existing-user'},role:null});assert.equal(await getAdmin(),null);
reset({user:{id:'existing-user'},role:'editor'});assert.equal((await getAdmin()).role,'editor');await assert.rejects(()=>requireAdmin(true),e=>e.url==='/admin?error=forbidden');
reset({user:{id:'existing-user'},role:'super_admin'});assert.equal((await requireAdmin(true)).user.id,'existing-user');
reset();await assert.rejects(()=>logoutAction(),e=>e.url==='/admin/login');assert.ok(calls.some(c=>c[0]==='signout'&&c[1].scope==='local'));
console.log('PASS Auth simulée : validation, normalisation email, rôles autorisés/refusés, panne réseau, erreurs Auth/RPC, gardes et déconnexion.');
console.log('Ces tests ne prouvent pas une connexion réelle ni la persistance des cookies sur Supabase.');
