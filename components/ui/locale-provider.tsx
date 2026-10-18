'use client';
import { createContext, useContext, useTransition } from 'react';
import { setLocale } from '@/app/actions/locale';
import { translate, type Locale } from '@/lib/i18n';
const LocaleContext=createContext<Locale>('fr');
export function LocaleProvider({locale,children}:{locale:Locale;children:React.ReactNode}) {return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;}
export function useLocale(){const locale=useContext(LocaleContext);return {locale,t:(value:string)=>translate(locale,value)};}
export function LanguageSwitcher(){const {locale}=useLocale();const [pending,start]=useTransition();return <div className="languages" aria-label="Langue"><button disabled={pending} aria-pressed={locale==='fr'} onClick={()=>start(()=>setLocale('fr'))}>FR</button><span> / </span><button disabled={pending} aria-pressed={locale==='ar'} onClick={()=>start(()=>setLocale('ar'))} lang="ar">العربية</button></div>;}
