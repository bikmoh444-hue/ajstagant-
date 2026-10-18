'use client';
import { useState, type CSSProperties } from 'react';
import type { Row } from '@/lib/supabase/database';
import { validateDocument, type DocumentKey } from '@/lib/data/documents';
import { historyDocumentWithImage, historyImageSource } from '@/lib/data/history-images';
import { LocaleProvider } from '@/components/ui/locale-provider';
import { HomePage } from '@/components/home/home-page';
import { HistoryPage } from '@/components/history/history-page';
import { PageHero } from '@/components/ui/page-hero';
import { ClubLogo, ClubMedia } from '@/components/ui/club-media';
import { StaffCard } from '@/components/team/staff-card';
import { BureauMemberCard } from '@/components/bureau/bureau-member-card';
import type { SiteContent } from '@/lib/types/site';
import type { HistoryContent, PageHero as PageHeroContent } from '@/lib/types/pages';

export function DraftPreview({table,values,site}:{table:string;values:Record<string,unknown>;site:Row<'site_settings'>|null}){
 const [locale,setLocale]=useState<'fr'|'ar'>('fr');
 const s=table==='site_settings'?{...site,...values}:site;
 const name=String(s?.club_name??'');const nameAr=String(s?.club_name_ar??'');
 const slogan=String((locale==='ar'?s?.slogan_ar:s?.slogan)??'');
 const logo=typeof s?.logo_url==='string'?s.logo_url:null;
 const text=(key:string)=>String(values[`${key}_${locale}`]??values[`${key}_fr`]??'');
 let preview:React.ReactNode;
 if(table==='page_content'&&values.section_key==='config'){
  try{
   const settings=values.settings_json as Record<string,unknown>;
   const localized=settings?.[locale];
   const doc=validateDocument(String(values.page_key) as DocumentKey,values.page_key==='histoire'?historyDocumentWithImage(localized,historyImageSource(settings,values.image_url)):localized);
   if(values.page_key==='home')preview=<HomePage content={{...doc as SiteContent,clubName:locale==='ar'?nameAr:name,logoUrl:logo,slogan}}/>;
   else if(values.page_key==='histoire')preview=<HistoryPage content={doc as HistoryContent} locale={locale} logoUrl={logo} clubName={name} clubNameAr={nameAr} slogan={slogan}/>;
   else if(doc&&typeof doc==='object'&&'hero' in doc)preview=<><PageHero hero={doc.hero as PageHeroContent}/>{'introduction' in doc&&<p>{String(doc.introduction)}</p>}</>;
  }catch{preview=<p>Complétez les champs du document pour afficher son aperçu.</p>;}
 }else if(table==='site_settings'){
  preview=<div className="admin-brand-preview"><ClubLogo url={typeof s?.header_logo_url==='string'?s.header_logo_url:logo}/><h2>{name}</h2><p dir="rtl">{nameAr}</p><p>{slogan}</p><div>Logo principal <ClubLogo url={logo}/></div><div>Footer <ClubLogo url={typeof s?.footer_logo_url==='string'?s.footer_logo_url:logo}/></div>{typeof s?.favicon_url==='string'&&<ClubMedia media={{src:s.favicon_url,alt:'Favicon'}}/>}{typeof s?.seo_image_url==='string'&&<ClubMedia media={{src:s.seo_image_url,alt:'Image de partage'}}/>}</div>;
 }else if(table==='staff_members'||table==='bureau_members'){
  const member={id:'preview',sort_order:0,is_visible:true,is_demo:false,name:String(values.full_name??''),role:text('role'),biography:text('biography'),image:{src:typeof values.photo_url==='string'?values.photo_url:null,alt:String(values.full_name??'')}};
  preview=table==='staff_members'?<StaffCard member={member}/>:<BureauMemberCard member={{...member,nameAr:String(values.full_name_ar??''),nameFr:String(values.full_name_fr??''),roleAr:String(values.role_ar??''),roleFr:String(values.role_fr??''),president:Boolean(values.is_president)}} featured={Boolean(values.is_president)}/>;
 }else{
  const image=values.photo_url??values.image_url??values.logo_url;
  preview=<article>{typeof image==='string'&&image&&<ClubMedia media={{src:image,alt:String(values.full_name??values.title_fr??'Aperçu')}}/>}<h2>{String(values.full_name??values.title_fr??values.name??'')}</h2><dl>{Object.entries(values).filter(([key,value])=>value!=null&&typeof value!=='object'&&!/(photo|image|logo)_url$/.test(key)).map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{typeof value==='boolean'?(value?'Oui':'Non'):String(value)}</dd></div>)}</dl></article>;
 }
 const style={'--royal':s?.primary_color,'--navy':s?.secondary_color,'--yellow':s?.accent_color,'--white':s?.background_color} as CSSProperties;
 return <section className="admin-draft-preview" aria-label="Aperçu avant enregistrement"><h3>Aperçu avant enregistrement</h3><p>Le contenu affiché ici n’est pas publié. Les listes liées se gèrent dans leurs rubriques.</p><div><button type="button" aria-pressed={locale==='fr'} onClick={()=>setLocale('fr')}>Français</button><button type="button" aria-pressed={locale==='ar'} onClick={()=>setLocale('ar')}>العربية</button></div><LocaleProvider locale={locale}><div className="admin-draft-canvas" style={style} dir={locale==='ar'?'rtl':'ltr'} inert>{preview??<p>Aucun aperçu disponible pour ce contenu.</p>}</div></LocaleProvider></section>;
}
