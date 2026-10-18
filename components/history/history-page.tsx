import Link from 'next/link';
import { Goal, ShieldCheck, Target, HeartHandshake, Heart, ArrowRight, FileText } from 'lucide-react';
import { PageHero } from '@/components/ui/page-hero';
import { SectionHeading } from '@/components/ui/section-heading';
import { ClubLogo, ClubMedia } from '@/components/ui/club-media';
import { HistoryTimeline } from './history-timeline';
import { HistoryGallery } from './history-gallery';
import { visibleInOrder } from '@/lib/utils/content';
import type { HistoryContent } from '@/lib/types/pages';
import './history-content.css';
import {translate,type Locale} from '@/lib/i18n';
import {historyPresentation} from '@/lib/data/history-presentation';

const icons = { respect: ShieldCheck, rigor: Target, solidarity: HeartHandshake, passion: Heart };

export function HistoryPage({ content, logoUrl, clubName, clubNameAr, slogan, locale='fr' }: { content: HistoryContent; logoUrl: string | null; clubName:string; clubNameAr:string; slogan:string; locale?:Locale }) {
  const c=historyPresentation(content,locale);
  const t=(text:string)=>translate(locale,text);
  if (!c.is_visible) return <main id="main-content" className="container pending-page"><h1>Notre histoire</h1><p>Le récit du club sera publié prochainement.</p></main>;
  return <main id="main-content" className="history-page" lang={locale} dir={locale==='ar'?'rtl':'ltr'}>
    <PageHero hero={c.hero}><aside className="history-sports-note"><Goal size={42} /><h2>{c.sportsNote.title}</h2><p>{c.sportsNote.text}</p></aside></PageHero>
    <section className="section"><div className="container history-origin"><div>
      <h2 className="inner-section-title">{c.originTitle}</h2>
      {c.paragraphs.map((paragraph, index) => <p key={index} className="body-copy">{paragraph}</p>)}
      {c.quote && <blockquote>{c.quote}</blockquote>}
    </div><figure><ClubMedia media={c.image} placeholderLabel={t('Photo officielle à fournir')} />{c.image.caption && <figcaption>{t(c.image.caption)}</figcaption>}</figure></div></section>
    {(c.vision?.title || c.mission?.title) && <section className="section muted"><div className="container history-vision-mission">{[c.vision,c.mission].map((item,index)=>item?.title && <article key={index}><h2 className="inner-section-title">{item.title}</h2><p className="body-copy">{item.description}</p></article>)}</div></section>}
    {visibleInOrder(c.steps).length > 0 && <section className="section muted"><div className="container"><SectionHeading title={c.timelineTitle} /><HistoryTimeline steps={c.steps} /></div></section>}
    {visibleInOrder(c.gallery).length > 0 && <section className="section"><div className="container"><SectionHeading title={c.galleryTitle} /><HistoryGallery images={c.gallery} locale={locale} /></div></section>}
    <section className="section history-values"><div className="container"><SectionHeading title={c.valuesTitle} light />
      <div className="values-grid">{visibleInOrder(c.values).map(value => { const Icon = icons[value.icon]; return <article key={value.id}><Icon size={32} /><h3>{value.title}</h3><p>{value.description}</p></article>; })}</div>
    </div></section>
    <section className="section"><div className="container history-future"><div><h2 className="inner-section-title">{c.future.title}</h2><p className="body-copy">{c.future.text}</p><div className="future-actions">
      <Link href={c.future.joinUrl??'/#contact'} className="button primary">{c.future.joinLabel??'REJOINDRE L’ASSOCIATION'} <ArrowRight size={16} /></Link>
      {c.future.statutes_url ? <a href={c.future.statutes_url} className="button royal">{c.future.statutesLabel??'CONSULTER LES STATUTS'} <FileText size={16} /></a> : <div><small className="unavailable-note">{c.future.unavailableLabel??'Document officiel à fournir'}</small></div>}
    </div></div><div className="history-club-card"><ClubLogo url={logoUrl} large /><h3>{clubName}</h3><p lang="ar" dir="rtl">{clubNameAr}</p><span>{slogan}</span></div></div></section>
  </main>;
}
