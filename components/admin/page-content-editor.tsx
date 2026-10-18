'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveContent } from '@/app/admin/actions';
import { documentTemplates, validateDocument, type DocumentKey } from '@/lib/data/documents';
import type { Row } from '@/lib/supabase/database';
import { JsonEditor } from './json-editor';
import { LazyDraftPreview as DraftPreview } from './lazy-draft-preview';
import { MediaField } from './media-field';
import { historyImageSource, historyTextDocuments } from '@/lib/data/history-images';
import { historyPresentation } from '@/lib/data/history-presentation';
import type { HistoryContent } from '@/lib/types/pages';
import type { AdminRecord } from './collection-manager';

const hidden=['id','sort_order','is_demo','is_visible','clubName','logoUrl','slogan','featuredPlayers','galleryImages','bureauMembers','objectives','contactInfo','footerSettings','sections','steps','gallery','values','players','staff','categories','images','members','seasons','competitions','teams','matches','standings','trophies','club_team_id','default_season_id','default_competition_id','association_name','locality','phone','email','facebook_url','instagram_url','whatsapp_url','map_url'];
const homeGroups=[{label:'Grande bannière',keys:['heroTitle','heroSubtitle','heroImageUrl']},{label:'Présentation et photo',keys:['introduction','facts','aboutImage']},{label:'Histoire et photo',keys:['historyContent','historyImage']},{label:'Titres et boutons',keys:['copy']}];
function initial(row:AdminRecord){const raw=row.settings_json as Record<string,unknown>;try{return {...raw,fr:validateDocument(row.page_key as DocumentKey,row.page_key==='histoire'?historyPresentation(raw.fr as HistoryContent,'fr'):raw.fr),ar:validateDocument(row.page_key as DocumentKey,row.page_key==='histoire'?historyPresentation(raw.ar as HistoryContent,'ar'):raw.ar)} as Record<string,Record<string,unknown>>;}catch{return structuredClone(raw) as Record<string,Record<string,unknown>>;}}

function imageTexts(value:unknown){const next={...value as Record<string,unknown>};delete next.src;return next;}

export function PageContentEditor({row,site}:{row:AdminRecord;site:Row<'site_settings'>|null}){
 const router=useRouter();const [documents,setDocuments]=useState(()=>initial(row));const [locale,setLocale]=useState<'fr'|'ar'>('fr');const [group,setGroup]=useState(0);const [notice,setNotice]=useState('');const [preview,setPreview]=useState(false);const [visible,setVisible]=useState(row.is_visible!==false);const [pending,start]=useTransition();
 const [sharedImage,setSharedImage]=useState(()=>historyImageSource(row.settings_json,row.image_url));
 const [imageChanged,setImageChanged]=useState(false);
 const isHistory=row.page_key==='histoire';
 const doc=documents[locale]??{};const isHome=row.page_key==='home';
 const keys=isHome?homeGroups[group].keys:Object.keys(doc).filter(key=>!hidden.includes(key)&&(!isHistory||key!=='statistics'));
 return <section className="admin-collection admin-page-editor"><div className="admin-section-top"><div><h2>Textes et photos</h2><p>Modifiez vos contenus, puis cliquez sur Enregistrer.</p></div><div className="admin-language-tabs"><button type="button" aria-pressed={locale==='fr'} onClick={()=>setLocale('fr')}>Français</button><button type="button" aria-pressed={locale==='ar'} onClick={()=>setLocale('ar')}>العربية</button></div></div>
 {isHome&&<div className="admin-content-tabs">{homeGroups.map((item,index)=><button type="button" key={item.label} aria-pressed={index===group} onClick={()=>setGroup(index)}>{item.label}</button>)}</div>}
 <form onSubmit={event=>{event.preventDefault();setNotice('');start(async()=>{try{const next=structuredClone(documents);for(const language of ['fr','ar'])if('is_visible' in next[language])next[language].is_visible=visible;const result=await saveContent('page_content',row.id,{page_key:row.page_key,section_key:'config',settings_json:next,...(isHistory&&imageChanged?{image_url:sharedImage}:{}),is_visible:visible});setNotice(result.message);if(result.ok){setImageChanged(false);router.refresh();}}catch{setNotice('Enregistrement interrompu. Vérifiez votre connexion et votre session.');}});}}><fieldset disabled={pending}>{isHistory&&<div className="admin-field"><h3>Photo commune FR / AR</h3><p>Cette photo reste identique dans les deux langues. Les textes alternatifs et les légendes se modifient dans chaque onglet.</p><MediaField value={sharedImage??''} onChange={value=>{setSharedImage(value||null);setImageChanged(true);}} bucket="club-assets"/></div>}<div dir={locale==='ar'?'rtl':'ltr'} className="admin-page-fields">{keys.filter(key=>key in doc).map(key=><JsonEditor key={`${locale}-${key}`} name={key} value={isHistory&&key==='image'?imageTexts(doc[key]):doc[key]} template={(documentTemplates[row.page_key as DocumentKey] as unknown as Record<string,unknown>)[key]} onChange={value=>setDocuments(old=>({...old,[locale]:{...old[locale],[key]:isHistory&&key==='image'?{...old[locale][key] as Record<string,unknown>,...value as Record<string,unknown>}:value}}))}/>)}</div><label className="admin-checkbox"><input type="checkbox" checked={visible} onChange={event=>setVisible(event.target.checked)}/>Page publiée</label><div className="admin-editor-actions"><button className="button primary" type="submit">{pending?'ENREGISTREMENT…':'ENREGISTRER'}</button><button type="button" onClick={()=>setPreview(!preview)}>{preview?'Fermer l’aperçu':'Aperçu'}</button></div></fieldset></form>
 {notice&&<p role="status" className="admin-notice">{notice}</p>}{preview&&<DraftPreview table="page_content" values={{...row,settings_json:isHistory?historyTextDocuments(documents,sharedImage):documents,...(isHistory?{image_url:sharedImage}:{}),is_visible:visible}} site={site}/>}
 </section>;
}
