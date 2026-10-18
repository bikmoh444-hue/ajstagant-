import type { Match, SportsContent } from '@/lib/types/sports';
import type { OrderedContent } from '@/lib/types/pages';

const entry = (id: string, sort_order: number): OrderedContent => ({ id, sort_order, is_visible: true, is_demo: true });
const teams = [
  { ...entry('ajt-tagant', 0), name: 'A.J.S TAGANT', city: 'Tagant', logo_url: null, is_club: true },
  ...['A', 'B', 'C', 'D'].map((letter, index) => ({ ...entry(`demo-opponent-${letter.toLowerCase()}`, index + 1), name: `Adversaire démo ${letter}`, city: null, logo_url: null, is_club: false })),
];
function match(id: string, index: number, status: Match['status'], home: string, away: string, scores: [number, number] | null = null): Match {
  return { ...entry(id, index), season_id: 'demo-season', competition_id: 'demo-competition',
    home_team_id: home, away_team_id: away, kickoff_at: null, venue: null, city: null,
    matchday: null, status, home_score: scores?.[0] ?? null, away_score: scores?.[1] ?? null,
    ticket_url: null, live_url: null,
  };
}
export const demoSports: SportsContent = {
  hero: { badge: 'COMPÉTITION À CONFIRMER', title: 'CALENDRIER & CLASSEMENT', subtitle: 'Le rendez-vous des Bleu & Jaune.', description: 'Présentation de démonstration — aucun calendrier, résultat ou classement officiel n’a encore été fourni.' },
  club_team_id: 'ajt-tagant', timezone: 'Africa/Casablanca',
  default_season_id: 'demo-season', default_competition_id: 'demo-competition',
  seasons: [{ ...entry('demo-season', 0), name: 'Saison de démonstration', starts_on: null, ends_on: null, is_current: true }],
  competitions: [{ ...entry('demo-competition', 0), name: 'Compétition de démonstration', subtitle: 'Données à remplacer après validation du club', qualification_positions: null, relegation_positions: null }],
  teams,
  matches: [
    match('demo-next-1', 0, 'scheduled', 'ajt-tagant', teams[1].id),
    match('demo-next-2', 1, 'scheduled', teams[2].id, 'ajt-tagant'),
    match('demo-next-3', 2, 'scheduled', 'ajt-tagant', teams[3].id),
    match('demo-next-4', 3, 'scheduled', teams[4].id, 'ajt-tagant'),
    match('demo-result-1', 4, 'finished', 'ajt-tagant', teams[1].id, [3, 1]),
    match('demo-result-2', 5, 'finished', teams[2].id, 'ajt-tagant', [2, 2]),
    match('demo-result-3', 6, 'finished', teams[3].id, 'ajt-tagant', [4, 1]),
    match('demo-postponed', 7, 'postponed', 'ajt-tagant', teams[4].id),
    match('demo-cancelled', 8, 'cancelled', teams[1].id, 'ajt-tagant'),
  ],
  // Aucune ligne de classement ni aucun trophée inventé.
  standings: [], trophies: [],
};
