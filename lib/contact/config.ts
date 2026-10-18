import {isSupabaseConfigured} from '@/lib/supabase/config';
export function contactStorageMode():'local'|'disabled'|'supabase'{
 const mode=process.env.CONTACT_STORAGE_MODE;
 if(mode==='local'||mode==='supabase'||mode==='disabled')return mode;
 if(mode)return 'disabled';
 return isSupabaseConfigured()?'supabase':process.env.NODE_ENV==='development'?'local':'disabled';
}
