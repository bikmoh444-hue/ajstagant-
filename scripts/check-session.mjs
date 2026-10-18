import assert from 'node:assert/strict';
import { createServerClient } from '@supabase/ssr';

// API Auth simulée, SDK SSR réel : aucune connexion réseau ni compte créé.
const cookies=new Map();const written=[];
const user={id:'10000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'session-test@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
const jwt=()=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),Buffer.from('mock-signature').toString('base64url')].join('.');
const requests=[];
const mockFetch=async(input,options)=>{
 const url=new URL(String(input));requests.push(url.pathname);
 if(url.pathname.endsWith('/token'))return Response.json({access_token:jwt(),refresh_token:'mock-refresh',expires_in:3600,token_type:'bearer',user});
 if(url.pathname.endsWith('/user')){
  assert.match(new Headers(options?.headers).get('authorization')??'',/^Bearer /);
  return Response.json(user);
 }
 if(url.pathname.endsWith('/logout'))return new Response(null,{status:204});
 throw new Error(`Unexpected mock endpoint ${url.pathname}`);
};
function client(){return createServerClient('https://session-test.supabase.co','mock-anon-key',{
 global:{fetch:mockFetch},cookies:{getAll:()=>Array.from(cookies,([name,value])=>({name,value})),setAll(values){for(const {name,value,options} of values){written.push({name,options});if(options.maxAge===0)cookies.delete(name);else cookies.set(name,value);}}},
});}
const first=client();assert.equal((await first.auth.signInWithPassword({email:user.email,password:'mock-password'})).error,null);
assert.ok(cookies.size>0,'La connexion doit écrire une session dans les cookies');
const reloaded=client();const identity=await reloaded.auth.getUser();assert.equal(identity.error,null);assert.equal(identity.data.user.id,user.id,'Une nouvelle requête doit retrouver la session');
assert.equal((await reloaded.auth.signOut({scope:'local'})).error,null);
assert.equal(cookies.size,0,'La déconnexion doit effacer la session');
assert.equal((await client().auth.getUser()).data.user,null);
assert.ok(requests.includes('/auth/v1/user'));
console.log(`PASS SDK SSR simulé : cookies écrits (${written.length} opérations), identité relue après nouvelle requête, déconnexion et refus après déconnexion.`);
console.log('La validité des jetons, le rafraîchissement expiré et Auth distant restent à vérifier sur Supabase.');
