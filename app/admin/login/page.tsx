import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { getAdmin } from '@/lib/admin/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
export default async function Page({searchParams}:{searchParams:Promise<{reason?:string}>}){if(await getAdmin())redirect('/admin');const {reason}=await searchParams;const notice=reason==='expired-link'?'Ce lien est invalide ou a expiré. Demandez une nouvelle invitation.':reason==='session'?'Connectez-vous avec un compte administrateur autorisé.':null;return <main id="main-content" className="admin-login"><div><span className="eyebrow">A.J.S TAGANT · ADMINISTRATION</span><h1>Connexion</h1><p>Accès réservé aux administrateurs autorisés.</p>{!isSupabaseConfigured()&&<p className="admin-notice">Configuration requise : appliquer les migrations et renseigner .env.local. Aucun compte de démonstration n’est créé.</p>}{notice&&<p className="admin-notice" role="status">{notice}</p>}<LoginForm/><Link href="/">← Retour au site</Link></div></main>;}
