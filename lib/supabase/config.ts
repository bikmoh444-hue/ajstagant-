export function isSupabaseConfigured() { return process.env.AJT_DATA_SOURCE!=='demo'&&Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); }
export function supabaseConfig() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key) throw new Error('Supabase non configuré. Consulter supabase/README.md.');
 return {url,key};
}
