import type { Match, MatchResult, StandingsRow } from '@/lib/types/sports';

export function matchResult(match: Match, clubId: string): MatchResult | null {
  if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return null;
  const isHome = match.home_team_id === clubId;
  const involvesClub = isHome || match.away_team_id === clubId;
  const difference = isHome ? match.home_score - match.away_score : match.away_score - match.home_score;
  return { id: `result-${match.id}`, match_id: match.id, home_score: match.home_score, away_score: match.away_score,
    outcome: involvesClub ? difference > 0 ? 'V' : difference < 0 ? 'D' : 'N' : null,
  };
}
export function goalDifference(row: StandingsRow): number { return row.goals_for - row.goals_against; }
export function signedNumber(value: number): string { return value > 0 ? `+${value}` : String(value); }
export function matchDate(value: string | null, timezone: string,locale:'fr'|'ar'='fr'): { date: string; time: string } {
  if (!value || Number.isNaN(Date.parse(value))) return { date: 'Date à confirmer', time: 'Heure à confirmer' };
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat(locale==='ar'?'ar-MA':'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(date),
    time: new Intl.DateTimeFormat(locale==='ar'?'ar-MA':'fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: timezone }).format(date),
  };
}
export function configuredLink(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
