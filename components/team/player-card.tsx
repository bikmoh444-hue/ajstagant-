'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { UserRound } from 'lucide-react';
import { ClubLogo, ClubMedia } from '@/components/ui/club-media';
import { playerAge, visibleInOrder } from '@/lib/utils/content';
import type { PlayerProfile } from '@/lib/types/pages';

const positionLabels = {
  Gardiens: 'Gardien', 'Défenseurs': 'Défenseur / Fixe', Milieux: 'Milieu / Ailier', Attaquants: 'Attaquant / Pivot',
};

export function PlayerCard({ player, logoUrl }: { player: PlayerProfile; logoUrl: string | null }) {
  const {t}=useLocale();
  const statistics = visibleInOrder(player.statistics).find(stat => stat.season === player.season);
  const values = statistics ? [
    { label: 'Matchs', value: statistics.matches_played },
    { label: 'Buts', value: statistics.goals },
    { label: 'Passes', value: statistics.assists },
    ...(player.position === 'Gardiens' ? [{ label: 'Clean sheets', value: statistics.clean_sheets }] : []),
  ].filter(stat => stat.value != null) : [];
  const age=playerAge(player.date_of_birth);
  const role = player.playing_role || t(positionLabels[player.position as keyof typeof positionLabels] ?? player.position);
  return <article className="roster-card">
    <div className="roster-card-top"><ClubLogo url={logoUrl} />
      {player.number != null && <span className="roster-number" aria-label={`Numéro ${player.number}`}>{player.number}</span>}
    </div>
    <div className="roster-portrait">{player.image.src ? <ClubMedia media={player.image} /> : <UserRound aria-label={player.image.alt} />}</div>
    <div className="roster-info"><p className="roster-position">{role}</p><h3>{player.name}</h3>
      <div className="roster-meta">{player.nationality && <span>{player.nationality}</span>}{player.is_captain && <span className="captain-label">{t('Capitaine')}</span>}{player.is_vice_captain && <span className="captain-label">{t('Vice-capitaine')}</span>}{age!=null && <span>{age} ans</span>}{player.preferred_foot && <span>{player.preferred_foot}</span>}</div>
      <p className="roster-season">{player.season}</p>
      {values.length > 0 && <dl className="roster-statistics">{values.map(stat => <div key={stat.label}><dt>{t(stat.label)}</dt><dd>{stat.value}</dd></div>)}</dl>}
      {statistics?.is_demo && values.length > 0 && <span className="demo-label">Statistiques de démonstration</span>}
      {player.is_demo && <span className="demo-label">Joueur de démonstration</span>}
    </div>
  </article>;
}
