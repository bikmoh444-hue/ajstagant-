import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request:Request){
 const url=new URL(request.url);const token=url.searchParams.get('token_hash');const type=url.searchParams.get('type');const code=url.searchParams.get('code');
 if(!token&&!code)return NextResponse.redirect(new URL('/admin/set-password',url));
 const client=await createClient({writable:true});
 if(token&&(type==='invite'||type==='recovery')){const {error}=await client.auth.verifyOtp({token_hash:token,type});if(!error)return NextResponse.redirect(new URL('/admin/set-password',url));}
 if(code){const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/admin/set-password',url));}
 return NextResponse.redirect(new URL('/admin/login?reason=expired-link',url));
}
