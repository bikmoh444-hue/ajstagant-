'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { useMemo, useState } from 'react';
import { Expand, Plus } from 'lucide-react';
import { ClubMedia } from '@/components/ui/club-media';
import { GalleryLightbox } from './gallery-lightbox';
import { formatGalleryDate, visibleInOrder } from '@/lib/utils/content';
import type { GalleryCategory, GalleryItem } from '@/lib/types/pages';

export function GalleryGrid({ images, categories, pageSize = 9, initialCategory = 'all' }: {
  images: GalleryItem[]; categories: GalleryCategory[]; pageSize?: number; initialCategory?: string;
}) {
  const {locale,t}=useLocale();
  const orderedCategories = useMemo(() => visibleInOrder(categories), [categories]);
  const [selected, setSelected] = useState(orderedCategories.some(category => category.id === initialCategory) ? initialCategory : 'all');
  const batchSize = Math.max(1, Math.floor(pageSize) || 9);
  const [limit, setLimit] = useState(batchSize);
  const [activeId, setActiveId] = useState<string | null>(null);
  const filtered = useMemo(() => visibleInOrder(images).filter(item =>
    orderedCategories.some(category => category.id === item.category_id) && (selected === 'all' || item.category_id === selected),
  ), [images, orderedCategories, selected]);
  const displayed = filtered.slice(0, limit);
  return <>
    <div className="player-filters gallery-filters" role="group" aria-label="Filtrer les photos par catégorie">
      {[{ id: 'all', label: 'Toutes' }, ...orderedCategories].map(category => <button key={category.id} type="button" aria-pressed={selected === category.id} onClick={() => { setSelected(category.id); setLimit(batchSize); }}>{t(category.label)}</button>)}
    </div>
    <p className="filter-result" role="status">{locale==='ar'?`${displayed.length} من ${filtered.length} صورة`:`${displayed.length} sur ${filtered.length} photos`}</p>
    {displayed.length ? <div className="photo-grid">{displayed.map(item => {
      const date = formatGalleryDate(item.date,locale);
      return <article className="photo-card" key={item.id}>
        <button type="button" className="photo-open" aria-label={`Agrandir : ${item.title}`} aria-haspopup="dialog" onClick={() => setActiveId(item.id)}><ClubMedia media={item.image} /><span className="photo-expand"><Expand size={18} /></span></button>
        <div className="photo-caption"><span className="photo-category">{orderedCategories.find(category => category.id === item.category_id)?.label}</span><h2>{item.title}</h2>
          {date && <time dateTime={item.date ?? undefined}>{date}</time>}{item.description && <p>{item.description}</p>}
          {item.is_demo && <span className="demo-label">Photo de démonstration à remplacer</span>}
        </div>
      </article>;
    })}</div> : <p className="empty-state">{t('Aucune photographie publiée dans cette catégorie.')}</p>}
    {displayed.length < filtered.length && <div className="center-action"><button type="button" className="button primary" onClick={() => setLimit(current => current + batchSize)}>{t('VOIR PLUS')} <Plus size={16} /></button></div>}
    {activeId && <GalleryLightbox images={displayed} activeId={activeId} onClose={() => setActiveId(null)} onNavigate={setActiveId} />}
  </>;
}
