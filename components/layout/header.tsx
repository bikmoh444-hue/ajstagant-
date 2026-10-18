'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ClubLogo } from '@/components/ui/club-media';
import { navigation } from '@/lib/data/navigation';
import { LanguageSwitcher } from '@/components/ui/locale-provider';
export function Header({ logoUrl, clubName='A.J.S TAGANT', items=navigation }: { logoUrl: string | null;clubName?:string;items?:{href:string;label:string}[] }) {
  const [open, setOpen] = useState(false); const pathname = usePathname();
  const menuButton=useRef<HTMLButtonElement>(null);
  const header=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menuButton.current?.focus();}};
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!header.current?.contains(event.target))setOpen(false);};
    document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);
    return ()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside);};
  },[open]);
  return <header ref={header} className="site-header"><div className="container header-inner"><Link href="/" className="brand" aria-label={`${clubName} — accueil`}><ClubLogo url={logoUrl} /><span>{clubName}<small>FUTSAL CLUB</small></span></Link><button ref={menuButton} type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}>{open ? <X /> : <Menu />}</button><nav id="main-nav" className={open ? 'navigation open' : 'navigation'} aria-label="Navigation principale">{items.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}</nav><div className="header-end"><LanguageSwitcher/><ClubLogo url={logoUrl} /></div></div></header>;
}
