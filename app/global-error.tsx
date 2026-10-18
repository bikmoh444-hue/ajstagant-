'use client';
import Link from 'next/link';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="fr"><body style={{fontFamily:'Arial,sans-serif',background:'#F5F5F5',color:'#101A49',padding:'8vw'}}><h1>Site temporairement indisponible</h1><p>Les contenus ne peuvent pas être chargés. L’équipe du site peut vérifier la connexion et l’installation de la base de données.</p><button onClick={reset}>Réessayer</button><p><Link href="/admin/login">Accès administration</Link></p></body></html>;}
