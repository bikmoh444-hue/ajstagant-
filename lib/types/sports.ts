import type { OrderedContent, PageHero } from './pages';

export interface Season extends OrderedContent { name: string; starts_on: string | null; ends_on: string | null; is_current: boolean }
export interface Competition extends OrderedContent {
  name: string; subtitle: string;
  qualification_positions: number[] | null;
  relegation_positions: number[] | null;
  season_id?: string;
}
export interface Team extends OrderedContent { name: string; city: string | null; logo_url: string | null; is_club: boolean }
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
export interface Match extends OrderedContent {
  season_id: string; competition_id: string; home_team_id: string; away_team_id: string;
  kickoff_at: string | null; venue: string | null; city: string | null; matchday: string | null;
  status: MatchStatus; home_score: number | null; away_score: number | null;
  ticket_url: string | null; live_url: string | null;
  is_featured?: boolean;
}
export interface MatchResult {
  id: string; match_id: string; home_score: number; away_score: number;
  outcome: 'V' | 'N' | 'D' | null;
}
export interface StandingsRow extends OrderedContent {
  season_id: string; competition_id: string; team_id: string; rank: number;
  played: number; won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number; points: number;
}
export interface Trophy extends OrderedContent { competition_id: string; title: string; count: number; season_id: string; competition_name?:string; year?:number|null;icon?:string }
export interface SportsContent {
  hero: PageHero; club_team_id: string; timezone: string;
  default_season_id: string | null; default_competition_id: string | null;
  seasons: Season[]; competitions: Competition[]; teams: Team[];
  matches: Match[]; standings: StandingsRow[]; trophies: Trophy[];
}
export interface SportsRepository { getSportsContent(): Promise<SportsContent> }
