'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/service';
import type { MutationResult } from '@/lib/admin/types';
export async function changeAdminRole(userId:string,role:string|null):Promise<MutationResult>{
 const {client}=await requireAdmin(true);
 if(!z.uuid().safeParse(userId).success||!z.enum(['editor','super_admin']).nullable().safeParse(role).success)return {ok:false,message:'Compte ou rôle invalide.'};
 const {error}=await client.rpc('set_admin_role',{target_user:userId,new_role:role});
 if(error)return {ok:false,message:'Modification refusée. Le dernier super administrateur doit conserver son accès.'};
 revalidatePath('/admin/administrateurs');return {ok:true,message:'Accès mis à jour.'};
}
export async function inviteAdmin(email:string):Promise<MutationResult>{
 await requireAdmin(true);if(!z.email().safeParse(email).success)return {ok:false,message:'Email invalide.'};
 const base=process.env.NEXT_PUBLIC_SITE_URL;
 if(!base?.startsWith('https://')&&!base?.startsWith('http://localhost'))return {ok:false,message:'Configurer NEXT_PUBLIC_SITE_URL avant les invitations.'};
 try{
  const {error}=await createServiceClient().auth.admin.inviteUserByEmail(email,{redirectTo:`${base}/admin/auth/confirm`});
  if(error)return {ok:false,message:'Invitation impossible. Vérifiez la configuration Auth et SMTP.'};
  return {ok:true,message:'Invitation envoyée. Attribuez ensuite le rôle via l’identifiant Auth de l’utilisateur. Aucun accès n’est attribué automatiquement.'};
 }catch{return {ok:false,message:'Service d’invitation non configuré.'};}
}
