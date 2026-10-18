import 'server-only';
import type { Metadata } from 'next';
import { getLocale } from '@/lib/locale';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getDocument } from './supabase-repository';
import type { DocumentKey } from './documents';
export async function getPageMetadata(key:DocumentKey):Promise<Metadata>{
 const locale=await getLocale();
 const labels:Record<string,[string,string]>={histoire:['Notre histoire','تاريخنا'],equipe:['Équipe et staff','الفريق والطاقم'],galerie:['Galerie','معرض الصور'],bureau:['Bureau directeur','المكتب المسير'],matchs:['Calendrier & classement','المباريات والترتيب'],contact:['Contactez-nous','اتصلوا بنا']};
 if(!isSupabaseConfigured())return {title:labels[key]?.[locale==='ar'?1:0]??'A.J.S TAGANT'};
 const doc=await getDocument(key);return 'hero' in doc?{title:doc.hero.title,description:doc.hero.description??doc.hero.subtitle}:{};
}
