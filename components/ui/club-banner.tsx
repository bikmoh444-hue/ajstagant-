import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ClubLogo } from './club-media';
import type { BannerContent } from '@/lib/types/pages';

export function ClubBanner({ content, logoUrl }: { content: BannerContent; logoUrl: string | null }) {
  return <section className="club-band supporters-band"><div className="container">
    <ClubLogo url={logoUrl} large /><div><p>{content.eyebrow}</p><h2>{content.title}</h2></div>
    <div className="banner-actions">{content.actions.map((action, index) => <Link
      href={action.href} key={action.href} className={`button ${index === 0 ? 'primary' : 'outline'}`}>
      {action.label}<ArrowRight size={16} />
    </Link>)}</div>
  </div></section>;
}
