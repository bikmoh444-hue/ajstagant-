import 'server-only';
import { demoContent } from './demo';
import type { ContentRepository } from '@/lib/types/site';
import type { PagesRepository } from '@/lib/types/pages';
import { demoBureau, demoGallery, demoHistory, demoTeam } from './pages-demo';
import type { SportsRepository } from '@/lib/types/sports';
import { demoSports } from './sports-demo';
import { contactContent } from './contact-content';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { loadHome, loadHistory, loadTeam, loadGallery, loadBureau, loadSports, loadContact } from './supabase-repository';
import { getLocale } from '@/lib/locale';
import { localizeDemo, previewHomeCopy } from './demo-locale';
import { officialHistory, officialValues } from './official-history';
// Remplacer cet adaptateur par le dépôt Supabase lors de son intégration.
const repository: ContentRepository & PagesRepository & SportsRepository = {
  async getHomeContent() { return demoContent; },
  async getHistoryContent() { return demoHistory; },
  async getTeamContent() { return demoTeam; },
  async getGalleryContent() { return demoGallery; },
  async getBureauContent() { return demoBureau; },
  async getSportsContent() { return demoSports; },
};
// Une base configurée ne retombe jamais silencieusement sur des données fictives.
export const getHomeContent = async () => {if(isSupabaseConfigured())return loadHome();const locale=await getLocale();return {...localizeDemo(await repository.getHomeContent(),locale),copy:previewHomeCopy(locale)};};
export const getHistoryContent = async () => {
 if(isSupabaseConfigured())return loadHistory();
 const locale=await getLocale();const base=localizeDemo(await repository.getHistoryContent(),locale);
 return {...base,...officialHistory[locale],future:{...base.future,...officialHistory[locale].future},values:officialValues.map((value,index)=>({id:value.id,sort_order:index,is_visible:true,is_demo:false,title:locale==='ar'?value.title_ar:value.title_fr,description:locale==='ar'?value.description_ar:value.description_fr,icon:value.icon}))};
};
export const getTeamContent = async () => isSupabaseConfigured()?loadTeam():localizeDemo(await repository.getTeamContent(),await getLocale());
export const getGalleryContent = async () => isSupabaseConfigured()?loadGallery():localizeDemo(await repository.getGalleryContent(),await getLocale());
export const getBureauContent = async () => isSupabaseConfigured()?loadBureau():localizeDemo(await repository.getBureauContent(),await getLocale());
export const getSportsContent = async () => isSupabaseConfigured()?loadSports():localizeDemo(await repository.getSportsContent(),await getLocale());
export const getContactContent = async () => isSupabaseConfigured()?loadContact():localizeDemo(contactContent,await getLocale());
