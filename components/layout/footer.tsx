import Link from 'next/link';
import { ClubLogo } from '@/components/ui/club-media';
import { navigation } from '@/lib/data/navigation';
import type { SiteContent } from '@/lib/types/site';
type FooterContent=Pick<SiteContent,'logoUrl'|'footerSettings'|'clubName'> & {contactInfo:Pick<SiteContent['contactInfo'],'socials'>};
export function Footer({content,items=navigation}:{content:FooterContent;items?:{href:string;label:string}[]}){return <footer className="site-footer"><div className="container"><ClubLogo url={content.logoUrl} large/><h2>{content.clubName??'A.J.S TAGANT'}</h2><p className="arabic" lang="ar" dir="rtl">{content.footerSettings.arabicName}</p><p>{content.footerSettings.slogan}</p><nav aria-label="Navigation de pied de page">{items.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>{content.contactInfo.socials.length>0&&<div className="socials">{content.contactInfo.socials.map(social=><a href={social.url} key={social.label} rel="noopener noreferrer" target="_blank">{social.label}</a>)}</div>}<div className="copyright">© {new Date().getFullYear()} {content.footerSettings.copyright}</div></div></footer>;}
