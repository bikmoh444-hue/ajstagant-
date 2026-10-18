begin;
create table public.seasons (
 id uuid primary key default gen_random_uuid(), name text not null, start_date date, end_date date,
 is_current boolean not null default false, sort_order integer not null default 0, is_visible boolean not null default true,
 check(end_date is null or start_date is null or end_date >= start_date)
);
create unique index one_current_season on public.seasons(is_current) where is_current;
create table public.competitions (
 id uuid primary key default gen_random_uuid(), name text not null, season_id uuid not null references public.seasons(id) on delete restrict,
 logo_url text, competition_type text not null default 'league', subtitle text,
 qualification_positions integer[], relegation_positions integer[], win_points integer not null default 3,
 draw_points integer not null default 1, loss_points integer not null default 0,
 sort_order integer not null default 0, is_visible boolean not null default true, unique(id,season_id)
);
create table public.teams (
 id uuid primary key default gen_random_uuid(), name text not null, short_name text, logo_url text, city text,
 is_ajt boolean not null default false, sort_order integer not null default 0, is_visible boolean not null default true
);
create unique index one_ajt_team on public.teams(is_ajt) where is_ajt;
create table public.player_statistics (
 id uuid primary key default gen_random_uuid(), player_id uuid not null references public.players(id) on delete cascade,
 season_id uuid not null references public.seasons(id) on delete restrict,
 matches_played integer check(matches_played>=0), goals integer check(goals>=0), assists integer check(assists>=0),
 clean_sheets integer check(clean_sheets>=0), yellow_cards integer check(yellow_cards>=0), red_cards integer check(red_cards>=0),
 unique(player_id,season_id)
);
create table public.matches (
 id uuid primary key default gen_random_uuid(), competition_id uuid not null, season_id uuid not null references public.seasons(id) on delete restrict,
 home_team_id uuid not null references public.teams(id) on delete restrict, away_team_id uuid not null references public.teams(id) on delete restrict,
 match_date timestamptz, venue text, city text, home_score integer check(home_score>=0), away_score integer check(away_score>=0),
 status text not null default 'scheduled' check(status in ('scheduled','live','finished','postponed','cancelled')),
 round_number text, streaming_url text, ticket_url text, is_featured boolean not null default false,
 is_visible boolean not null default true, sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(home_team_id<>away_team_id), check(status<>'finished' or (home_score is not null and away_score is not null)),
 foreign key(competition_id,season_id) references public.competitions(id,season_id) on delete restrict
);
create table public.standings (
 id uuid primary key default gen_random_uuid(), competition_id uuid not null, season_id uuid not null references public.seasons(id) on delete restrict,
 team_id uuid not null references public.teams(id) on delete restrict, position integer not null check(position>0),
 played integer not null default 0 check(played>=0), wins integer not null default 0 check(wins>=0), draws integer not null default 0 check(draws>=0), losses integer not null default 0 check(losses>=0),
 goals_for integer not null default 0 check(goals_for>=0), goals_against integer not null default 0 check(goals_against>=0),
 goal_difference integer generated always as (goals_for-goals_against) stored, points integer not null default 0,
 points_mode text not null default 'manual' check(points_mode in ('manual','calculated')),
 sort_order integer not null default 0, is_visible boolean not null default true, updated_at timestamptz not null default now(),
 unique(competition_id,season_id,team_id), check(played=wins+draws+losses),
 foreign key(competition_id,season_id) references public.competitions(id,season_id) on delete restrict
);
create table public.trophies (
 id uuid primary key default gen_random_uuid(), title_fr text not null, title_ar text, competition_name text not null,
 year integer check(year between 1800 and 2200), quantity integer not null default 1 check(quantity>0), icon text not null default 'trophy',
 competition_id uuid references public.competitions(id) on delete set null, season_id uuid references public.seasons(id) on delete set null,
 sort_order integer not null default 0, is_visible boolean not null default true
);
create index matches_schedule_idx on public.matches(season_id,competition_id,status,match_date);
create index standings_competition_idx on public.standings(competition_id,season_id,position);
create index competition_season_idx on public.competitions(season_id);
create index player_statistics_season_idx on public.player_statistics(season_id);
create index matches_home_team_idx on public.matches(home_team_id);
create index matches_away_team_idx on public.matches(away_team_id);
create index standings_team_idx on public.standings(team_id);
create index trophies_competition_idx on public.trophies(competition_id);
create index trophies_season_idx on public.trophies(season_id);
commit;
