'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { ClubMedia, ClubLogo } from '@/components/ui/club-media';
import type { Player, Position } from '@/lib/types/site';
export function PlayerGrid({ players, logoUrl }: { players: Player[]; logoUrl: string | null }) {
  const {t}=useLocale();
  const [filter, setFilter] = useState<Position | 'Tous'>('Tous');
  return <><div className="player-filters" aria-label="Filtrer par poste">{(['Tous', 'Gardiens', 'Défenseurs', 'Milieux', 'Attaquants'] as const).map(position => <button key={position} onClick={() => setFilter(position)} aria-pressed={filter === position}>{t(position)}</button>)}</div><div className="players-grid">{players.filter(player => filter === 'Tous' || player.position === filter).map(player => <article className="player-card" key={player.id}>{player.number!==null&&<span className="player-number">{player.number}</span>}<div className="player-photo">{player.image.src ? <ClubMedia media={player.image} /> : <UserRound aria-label={player.image.alt} />}</div><div className="player-details"><div><h3>{player.name}</h3><p>{t(player.position)}</p></div><ClubLogo url={logoUrl} /></div></article>)}</div></>;
}
