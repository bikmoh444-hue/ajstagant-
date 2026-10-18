import './team.css';
﻿import { getPageMetadata } from '@/lib/data/metadata';
import { getPublicSettings } from '@/lib/data/public-settings';
import { PageHero, PageStatistics } from '@/components/ui/page-hero';
import { ClubBanner } from '@/components/ui/club-banner';
import { TeamRoster } from '@/components/team/team-roster';
import { getTeamContent } from '@/lib/data/repository';

export async function generateMetadata(){return getPageMetadata('equipe');}

export default async function Page() {
  const [content, site] = await Promise.all([getTeamContent(),getPublicSettings()]);
  return <main id="main-content" className="team-page">
    <PageHero hero={content.hero}><PageStatistics statistics={content.statistics} compact /></PageHero>
    <TeamRoster categories={content.categories} players={content.players} staff={content.staff} staffTitle={content.staffTitle} logoUrl={site.logo_url} />
    <ClubBanner content={content.banner} logoUrl={site.logo_url} />
  </main>;
}
