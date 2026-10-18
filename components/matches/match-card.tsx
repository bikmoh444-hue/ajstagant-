'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { CalendarDays, Clock3, MapPin, Radio, Ticket } from 'lucide-react';
import { ClubLogo } from '@/components/ui/club-media';
import { configuredLink, matchDate } from '@/lib/utils/sports';
import type { Match, Team } from '@/lib/types/sports';

function MatchTeam({ team }: { team: Team | undefined }) {
  return <div className="fixture-team"><ClubLogo url={team?.logo_url ?? null} large />
    <h3>{team?.name ?? 'Équipe à confirmer'}</h3><p>{team?.city ?? 'Ville à confirmer'}</p></div>;
}
export function MatchCard({ match, teams, clubId, timezone, featured = false }: {
  match: Match; teams: Team[]; clubId: string; timezone: string; featured?: boolean;
}) {
  const {locale,t}=useLocale();
  const date = matchDate(match.kickoff_at, timezone,locale);
  const home = teams.find(team => team.id === match.home_team_id);
  const away = teams.find(team => team.id === match.away_team_id);
  const ticketUrl = configuredLink(match.ticket_url);
  const liveUrl = configuredLink(match.live_url);
  return <article className={`fixture-card ${featured ? 'featured-fixture' : 'compact-fixture'}`}>
    <div className="fixture-heading"><span>{match.matchday ?? 'Journée à confirmer'}</span><div className="fixture-badges">
      <span>{t(match.status === 'live' ? 'EN DIRECT' : 'À VENIR')}</span>
      {match.home_team_id === clubId && <span>{t('À DOMICILE')}</span>}
    </div></div>
    {match.is_demo && <p className="fixture-demo">MATCH DE DÉMONSTRATION · RENCONTRE NON OFFICIELLE</p>}
    <div className="fixture-teams"><MatchTeam team={home} /><div className="fixture-versus"><strong>{match.status === 'live' && match.home_score !== null && match.away_score !== null ? `${match.home_score} – ${match.away_score}` : 'VS'}</strong><span>{t(date.time)}</span></div><MatchTeam team={away} /></div>
    <div className="fixture-details"><span><CalendarDays size={15} />{t(date.date)}</span><span><Clock3 size={15} />{t(date.time)}</span><span><MapPin size={15} />{match.venue ?? 'Salle à confirmer'} · {match.city ?? 'Ville à confirmer'}</span></div>
    {(ticketUrl || liveUrl) && <div className="fixture-links">{liveUrl && <a href={liveUrl} rel="noopener noreferrer" target="_blank"><Radio size={15} /> DIFFUSION EN DIRECT</a>}{ticketUrl && <a href={ticketUrl} rel="noopener noreferrer" target="_blank"><Ticket size={15} /> BILLETTERIE</a>}</div>}
  </article>;
}
