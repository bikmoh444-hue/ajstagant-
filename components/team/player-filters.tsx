'use client';
import { useLocale } from '@/components/ui/locale-provider';
export interface PlayerFilterOption { value: string; label: string }
export function PlayerFilters({ options, selected, onChange }: {
  options: PlayerFilterOption[]; selected: string; onChange: (value: string) => void;
}) {
  const {t}=useLocale();
  return <div className="player-filters roster-filters" role="group" aria-label="Filtrer l’effectif par poste">
    {options.map(option => <button key={option.value} type="button" aria-pressed={selected === option.value}
      onClick={() => onChange(option.value)}>{t(option.label)}</button>)}
  </div>;
}
