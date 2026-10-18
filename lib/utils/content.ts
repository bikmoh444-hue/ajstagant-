import type { OrderedContent } from '@/lib/types/pages';
export function playerAge(birthDate?:string|null,now=new Date()):number|null{
 if(!birthDate||!/^\d{4}-\d{2}-\d{2}$/.test(birthDate))return null;
 const birth=new Date(`${birthDate}T00:00:00Z`);
 if(Number.isNaN(birth.getTime())||birth.toISOString().slice(0,10)!==birthDate||birth>now)return null;
 let age=now.getUTCFullYear()-birth.getUTCFullYear();
 if(now.getUTCMonth()<birth.getUTCMonth()||(now.getUTCMonth()===birth.getUTCMonth()&&now.getUTCDate()<birth.getUTCDate()))age--;
 return age;
}

export function visibleInOrder<T extends Pick<OrderedContent, 'sort_order' | 'is_visible'>>(items: readonly T[]): T[] {
  return items.filter(item => item.is_visible).sort((a, b) => a.sort_order - b.sort_order);
}

export function formatGalleryDate(value?: string | null,locale:'fr'|'ar'='fr'): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(locale==='ar'?'ar-MA':'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}
