'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { prepareStarterContent } from '@/app/admin/starter-actions';
export function StarterButton(){const [pending,start]=useTransition();const [message,setMessage]=useState('');const router=useRouter();return <section className="admin-starter"><div><h2>Un site prêt à personnaliser</h2><p>Ajoutez les textes de départ, les illustrations, un logo et des fiches exemples. Vos contenus personnalisés sont conservés.</p></div><button className="button primary" disabled={pending} onClick={()=>start(async()=>{try{const result=await prepareStarterContent();setMessage(result.message);router.refresh();}catch{setMessage('Connexion interrompue. Reconnectez-vous puis réessayez.');}})}>{pending?'PRÉPARATION…':'PRÉPARER LE CONTENU'}</button>{message&&<p role="status" className="admin-notice">{message}</p>}</section>;}
