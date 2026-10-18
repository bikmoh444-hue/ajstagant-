import type { GalleryItem } from '@/lib/types/pages';
import { visibleInOrder } from '@/lib/utils/content';
import { ClubMedia } from '@/components/ui/club-media';
import {translate,type Locale} from '@/lib/i18n';

export function HistoryGallery({ images,locale='fr' }: { images: GalleryItem[];locale?:Locale }) {
  return <div className="history-gallery">{visibleInOrder(images).map(item => <figure key={item.id}>
    <ClubMedia media={item.image} placeholderLabel={translate(locale,'Photo officielle à fournir')} /><figcaption>{item.title}{item.is_demo && <small>{translate(locale,'Archive à fournir')}</small>}</figcaption>
  </figure>)}</div>;
}
