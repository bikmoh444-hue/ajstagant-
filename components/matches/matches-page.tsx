'use client';
import { useState } from 'react';
import { useLocale } from '@/components/ui/locale-provider';
import Link from 'next/link';
import { ArrowRight, Trophy as TrophyIcon } from 'lucide-react';
import { PageHero, PageStatistics } from '@/components/ui/page-hero';
import { SectionHeading } from '@/components/ui/section-heading';
import { MatchCard } from './match-card';
import { MatchResults } from './match-results';
import { StandingsTable } from './standings-table';
import { TrophySymbol } from './trophy-icon';
import { visibleInOrder } from '@/lib/utils/content';
import { goalDifference, signedNumber } from '@/lib/utils/sports';
import type { SportsContent } from '@/lib/types/sports';

export function MatchesPage({ content: c }: { content: SportsContent }) {
  const {t}=useLocale();
  const seasons = visibleInOrder(c.seasons);
  const allCompetitions = visibleInOrder(c.competitions);
  const teams = visibleInOrder(c.teams);
  const [seasonId, setSeasonId] = useState(seasons.find(item => item.id === c.default_season_id)?.id ?? seasons[0]?.id ?? '');
  const competitions=allCompetitions.filter(item=>!item.season_id||item.season_id===seasonId);
  const [selectedCompetition, setSelectedCompetition] = useState(allCompetitions.find(item => item.id === c.default_competition_id)?.id ?? allCompetitions[0]?.id ?? '');
  const competitionId=competitions.some(item=>item.id===selectedCompetition)?selectedCompetition:competitions[0]?.id??'';
  const setCompetitionId=setSelectedCompetition;
  const competition = competitions.find(item => item.id === competitionId);
  const rows = visibleInOrder(c.standings).filter(row => row.season_id === seasonId && row.competition_id === competitionId && teams.some(team => team.id === row.team_id));
  const clubRow = rows.find(row => row.team_id === c.club_team_id);
  const matches = visibleInOrder(c.matches).filter(match => match.season_id === seasonId && match.competition_id === competitionId &&
    (match.home_team_id === c.club_team_id || match.away_team_id === c.club_team_id) &&
    teams.some(team => team.id === match.home_team_id) && teams.some(team => team.id === match.away_team_id));
  const upcoming = matches.filter(match => match.status === 'live' || (match.status === 'scheduled' && (match.is_demo || Boolean(match.kickoff_at && Date.parse(match.kickoff_at)>=Date.now())))).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
    if(Boolean(a.is_featured)!==Boolean(b.is_featured))return a.is_featured?-1:1;
    return (a.kickoff_at ? Date.parse(a.kickoff_at) : Infinity) - (b.kickoff_at ? Date.parse(b.kickoff_at) : Infinity) || a.sort_order - b.sort_order;
  });
  const results = matches.filter(match => ['finished', 'postponed', 'cancelled'].includes(match.status)).sort((a, b) =>
    (b.kickoff_at ? Date.parse(b.kickoff_at) : -Infinity) - (a.kickoff_at ? Date.parse(a.kickoff_at) : -Infinity) || a.sort_order - b.sort_order);
  const trophies = visibleInOrder(c.trophies).filter(item => (!item.season_id||item.season_id === seasonId) && (!item.competition_id||item.competition_id === competitionId));
  const demo = competition?.is_demo || seasons.find(item => item.id === seasonId)?.is_demo;
  const heroStats = [
    { label: 'Rang actuel', value: clubRow ? String(clubRow.rank) : null },
    { label: 'Points', value: clubRow ? String(clubRow.points) : null },
    { label: 'Différence de buts', value: clubRow ? signedNumber(goalDifference(clubRow)) : null },
  ].map((stat, index) => ({ ...stat, id: `standing-stat-${index}`, sort_order: index, is_visible: true, is_demo: clubRow?.is_demo ?? false }));

  return <main id="main-content" className="matches-page">
    <PageHero hero={{ ...c.hero, badge: competition?.name ?? c.hero.badge, subtitle: competition?.subtitle ?? c.hero.subtitle }}><PageStatistics statistics={heroStats} compact /></PageHero>
    <nav className="match-section-nav" aria-label="Sections des matchs"><div className="container">{[
      ['prochains-matchs', 'Prochains matchs'], ['derniers-resultats', 'Derniers résultats'], ['classement', 'Classement officiel'], ['palmares', 'Palmarès & effectif'],
    ].map(([id, label]) => <a href={`#${id}`} key={id}>{t(label)}</a>)}</div></nav>
    <div className="container sports-controls"><div className="sports-selectors"><label>{t('Saison')}<select value={seasonId} onChange={event => setSeasonId(event.target.value)} disabled={!seasons.length}>{!seasons.length && <option value="">Aucune saison publiée</option>}{seasons.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{t('Compétition')}<select value={competitionId} onChange={event => setCompetitionId(event.target.value)} disabled={!competitions.length}>{!competitions.length && <option value="">Aucune compétition publiée</option>}{competitions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      <p className="sports-data-notice" role="status">{demo ? 'Données de démonstration : les rencontres et scores ci-dessous ne sont pas officiels.' : 'Calendrier et classement renseignés par le club.'}</p>
    </div>
    <section id="prochains-matchs" className="section fixtures-section"><div className="container"><SectionHeading title={t('PROCHAINS MATCHS')} />
      {upcoming[0] ? <><MatchCard match={upcoming[0]} teams={teams} clubId={c.club_team_id} timezone={c.timezone} featured /><div className="compact-fixtures">{upcoming.slice(1, 4).map(match => <MatchCard key={match.id} match={match} teams={teams} clubId={c.club_team_id} timezone={c.timezone} />)}</div></> : <p className="sports-empty">Le calendrier des prochaines rencontres sera annoncé ici.</p>}
    </div></section>
    <section id="derniers-resultats" className="section muted"><div className="container"><SectionHeading title={t('DERNIERS RÉSULTATS')} /><MatchResults matches={results} teams={teams} competitions={competitions} clubId={c.club_team_id} timezone={c.timezone} /></div></section>
    <section id="classement" className="section"><div className="container"><SectionHeading title={t('CLASSEMENT OFFICIEL')} description="Sélectionnez la saison et la compétition en haut de page." /><StandingsTable rows={rows} teams={teams} clubId={c.club_team_id} competition={competition} /></div></section>
    <section id="palmares" className="section sports-honours"><div className="container"><SectionHeading title={t('PALMARÈS & EFFECTIF')} light />
      {trophies.length ? <div className="trophies-grid">{trophies.map(item => <article key={item.id}><TrophySymbol name={item.icon} /><p>{item.competition_name??competition?.name}</p><h3>{item.title}</h3><strong>{item.count}</strong><span>{item.year??seasons.find(season => season.id === item.season_id)?.name}</span>{item.is_demo && <small>Démonstration</small>}</article>)}</div> : <div className="honours-empty"><TrophyIcon size={40} /><p>Le palmarès sera présenté après validation des distinctions officielles du club.</p></div>}
      <div className="center-action"><Link href="/equipe" className="button primary">DÉCOUVRIR NOTRE EFFECTIF <ArrowRight size={16} /></Link></div>
    </div></section>
  </main>;
}
