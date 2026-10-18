'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import type { MutationResult } from '@/lib/admin/types';
const buckets=['club-assets','players','gallery','staff','bureau','match-assets'];
function imageFormat(bytes:Uint8Array):{mime:string;extension:string}|null {
 const hex=Buffer.from(bytes.subarray(0,16)).toString('hex');
 if(hex.startsWith('89504e470d0a1a0a'))return {mime:'image/png',extension:'png'};
 if(hex.startsWith('ffd8ff'))return {mime:'image/jpeg',extension:'jpg'};
 if(Buffer.from(bytes.subarray(0,4)).toString()==='RIFF'&&Buffer.from(bytes.subarray(8,12)).toString()==='WEBP')return {mime:'image/webp',extension:'webp'};
 if(Buffer.from(bytes.subarray(4,12)).toString()==='ftypavif')return {mime:'image/avif',extension:'avif'};
 if(hex.startsWith('00000100'))return {mime:'image/x-icon',extension:'ico'};
 return null;
}
export async function uploadMedia(form:FormData):Promise<MutationResult>{
 const {client,user}=await requireAdmin();const bucket=String(form.get('bucket')??'');const file=form.get('file');
 if(!buckets.includes(bucket)||!(file instanceof File)||file.size===0||file.size>5242880)return {ok:false,message:'Image requise, 5 Mo maximum.'};
 const bytes=new Uint8Array(await file.arrayBuffer());const format=imageFormat(bytes);
 if(!format)return {ok:false,message:'Format refusé. Utilisez PNG, JPEG, WebP, AVIF ou ICO. Les SVG ne sont pas acceptés.'};
 if(file.type&&file.type!==format.mime&&!(format.extension==='ico'&&file.type==='image/vnd.microsoft.icon'))return {ok:false,message:'Le contenu du fichier ne correspond pas au format annoncé.'};
 const objectPath=`${user.id}/${randomUUID()}.${format.extension}`;
 const {error}=await client.storage.from(bucket).upload(objectPath,bytes,{contentType:format.mime,upsert:false,cacheControl:'31536000'});
 if(error)return {ok:false,message:'Téléchargement impossible. Vérifiez les politiques Storage.'};
 const {data:{publicUrl}}=client.storage.from(bucket).getPublicUrl(objectPath);
 const {error:metadataError}=await client.from('media_assets').insert({bucket_id:bucket,object_path:objectPath,public_url:publicUrl,mime_type:format.mime,size_bytes:file.size,created_by:user.id});
 if(metadataError){await client.storage.from(bucket).remove([objectPath]);return {ok:false,message:'Le média n’a pas pu être référencé.'};}
 revalidatePath('/admin','layout');return {ok:true,message:'Image enregistrée dans Supabase Storage. Enregistrez le formulaire pour la publier.',url:publicUrl};
}
export async function deleteMedia(id:string):Promise<MutationResult>{
 const {client}=await requireAdmin();if(!z.uuid().safeParse(id).success)return {ok:false,message:'Identifiant invalide.'};
 const {data:asset,error}=await client.from('media_assets').select('*').eq('id',id).single();
 if(error||!asset)return {ok:false,message:'Média introuvable.'};
 const {data:referenced,error:checkError}=await client.rpc('media_is_referenced',{p_url:asset.public_url});
 if(checkError||referenced)return {ok:false,message:'Ce média est utilisé. Remplacez ou retirez ses références puis enregistrez avant de le supprimer.'};
 const {error:removeError}=await client.storage.from(asset.bucket_id).remove([asset.object_path]);
 if(removeError)return {ok:false,message:'Suppression Storage refusée.'};
 const {error:rowError}=await client.from('media_assets').delete().eq('id',id);
 if(rowError)return {ok:false,message:'Fichier supprimé ; sa référence doit être nettoyée dans la médiathèque.'};
 revalidatePath('/','layout');return {ok:true,message:'Média supprimé.'};
}
