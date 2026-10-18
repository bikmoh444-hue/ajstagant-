import { ClubLogo } from '@/components/ui/club-media';
import { goalDifference, signedNumber } from '@/lib/utils/sports';
import type { Competition, StandingsRow, Team } from '@/lib/types/sports';

export function StandingsTable({ rows, teams, clubId, competition }: {
  rows: StandingsRow[]; teams: Team[]; clubId: string; competition: Competition | undefined;
}) {
  return <>
    <div className="standings-scroll" tabIndex={0} role="region" aria-label="Classement, défilement horizontal sur petit écran">
      <table className="standings-table"><caption>{competition?.name ?? 'Classement'} — {rows.some(row => row.is_demo) ? 'données de démonstration' : 'données saisies par le club'}</caption>
        <thead><tr>{['Rang', 'Équipe', 'J', 'V', 'N', 'D', 'BP', 'BC', 'Diff.', 'Pts'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{[...rows].sort((a, b) => a.rank - b.rank || a.sort_order - b.sort_order).map(row => {
          const team = teams.find(item => item.id === row.team_id);
          const isClub = row.team_id === clubId;
          const qualification = competition?.qualification_positions?.includes(row.rank);
          const relegation = competition?.relegation_positions?.includes(row.rank);
          return <tr key={row.id} className={isClub ? 'club-standing' : qualification ? 'qualification-standing' : relegation ? 'relegation-standing' : ''}>
            <td>{row.rank}</td><th scope="row"><span className="standing-team"><ClubLogo url={team?.logo_url ?? null} /><span>{team?.name ?? 'Équipe à confirmer'}{row.is_demo && <small>Démonstration</small>}</span></span></th>
            <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.goals_for}</td><td>{row.goals_against}</td><td>{signedNumber(goalDifference(row))}</td><td><strong>{row.points}</strong></td>
          </tr>;
        })}{!rows.length && <tr><td colSpan={10} className="standings-empty">Aucun classement officiel publié pour cette saison et cette compétition.</td></tr>}</tbody>
      </table>
    </div>
    {(competition?.qualification_positions?.length || competition?.relegation_positions?.length) ? <p className="standings-legend">{Boolean(competition?.qualification_positions?.length) && <span>Zone de qualification selon les règles renseignées</span>}{Boolean(competition?.relegation_positions?.length) && <span>Zone de relégation selon les règles renseignées</span>}</p> : null}
    <p className="standings-note">Classement administré par le club. Aucune connexion à une API de fédération.</p>
  </>;
}
