'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="admin-notice" role="alert"><h2>Administration temporairement indisponible</h2><p>Vérifiez la connexion Supabase, les migrations et les permissions du compte. Aucune modification n’a été confirmée.</p><button className="button primary" onClick={reset}>Réessayer</button></div>;}
