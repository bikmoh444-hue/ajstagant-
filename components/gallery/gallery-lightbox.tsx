'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '@/lib/types/pages';
import { formatGalleryDate } from '@/lib/utils/content';
import { canOptimizeImage } from '@/lib/utils/images';

export function GalleryLightbox({ images, activeId, onClose, onNavigate }: {
  images: GalleryItem[]; activeId: string; onClose: () => void; onNavigate: (id: string) => void;
}) {
  const {locale,t}=useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const index = images.findIndex(item => item.id === activeId);
  const item = images[index];
  const navigate = useCallback((direction: number) => {
    if (images.length < 2) return;
    onNavigate(images[(index + direction + images.length) % images.length].id);
  }, [images, index, onNavigate]);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    if (element && !element.open) element.showModal();
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);

  if (!item) return null;
  const date = formatGalleryDate(item.date,locale);
  return <dialog ref={dialog} className="gallery-lightbox" aria-labelledby="lightbox-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
    }}>
    <div className="lightbox-toolbar"><span aria-live="polite">{index + 1} / {images.length}</span><button ref={closeButton} type="button" onClick={onClose} aria-label={t('Fermer la photo')}><X /></button></div>
    <div className="lightbox-main"><button type="button" disabled={images.length < 2} onClick={() => navigate(-1)} aria-label={t('Photo précédente')}><ChevronLeft /></button>
      <figure><div className="lightbox-image">{item.image.src ? <Image src={item.image.src} alt={item.image.alt} unoptimized={!canOptimizeImage(item.image.src)} fill sizes="(max-width: 640px) 100vw, 85vw" /> : <div className="lightbox-placeholder"><Camera size={48} /><p>{t('Photographie officielle à fournir')}</p></div>}</div>
        <figcaption aria-live="polite"><h2 id="lightbox-title">{item.title}</h2>{date && <time dateTime={item.date ?? undefined}>{date}</time>}{item.description && <p>{item.description}</p>}{item.is_demo && <span className="demo-label">Contenu de démonstration</span>}</figcaption>
      </figure>
      <button type="button" disabled={images.length < 2} onClick={() => navigate(1)} aria-label={t('Photo suivante')}><ChevronRight /></button>
    </div>
  </dialog>;
}
