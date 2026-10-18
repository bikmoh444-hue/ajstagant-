import type {HistoryContent} from '@/lib/types/pages';
import type {Locale} from '@/lib/i18n';
import {officialHistory} from './official-history';

function clean(value:unknown,key=''):unknown{
 // Les sources d'images et les liens restent strictement identiques.
 if(/(url|src|href)$/i.test(key)||['id','icon','slug'].includes(key))return value;
 if(typeof value==='string'){
  if(/^(Texte provisoire|Contenu provisoire|نص مؤقت|محتوى مؤقت)/i.test(value.trim()))return '';
  return value.replace(/في انتظار التأكيد|Date à confirmer|À confirmer/gi,'').trim();
 }
 if(Array.isArray(value))return value.map(item=>clean(item,key));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,clean(item,name)]));
 return value;
}

export function historyPresentation(content:HistoryContent,locale:Locale):HistoryContent{
 const result=clean(content) as HistoryContent;
 const official=officialHistory[locale];
 result.hero={...official.hero,...result.hero};
 for(const field of ['badge','title','subtitle','description'] as const)if(!result.hero[field])result.hero[field]=official.hero[field];
 if(!result.originTitle)result.originTitle=official.originTitle;
 result.paragraphs=(result.paragraphs??[]).filter(paragraph=>paragraph.trim());
 if(!result.paragraphs.length)result.paragraphs=[...official.paragraphs];
 return result;
}
