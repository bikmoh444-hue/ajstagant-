'use client';
import { useState } from 'react';
import Image from 'next/image';
import { uploadMedia } from '@/app/admin/media-actions';
export function MediaField({value,onChange,bucket}:{value:string;onChange:(value:string)=>void;bucket:string}){
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');
 return <div className="admin-media-field">{value&&<Image src={value} alt="Aperçu du média" width={140} height={100} unoptimized/>}<input aria-label="URL du média" type="text" value={value} onChange={event=>onChange(event.target.value)}/><label className="admin-file-button">{busy?'TÉLÉCHARGEMENT…':'TÉLÉCHARGER / REMPLACER'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/x-icon" disabled={busy} onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setBusy(true);try{const form=new FormData();form.set('bucket',bucket);form.set('file',file);const result=await uploadMedia(form);setNotice(result.message);if(result.ok&&result.url)onChange(result.url);}catch{setNotice('Téléchargement interrompu. Vérifiez votre session.');}finally{setBusy(false);event.target.value='';}}}/></label>{notice&&<small role="status">{notice}</small>}</div>;
}
