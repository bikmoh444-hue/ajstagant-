import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database';
import { supabaseConfig } from './config';
// Client anonyme séparé : aucune fuite de brouillon via une session admin.
export function createPublicClient() {
 const {url,key}=supabaseConfig();
 return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,cache:'no-store'})}});
}
