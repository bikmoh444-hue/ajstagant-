import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { Row, TableName } from '@/lib/supabase/database';
import type { Position, SiteContent } from '@/lib/types/site';
import type { BureauContent, Director, GalleryContent, HistoryContent, PlayerProfile, TeamContent } from '@/lib/types/pages';
import type { SportsContent } from '@/lib/types/sports';
import { getLocale } from '@/lib/locale';
import { getPublicSettings } from './public-settings';
import { documentTemplates, validateDocument, type DocumentKey } from './documents';
import { historyDocumentWithImage, historyImageSource } from './history-images';

const publicRows=cache(async<T extends TableName>(table:T):Promise<Row<T>[]>=>{
 const {data,error}=await createPublicClient().from(table).select('*');
 if(error){
  // Compatibilité avec les installations antérieures à la migration 008.
  // Ne jamais masquer un refus de permission ou une panne de connexion.
  if(table==='team_categories'&&['PGRST205','42P01'].includes(error.code)){
   console.warn('team_categories absente : exécuter sql/team_management.sql dans Supabase. Les joueurs sans catégorie restent disponibles.');
   return [];
  }
  const instruction=table==='team_categories'?' Vérifier sql/team_management.sql et les droits de lecture publique.':'';
  throw new Error(`Lecture publique indisponible : ${table} [${error.code||'UNKNOWN'}].${instruction}`,{cause:error});
 }
 return (data??[]) as unknown as Row<T>[];
});
const order=<T extends {sort_order:number}>(rows:T[])=>[...rows].sort((a,b)=>a.sort_order-b.sort_order);
const text=(row:object,key:string,locale:string)=>{
 const values=row as Record<string,unknown>;return String((locale==='ar'&&values[`${key}_ar`])||values[`${key}_fr`]||'');
};
const managed=(row:{id:string;sort_order:number;is_visible:boolean})=>({...row,is_demo:false});
export const getDocument=cache(async<K extends DocumentKey>(key:K):Promise<typeof documentTemplates[K]>=>{
 const rows=await publicRows('page_content');const locale=await getLocale();
 const row=rows.find(item=>item.page_key===key&&item.section_key==='config');
 if(!row)notFound();
 const content=row.settings_json as {fr?:unknown;ar?:unknown};
 const localized=locale==='ar'&&content.ar?content.ar:content.fr;
 const document=key==='histoire'?historyDocumentWithImage(localized,historyImageSource(content,row.image_url)):localized;
 return validateDocument(key,document) as typeof documentTemplates[K];
});
export async function loadGallery():Promise<GalleryContent>{
 const [doc,categories,images,locale]=await Promise.all([getDocument('galerie'),publicRows('gallery_categories'),publicRows('gallery_images'),getLocale()]);
 return {...doc,categories:order(categories).map(row=>({...managed(row),label:text(row,'name',locale)})),images:order(images).map(row=>({...managed(row),title:text(row,'title',locale),category_id:row.category_id,image:{src:row.image_url,alt:text(row,'title',locale)},date:row.taken_at,description:text(row,'description',locale)}))};
}
export async function loadTeam():Promise<TeamContent>{
 const [doc,players,stats,staff,seasons,locale,categories]=await Promise.all([getDocument('equipe'),publicRows('players'),publicRows('player_statistics'),publicRows('staff_members'),publicRows('seasons'),getLocale(),publicRows('team_categories')]);
 const current=seasons.find(row=>row.is_current)??order(seasons)[0];
  const profiles:PlayerProfile[]=order(players).filter(row=>row.is_active&&row.is_visible&&(!row.category_id||categories.some(c=>c.id===row.category_id&&c.is_visible))).map(row=>({...managed(row),name:row.full_name,playing_role:row.playing_role,category_id:row.category_id,number:row.shirt_number,position:row.position as Position,image:{src:row.photo_url,alt:row.full_name},is_captain:row.is_captain,is_vice_captain:row.is_vice_captain,nationality:row.nationality,date_of_birth:row.date_of_birth,height_cm:row.height_cm,preferred_foot:(row.preferred_foot==='Droit'||row.preferred_foot==='Gauche'?row.preferred_foot:null),season:current?.name??doc.season,statistics:stats.filter(stat=>stat.player_id===row.id).map(stat=>({id:stat.id,player_id:stat.player_id,season:seasons.find(s=>s.id===stat.season_id)?.name??'',matches_played:stat.matches_played,goals:stat.goals,assists:stat.assists,clean_sheets:stat.clean_sheets,sort_order:0,is_visible:true,is_demo:false}))}));
 return {...doc,categories:order(categories).filter(c=>c.is_visible).map(c=>({id:c.id,label:text(c,'name',locale),slug:c.slug})),season:current?.name??doc.season,players:profiles,staff:order(staff).map(row=>({...managed(row),name:row.full_name,role:text(row,'role',locale),image:{src:row.photo_url,alt:row.full_name},biography:text(row,'biography',locale)}))};
}
export async function loadBureau():Promise<BureauContent>{
 const [doc,members,locale]=await Promise.all([getDocument('bureau'),publicRows('bureau_members'),getLocale()]);
 return {...doc,members:order(members).map(row=>({...managed(row),name:row.full_name,nameAr:row.full_name_ar,nameFr:row.full_name_fr,roleAr:row.role_ar,roleFr:row.role_fr,role:text(row,'role',locale),president:row.is_president,image:{src:row.photo_url,alt:row.full_name},biography:text(row,'biography',locale),mandate:[row.mandate_start,row.mandate_end].filter(Boolean).join(' — ')} as Director))};
}
export async function loadHistory():Promise<HistoryContent>{
 const [doc,steps,values,gallery,locale,categories]=await Promise.all([getDocument('histoire'),publicRows('history_milestones'),publicRows('club_values'),publicRows('gallery_images'),getLocale(),publicRows('gallery_categories')]);
 const historyCategory=categories.find(row=>row.slug==='histoire');
 return {...doc,steps:order(steps).map(row=>({...managed(row),date:row.year?String(row.year):null,title:text(row,'title',locale),description:text(row,'description',locale)})),
 values:order(values).map(row=>({...managed(row),title:text(row,'title',locale),description:text(row,'description',locale),icon:row.icon as 'respect'|'rigor'|'solidarity'|'passion'})),
 gallery:order(gallery).filter(row=>row.category_id===historyCategory?.id).slice(0,3).map(row=>({...managed(row),title:text(row,'title',locale),category_id:row.category_id,image:{src:row.image_url,alt:text(row,'title',locale)}}))};
}
export async function loadSports():Promise<SportsContent>{
 const [doc,seasons,competitions,teams,matches,standings,trophies,locale]=await Promise.all([getDocument('matchs'),publicRows('seasons'),publicRows('competitions'),publicRows('teams'),publicRows('matches'),publicRows('standings'),publicRows('trophies'),getLocale()]);
 return {...doc,club_team_id:teams.find(row=>row.is_ajt)?.id??'',default_season_id:seasons.find(row=>row.is_current)?.id??null,default_competition_id:order(competitions)[0]?.id??null,
 seasons:order(seasons).map(row=>({...managed(row),name:row.name,starts_on:row.start_date,ends_on:row.end_date,is_current:row.is_current})),
 competitions:order(competitions).map(row=>({...managed(row),name:row.name,subtitle:row.subtitle??'',qualification_positions:row.qualification_positions,relegation_positions:row.relegation_positions,season_id:row.season_id})),
 teams:order(teams).map(row=>({...managed(row),name:row.name,city:row.city,logo_url:row.logo_url,is_club:row.is_ajt})),
 matches:order(matches).map(row=>({...managed(row),competition_id:row.competition_id,season_id:row.season_id,home_team_id:row.home_team_id,away_team_id:row.away_team_id,kickoff_at:row.match_date,venue:row.venue,city:row.city,home_score:row.home_score,away_score:row.away_score,is_featured:row.is_featured,status:row.status as SportsContent['matches'][number]['status'],matchday:row.round_number,ticket_url:row.ticket_url,live_url:row.streaming_url})),
 standings:order(standings).map(row=>({...managed(row),competition_id:row.competition_id,season_id:row.season_id,team_id:row.team_id,rank:row.position,played:row.played,won:row.wins,drawn:row.draws,lost:row.losses,goals_for:row.goals_for,goals_against:row.goals_against,points:row.points})),
 trophies:order(trophies).map(row=>({...managed(row),competition_id:row.competition_id??'',season_id:row.season_id??'',title:text(row,'title',locale),count:row.quantity,competition_name:row.competition_name,year:row.year,icon:row.icon}))};
}
export async function loadHome():Promise<SiteContent>{
 const [doc,settings,objectives,locale,sections,rawPlayers,rawGallery]=await Promise.all([getDocument('home'),getPublicSettings(),publicRows('club_objectives'),getLocale(),publicRows('homepage_sections'),publicRows('players'),publicRows('gallery_images')]);
 return {...doc,clubName:locale==='ar'?settings.club_name_ar:settings.club_name,logoUrl:settings.logo_url,slogan:locale==='ar'?settings.slogan_ar:settings.slogan,heroTitle:doc.heroTitle,heroSubtitle:doc.heroSubtitle,
 objectives:order(objectives).map(row=>({title:text(row,'title',locale),description:text(row,'description',locale),icon:row.icon as 'youth'|'ball'|'team'|'trophy'})),
 featuredPlayers:order(rawPlayers).filter(row=>row.is_featured).slice(0,4).map(row=>({id:row.id,name:row.full_name,number:row.shirt_number,position:row.position as Position,image:{src:row.photo_url,alt:row.full_name}})),
 galleryImages:order(rawGallery).filter(row=>row.is_featured).slice(0,3).map(row=>({src:row.image_url,alt:text(row,'title',locale),caption:text(row,'title',locale)})),
 bureauMembers:[],
 contactInfo:{location:locale==='ar'?settings.address_ar??settings.address??'':settings.address??'',email:settings.contact_email,phone:settings.contact_phone,socials:[['Facebook',settings.facebook_url],['Instagram',settings.instagram_url],['WhatsApp',settings.whatsapp_url],['YouTube',settings.youtube_url],['TikTok',settings.tiktok_url]].filter(([,url])=>Boolean(url)).map(([label,url])=>({label:label!,url:url!}))},
 footerSettings:{arabicName:settings.club_name_ar,slogan:locale==='ar'?settings.slogan_ar:settings.slogan,copyright:settings.footer_text??''},sections:order(sections).map(row=>({key:row.section_key,sort_order:row.sort_order,is_visible:row.is_visible,settings:row.settings_json}))};
}
export async function loadContact(){const [doc,s,locale]=await Promise.all([getDocument('contact'),getPublicSettings(),getLocale()]);return {...doc,association_name:locale==='ar'?s.club_name_ar:s.club_name,locality:locale==='ar'?s.address_ar??'':s.address??'',phone:s.contact_phone,email:s.contact_email,facebook_url:s.facebook_url,instagram_url:s.instagram_url,whatsapp_url:s.whatsapp_url,map_url:s.map_url};}
