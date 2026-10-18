'use client';
import { useState } from 'react';
import { PlayerCard } from './player-card';
import { PlayerFilters, type PlayerFilterOption } from './player-filters';
import { StaffCard } from './staff-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { visibleInOrder } from '@/lib/utils/content';
import type { PlayerProfile, StaffMember } from '@/lib/types/pages';
import {useLocale} from '@/components/ui/locale-provider';

const defaultFilters: PlayerFilterOption[] = [
  { value: 'Tous', label: 'Tous' }, { value: 'Gardiens', label: 'Gardiens' },
  { value: 'Défenseurs', label: 'Défenseurs / Fixes' }, { value: 'Milieux', label: 'Milieux / Ailiers' },
  { value: 'Attaquants', label: 'Attaquants / Pivots' }, { value: 'Staff', label: 'Staff technique' },
];
export function TeamRoster({ players, staff, staffTitle, logoUrl, categories }: {
  categories?: {id:string;label:string;slug:string}[];
  players: PlayerProfile[]; staff: StaffMember[]; staffTitle: string; logoUrl: string | null;
}) {
  const {locale,t}=useLocale();
  const filters = categories ? [{value:'Tous',label:'Tous'},...categories.map(c=>({value:c.slug==='staff'?'Staff':c.id,label:c.label}))] : defaultFilters;
  const [selected, setSelected] = useState('Tous');
  const visiblePlayers = visibleInOrder(players).filter(player => selected === 'Tous' || (categories ? player.category_id === (selected === 'Staff' ? categories.find(c=>c.slug==='staff')?.id : selected) : player.position === selected));
  const visibleStaff = visibleInOrder(staff);
  return <>
    <section className="section muted roster-section"><div className="container">
      <PlayerFilters options={filters} selected={selected} onChange={setSelected} />
      <p className="filter-result" role="status">{locale==='ar'?(selected==='Staff'?`${visibleStaff.length+visiblePlayers.length} أعضاء في الطاقم`:`${visiblePlayers.length} لاعب معروض`):(selected==='Staff'?`${visibleStaff.length+visiblePlayers.length} profils dans le staff`:`${visiblePlayers.length} profils affichés`)}</p>
      {selected !== 'Staff' && (visiblePlayers.length ? <div className="roster-grid">{visiblePlayers.map(player => <PlayerCard player={player} logoUrl={logoUrl} key={player.id} />)}</div> : <p className="empty-state">{t('Aucun joueur publié pour ce poste.')}</p>)}
      {selected === 'Staff' && <>{visiblePlayers.length>0&&<div className="roster-grid">{visiblePlayers.map(player=><PlayerCard key={player.id} player={player} logoUrl={logoUrl}/>)}</div>}<SectionHeading title={staffTitle} /><div className="staff-grid">{visibleStaff.map(member => <StaffCard member={member} key={member.id} />)}</div>{!visibleStaff.length && <p className="empty-state">Le staff sera publié prochainement.</p>}</>}
    </div></section>
    {selected === 'Tous' && (!categories || categories.some(c=>c.slug==='staff')) && <section className="section"><div className="container"><SectionHeading title={staffTitle} /><div className="staff-grid">{visibleStaff.map(member => <StaffCard member={member} key={member.id} />)}</div>{!visibleStaff.length && <p className="empty-state">Le staff sera publié prochainement.</p>}</div></section>}
  </>;
}
