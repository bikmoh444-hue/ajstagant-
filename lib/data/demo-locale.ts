import { translate, type Locale } from '@/lib/i18n';
import { documentTemplates } from './documents';
export function localizeDemo<T>(value:T,locale:Locale):T {
 if(locale==='fr')return value;
 function walk(item:unknown):unknown {if(typeof item==='string')return translate(locale,item);if(Array.isArray(item))return item.map(walk);if(item&&typeof item==='object')return Object.fromEntries(Object.entries(item).map(([key,child])=>[key,['position','status','icon','id','href'].includes(key)||key.endsWith('_id')?child:walk(child)]));return item;}
 const result=walk(value) as T;
 return result;
}
export function previewHomeCopy(locale:Locale){return localizeDemo(documentTemplates.home.copy,locale);}
