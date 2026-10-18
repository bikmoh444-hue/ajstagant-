'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { requireAdmin } from '@/lib/admin/auth';
import { rowSchema } from '@/lib/admin/validation';
import { collections, type EditableTable } from '@/lib/admin/collections.generated';
import { validateDocument, type DocumentKey, documentTemplates } from '@/lib/data/documents';
import type { MutationResult } from '@/lib/admin/types';
import { loginSchema, loginErrorMessage, isAdminRole } from '@/lib/admin/login';
import { historyDocumentWithImage, historyImageSource, historyTextDocuments } from '@/lib/data/history-images';

export async function loginAction(_:MutationResult, form:FormData):Promise<MutationResult> {
 const result=loginSchema.safeParse({email:form.get('email'),password:form.get('password')});
 if(!result.success)return {ok:false,message:'Indiquez un email et un mot de passe valides.'};
 if(!isSupabaseConfigured())return {ok:false,message:'Supabase n’est pas configuré. Consultez la documentation d’installation.'};
 try {
  const client=await createClient({writable:true});const {error}=await client.auth.signInWithPassword(result.data);
  if(error)return {ok:false,message:loginErrorMessage(error)};
  const {data:role,error:roleError}=await client.rpc('current_admin_role');
  if(roleError||!isAdminRole(role)){
   await client.auth.signOut({scope:'local'});
   return {ok:false,message:roleError
    ? 'Votre connexion est valide, mais les permissions administrateur sont indisponibles. Vérifiez les migrations SQL et la fonction current_admin_role dans Supabase.'
    : 'Votre connexion est valide, mais ce compte ne possède aucun rôle administrateur autorisé. Le propriétaire doit attribuer editor ou super_admin à votre UUID Supabase.'};
  }
 } catch {
  return {ok:false,message:'Impossible de joindre le service de connexion. Vérifiez le réseau et la configuration Supabase.'};
 }
 revalidatePath('/admin','layout');redirect('/admin');
}
export async function logoutAction(){if(isSupabaseConfigured()){const client=await createClient({writable:true});await client.auth.signOut({scope:'local'});}revalidatePath('/admin','layout');redirect('/admin/login');}

function isTable(value:string):value is EditableTable{return Object.hasOwn(collections,value);}
function invalidate(){revalidatePath('/','layout');revalidatePath('/admin','layout');}
export async function saveContent(tableName:string,id:string|null,input:unknown):Promise<MutationResult>{
 const {client}=await requireAdmin();
 if(!isTable(tableName))return {ok:false,message:'Collection non autorisée.'};
 if(id&&!z.uuid().safeParse(id).success)return {ok:false,message:'Identifiant invalide.'};
 const result=rowSchema(tableName).safeParse(input);
 if(!result.success)return {ok:false,message:'Vérifiez les champs du formulaire.',errors:result.error.flatten().fieldErrors as Record<string,string[]>};
 const data=result.data;
 if(tableName==='contact_messages'){
  if(!id)return {ok:false,message:'La création de messages est réservée au formulaire public.'};
  const {error}=await client.from('contact_messages').update({status:String(data.status)}).eq('id',id);
  if(error)return {ok:false,message:'Le message n’a pas pu être mis à jour.'};
  invalidate();return {ok:true,message:'Statut enregistré.'};
 }
 if(tableName==='page_content'&&data.section_key==='config'){
  if(typeof data.page_key!=='string'||!Object.hasOwn(documentTemplates,data.page_key))return {ok:false,message:'Page inconnue.'};
  if(data.page_key==='histoire'){
   let existing:{image_url:unknown;settings_json:unknown}|null=null;
   if(id){
    const {data:stored,error}=await client.from('page_content').select('image_url,settings_json').eq('id',id).single();
    if(error)return {ok:false,message:'Impossible de vérifier la photo existante. Aucune modification enregistrée.'};
    existing=stored;
   }
   const imageUrl=Object.hasOwn(data,'image_url')&&data.image_url!==undefined?data.image_url as string|null:existing?historyImageSource(existing.settings_json,existing.image_url):historyImageSource(data.settings_json,null);
   // Valider les textes avant de retirer les anciens champs src.
   try{const locales=z.object({fr:z.unknown(),ar:z.unknown()}).parse(data.settings_json);for(const locale of ['fr','ar'] as const)validateDocument('histoire',historyDocumentWithImage(locales[locale],imageUrl));}
   catch{return {ok:false,message:'Le document doit conserver sa structure FR et AR. Corrigez les champs incomplets.'};}
   // Une sauvegarde de texte ne réécrit pas une photo commune déjà enregistrée.
   if((Object.hasOwn(data,'image_url')&&data.image_url!==undefined)||!existing||(!existing.image_url&&imageUrl))data.image_url=imageUrl;
   else delete data.image_url;
   data.settings_json=historyTextDocuments({...existing?.settings_json as Record<string,unknown>,...data.settings_json as Record<string,unknown>},imageUrl);
  }else{
   try{const locales=z.object({fr:z.unknown(),ar:z.unknown()}).parse(data.settings_json);validateDocument(data.page_key as DocumentKey,locales.fr);validateDocument(data.page_key as DocumentKey,locales.ar);}catch{return {ok:false,message:'Le document doit conserver sa structure FR et AR. Corrigez les champs incomplets.'};}
  }
 }
 // Le nom de collection et chaque champ ont été validés par le registre Zod.
 const operation=id?client.from(tableName).update(data as never).eq('id',id):client.from(tableName).insert(data as never);
 const {data:saved,error}=await operation.select('id').single();
 if(error)return {ok:false,message:error.code==='23503'?'Cet élément dépend d’un autre enregistrement. Vérifiez les références.':error.code==='23505'?'Un enregistrement identique existe déjà.':error.code==='23514'?'Les données ne respectent pas les contraintes (scores, totaux, dates ou unicité).':'Enregistrement impossible. Vérifiez les champs obligatoires et vos droits.'};
 invalidate();return {ok:true,message:'Modifications enregistrées dans Supabase.',id:saved?.id};
}
export async function deleteContent(tableName:string,id:string):Promise<MutationResult>{
 const {client}=await requireAdmin();if(!isTable(tableName)||!z.uuid().safeParse(id).success||['site_settings','page_content','homepage_sections'].includes(tableName))return {ok:false,message:'Ce contenu structurel ne peut pas être supprimé. Modifiez son contenu ou sa visibilité.'};
 const {error}=await client.from(tableName).delete().eq('id',id);
 if(error&&tableName==='team_categories')return {ok:false,message:'Catégorie utilisée ou réservée au staff. Réaffectez ses joueurs avant suppression, ou masquez-la.'};
 if(error)return {ok:false,message:'Suppression impossible : cet élément est peut-être encore utilisé.'};
 invalidate();return {ok:true,message:'Élément supprimé. Le fichier média reste disponible dans la médiathèque jusqu’à sa suppression explicite.'};
}
export async function moveContent(tableName:string,id:string,direction:'up'|'down'):Promise<MutationResult>{
 const {client}=await requireAdmin();if(!isTable(tableName)||!['up','down'].includes(direction)||!('fields' in collections[tableName]))return {ok:false,message:'Opération invalide.'};
 // Une RPC transactionnelle protège l'échange des deux rangs.
 const {error}=await client.rpc('move_content',{p_table:tableName,p_id:id,p_direction:direction});
 if(error)return {ok:false,message:'Réorganisation impossible.'};invalidate();return {ok:true,message:'Ordre enregistré.'};
}
