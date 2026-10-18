'use client';
import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { setPassword } from '@/app/admin/set-password/actions';

export function PasswordForm(){
 const [message,action,pending]=useActionState(setPassword,'');
 const [ready,setReady]=useState(false);const [sessionError,setSessionError]=useState('');
 useEffect(()=>{
  let mounted=true;
  async function prepare(){
   try {
    const hash=new URLSearchParams(window.location.hash.slice(1));
    const access_token=hash.get('access_token'),refresh_token=hash.get('refresh_token');
    window.history.replaceState(null,'',window.location.pathname);
    if(hash.has('error')||hash.has('error_code'))throw new Error('invalid-link');
    const client=createClient();
    if(access_token&&refresh_token){const {error}=await client.auth.setSession({access_token,refresh_token});if(error)throw error;}
    const {data:{user},error}=await client.auth.getUser();
    if(error||!user)throw new Error('expired-session');
    if(mounted)setReady(true);
   } catch {if(mounted)setSessionError('Ce lien est invalide, expiré ou le service Auth est indisponible. Demandez une nouvelle invitation si nécessaire.');}
  }
  void prepare();return ()=>{mounted=false;};
 },[]);
 return <main id="main-content" className="admin-login"><div><h1>Définir votre mot de passe</h1>
 {sessionError?<p role="alert">{sessionError}</p>:!ready?<p role="status">Vérification du lien…</p>:<form action={action}><label>Nouveau mot de passe<input name="password" type="password" minLength={12} maxLength={200} autoComplete="new-password" required/></label><button className="button primary" disabled={pending}>{pending?'ENREGISTREMENT…':'ENREGISTRER'}</button>{message&&<p role="alert">{message}</p>}</form>}
 <Link href="/admin/login">Retour à la connexion</Link></div></main>;
}
