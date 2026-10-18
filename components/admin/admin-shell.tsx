'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, ExternalLink, LogOut } from 'lucide-react';
import { ClubLogo } from '@/components/ui/club-media';
import { adminPages } from '@/lib/admin/pages';
import { logoutAction } from '@/app/admin/actions';
import type { AdminRole } from '@/lib/admin/types';

export function AdminShell({children,name,logo,role,email}:{children:React.ReactNode;name:string;logo:string|null;role:AdminRole;email:string}){
 const path=usePathname();const [open,setOpen]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menuButton.current?.focus();}};document.addEventListener('keydown',close);return ()=>document.removeEventListener('keydown',close);},[open]);
 const menu=[{href:'/admin',label:'Mon site'},...Object.entries(adminPages).map(([key,item])=>({href:`/admin/${key}`,label:item.title}))];
 const title=menu.find(item=>item.href===path)?.label??'Administration';
 return <div className="admin-shell"><button ref={menuButton} type="button" aria-controls="admin-navigation" className="admin-mobile-menu" aria-label={open?'Fermer le menu admin':'Ouvrir le menu admin'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
 <aside id="admin-navigation" className={`admin-sidebar ${open?'open':''}`}><Link href="/admin" className="admin-brand"><ClubLogo url={logo}/><span>{name}<small>MON ESPACE ADMIN</small></span></Link><nav aria-label="Administration">{menu.map(item=><Link href={item.href} key={item.href} aria-current={path===item.href?'page':undefined} onClick={()=>setOpen(false)}>{item.label}</Link>)}</nav>{role==='super_admin'&&<details className="admin-access-menu"><summary>Gérer les accès</summary><Link href="/admin/administrateurs">Administrateurs</Link></details>}</aside>
 {open&&<button className="admin-backdrop" aria-label="Fermer la navigation" onClick={()=>setOpen(false)}/>}
 <div className="admin-workspace"><header className="admin-header"><h1>{title}</h1><div><Link href="/" target="_blank"><ExternalLink size={16}/>Voir le site</Link><span className="admin-account">{email}<small>{role}</small></span><form action={logoutAction}><button title="Déconnexion" aria-label="Déconnexion"><LogOut size={18}/></button></form></div></header><main id="main-content" className="admin-main">{children}</main></div></div>;
}
