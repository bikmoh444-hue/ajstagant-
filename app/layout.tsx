import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { headers } from 'next/headers';
import './globals.css';
import './interior-pages.css';
import './public-dynamic.css';
import './public-mobile.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getPublicSettings, getPublicNavigation } from '@/lib/data/public-settings';
import { getLocale } from '@/lib/locale';
import { LocaleProvider } from '@/components/ui/locale-provider';
export async function generateMetadata():Promise<Metadata>{
 if((await headers()).get('x-ajt-admin')==='1')return {title:'Administration A.J.S TAGANT',robots:{index:false,follow:false}};
 const s=await getPublicSettings();const locale=await getLocale();
 return {title:{default:s.seo_title??s.club_name,template:`%s | ${s.club_name}`},description:s.seo_description??s.slogan,icons:{icon:`/favicon?v=${encodeURIComponent(s.updated_at)}`},openGraph:{title:s.seo_title??s.club_name,description:s.seo_description??s.slogan,locale:locale==='ar'?'ar_MA':'fr_MA',images:s.seo_image_url?[s.seo_image_url]:undefined}};
}
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 if((await headers()).get('x-ajt-admin')==='1')return <html lang="fr"><body>{children}</body></html>;
 const [s,navigation,locale]=await Promise.all([getPublicSettings(),getPublicNavigation(),getLocale()]);
 const style={'--royal':'#4E6316','--navy':'#35450F','--olive':'#4E6316','--white':'#FFFFFF','--font-title':`'${s.heading_font}',sans-serif`,'--font-body':`'${s.body_font}',sans-serif`} as CSSProperties;
 const footer={clubName:s.club_name,logoUrl:s.footer_logo_url??s.logo_url,footerSettings:{arabicName:s.club_name_ar,slogan:locale==='ar'?s.slogan_ar:s.slogan,copyright:s.footer_text??''},contactInfo:{socials:[['Facebook',s.facebook_url],['Instagram',s.instagram_url],['YouTube',s.youtube_url],['TikTok',s.tiktok_url]].filter(([,url])=>url).map(([label,url])=>({label:label!,url:url!}))}};
 return <html lang={locale} dir={locale==='ar'?'rtl':'ltr'}><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/></head><body style={style}><LocaleProvider locale={locale}><a className="skip-link" href="#main-content">{locale==='ar'?'انتقل إلى المحتوى':'Aller au contenu'}</a><Header logoUrl={s.header_logo_url??s.logo_url} clubName={locale==='ar'?s.club_name_ar:s.club_name} items={navigation}/>{children}<Footer content={footer} items={navigation}/></LocaleProvider></body></html>;
}
