import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, supabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/lib/supabase/database';
export async function middleware(request: NextRequest) {
 const requestHeaders=new Headers(request.headers);requestHeaders.set('x-ajt-admin','1');
 let response=NextResponse.next({request:{headers:requestHeaders}});
 response.headers.set('Cache-Control','private, no-store');
 if(!isSupabaseConfigured()) return response;
 const {url,key}=supabaseConfig();
 const supabase=createServerClient<Database>(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){
  values.forEach(({name,value})=>request.cookies.set(name,value));requestHeaders.set('cookie',request.cookies.toString());response=NextResponse.next({request:{headers:requestHeaders}});
  values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
 }}});
 try { await supabase.auth.getUser(); } catch { /* requireAdmin refuse toute session non vérifiable. */ }
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
export const config={matcher:['/admin/:path*']};
