'use client';
import { useLocale } from '@/components/ui/locale-provider';
import type { ReactNode } from 'react';
import type { PageHero as PageHeroContent, PageStatistic } from '@/lib/types/pages';
import { visibleInOrder } from '@/lib/utils/content';

export function PageHero({ hero, children }: { hero: PageHeroContent; children?: ReactNode }) {
  
  return <section className="inner-hero"><div className="container inner-hero-layout">
    <div><span className="eyebrow">{hero.badge}</span><h1>{hero.title}</h1>
      <p className="inner-hero-subtitle">{hero.subtitle}</p>
      {hero.arabicSubtitle && <p className="inner-hero-arabic" lang="ar" dir="rtl">{hero.arabicSubtitle}</p>}
      {hero.description && <p className="inner-hero-description">{hero.description}</p>}
    </div>{children}
  </div></section>;
}

export function PageStatistics({ statistics, compact = false }: { statistics: PageStatistic[]; compact?: boolean }) {
  const {t}=useLocale();
  return <dl className={`page-statistics ${compact ? 'compact' : ''}`}>
    {visibleInOrder(statistics).map(stat => <div key={stat.id}>
      <dt>{t(stat.label)}</dt><dd>{stat.value ?? t('À confirmer')}</dd>
      {stat.is_demo && stat.value !== null && <small>Donnée de démonstration</small>}
    </div>)}
  </dl>;
}
