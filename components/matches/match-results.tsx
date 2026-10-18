'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { ClubLogo } from '@/components/ui/club-media';
import { matchDate, matchResult } from '@/lib/utils/sports';
import type { Competition, Match, Team } from '@/lib/types/sports';

const statuses = { scheduled: 'À venir', live: 'En direct', finished: 'Terminé', postponed: 'Reporté', cancelled: 'Annulé' };
export function MatchResults({ matches, teams, competitions, clubId, timezone }: {
  matches: Match[]; teams: Team[]; competitions: Competition[]; clubId: string; timezone: string;
}) {
  const {locale,t}=useLocale();
  if (!matches.length) return <p className="sports-empty">Les résultats seront publiés après les prochaines rencontres.</p>;
  return <div className="results-list">{matches.map(match => {
    const result = matchResult(match, clubId);
    const home = teams.find(team => team.id === match.home_team_id);
    const away = teams.find(team => team.id === match.away_team_id);
    return <article key={match.id} className="result-row">
      <div className="result-date"><span>{t(matchDate(match.kickoff_at, timezone,locale).date)}</span><small>{competitions.find(item => item.id === match.competition_id)?.name ?? 'Compétition à confirmer'}{match.matchday && ` · ${match.matchday}`}</small>{match.is_demo && <small className="result-demo">Résultat de démonstration</small>}</div>
      <div className="result-teams"><div><span>{home?.name ?? 'Équipe à confirmer'}</span><ClubLogo url={home?.logo_url ?? null} /></div>
        <strong className="result-score">{result ? `${result.home_score} – ${result.away_score}` : t(statuses[match.status])}</strong>
        <div><ClubLogo url={away?.logo_url ?? null} /><span>{away?.name ?? 'Équipe à confirmer'}</span></div>
      </div>
      {result?.outcome ? <span className={`result-outcome outcome-${result.outcome}`} aria-label={{ V: 'Victoire A.J.S TAGANT', N: 'Match nul', D: 'Défaite A.J.S TAGANT' }[result.outcome]}>{result.outcome}</span> : <span className="result-status">{match.status === 'finished' ? 'Score à confirmer' : t(statuses[match.status])}</span>}
    </article>;
  })}</div>;
}
