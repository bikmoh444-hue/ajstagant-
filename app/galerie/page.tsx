import { getPageMetadata } from '@/lib/data/metadata';
import { PageHero } from '@/components/ui/page-hero';
import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { getGalleryContent } from '@/lib/data/repository';

export async function generateMetadata(){return getPageMetadata('galerie');}

export default async function Page({ searchParams }: { searchParams: Promise<{ categorie?: string | string[] }> }) {
  const [content, params] = await Promise.all([getGalleryContent(), searchParams]);
  return <main id="main-content" className="gallery-page"><PageHero hero={content.hero} />
    <section className="section muted"><div className="container"><GalleryGrid key={typeof params.categorie === 'string' ? params.categorie : 'all'} images={content.images} categories={content.categories} pageSize={content.pageSize} initialCategory={typeof params.categorie === 'string' ? params.categorie : undefined} /></div></section>
  </main>;
}
