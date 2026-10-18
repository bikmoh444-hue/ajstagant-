'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export async function setPassword(_:string,form:FormData){
 const password=String(form.get('password')??'');if(!z.string().min(12).max(200).safeParse(password).success)return 'Le mot de passe doit contenir au moins 12 caractères.';
 const client=await createClient({writable:true});const {data:{user}}=await client.auth.getUser();if(!user)return 'La session a expiré. Demandez une nouvelle invitation.';
 const {error}=await client.auth.updateUser({password});if(error)return 'Le mot de passe n’a pas pu être enregistré.';
 await client.auth.signOut();redirect('/admin/login');
}
