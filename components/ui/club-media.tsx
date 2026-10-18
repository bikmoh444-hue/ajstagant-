import Image from 'next/image';
import { Camera, Shield } from 'lucide-react';
import type { Media } from '@/lib/types/site';
import { canOptimizeImage } from '@/lib/utils/images';
export function ClubLogo({ url, large = false }: { url: string | null; large?: boolean }) {
  return <span className={`club-logo ${large ? 'large' : ''}`}>{url ? <Image src={url} alt="Logo officiel A.J.S TAGANT" unoptimized={!canOptimizeImage(url)} fill sizes={large ? '100px' : '48px'} /> : <Shield aria-label="Emplacement du logo officiel" />}</span>;
}
export function ClubMedia({ media, className = '', priority = false, placeholderLabel='Photo officielle à fournir' }: { media: Media; className?: string; priority?: boolean; placeholderLabel?:string }) {
  return <div className={`club-media ${className}`}>{media.src ? <Image src={media.src} alt={media.alt} unoptimized={!canOptimizeImage(media.src)} fill sizes={priority?'100vw':'(max-width: 640px) 100vw, 50vw'} quality={85} priority={priority} /> : <div className="media-placeholder"><Camera size={30} /><span>{placeholderLabel}</span></div>}</div>;
}
