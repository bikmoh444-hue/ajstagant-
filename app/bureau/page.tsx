import { getPageMetadata } from '@/lib/data/metadata';
import { PageHero } from '@/components/ui/page-hero';
import { BureauMembers } from '@/components/bureau/bureau-members';
import { getBureauContent } from '@/lib/data/repository';
import { visibleInOrder } from '@/lib/utils/content';

export async function generateMetadata(){return getPageMetadata('bureau');}

export default async function Page() {
  const content = await getBureauContent();
  const members = visibleInOrder(content.members);
  return <main id="main-content" className="directors-page"><PageHero hero={content.hero} />
    <section className="section muted"><div className="container"><p className="directors-introduction">{content.introduction}</p>
      <BureauMembers members={members} />
      {!members.length && <p className="empty-state">La composition du bureau sera publiée prochainement.</p>}
    </div></section>
  </main>;
}
