import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { AdminRole } from './types';
import { isAdminRole } from './login';
export const getAdmin=cache(async()=>{
 if(!isSupabaseConfigured())return null;
 const client=await createClient();
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user)return null;
 const {data:role,error:roleError}=await client.rpc('current_admin_role');
 if(roleError||!isAdminRole(role)) return null;
 return {client,user,role:role as AdminRole};
});
export async function requireAdmin(superOnly=false) {
 const admin=await getAdmin();
 if(!admin)redirect('/admin/login?reason=session');
 if(superOnly&&admin.role!=='super_admin')redirect('/admin?error=forbidden');
 return admin;
}
