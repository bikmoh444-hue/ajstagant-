import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database';
import { supabaseConfig } from './config';
export async function createClient({writable=false}:{writable?:boolean}={}) {
 const store=await cookies(); const {url,key}=supabaseConfig();
 return createServerClient<Database>(url,key,{global:{fetch:(url,options)=>fetch(url,{...options,cache:'no-store'})}, cookies:{ getAll(){return store.getAll();},setAll(values){
  try { values.forEach(({name,value,options})=>store.set(name,value,options)); }
  catch(error) { if(writable)throw error; /* Les Server Components ne peuvent pas écrire ; middleware rafraîchit la session. */ }
 }}});
}
