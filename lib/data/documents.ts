import { z } from 'zod';
import { demoContent } from './demo';
import { demoBureau, demoGallery, demoHistory, demoTeam } from './pages-demo';
import { demoSports } from './sports-demo';
import { contactContent } from './contact-content';
import { officialHistory } from './official-history';

// Ces modèles définissent la structure des éditeurs ; le contenu publié vient de PostgreSQL.
export const documentTemplates = {
 home: { ...demoContent, historyImage:{src:null,alt:'Archive du club'},featuredPlayers:[],galleryImages:[],bureauMembers:[],objectives:[],
  copy:{heroBadge:'BIENVENUE',heroButton:'DÉCOUVRIR NOTRE ASSOCIATION',heroButtonUrl:'/histoire',heroButtonVisible:true,secondaryButton:'EFFECTIF D1',secondaryButtonUrl:'/equipe',secondaryButtonVisible:true,
   aboutTitle:'DÉCOUVREZ A.J.S TAGANT',aboutKicker:'UNE ASSOCIATION, UNE PASSION',aboutHeading:'LE FUTSAL NOUS RASSEMBLE.',aboutBadge:'LA PASSION DU FUTSAL',historyTitle:'NOTRE HISTOIRE',historyButton:'HISTOIRE COMPLÈTE',historyButtonUrl:'/histoire',objectivesTitle:'NOS OBJECTIFS',playersTitle:'EFFECTIF A.J.S TAGANT',playersCaption:'Notre collectif, notre force.',playersButtonUrl:'/equipe',galleryButtonUrl:'/galerie',galleryCardUrl:'/galerie',playersButton:'VOIR TOUT L’EFFECTIF',galleryTitle:'GALERIE',galleryButton:'VOIR TOUTES LES PHOTOS',bureauTitle:'BUREAU DIRECTEUR',bureauCaption:'Des femmes et des hommes engagés pour le club.',bureauText:'Au service du projet sportif et de la vie associative.',bandEyebrow:'LA PASSION NOUS UNIT',bandTitle:'PLUS QU’UNE ÉQUIPE, UNE FAMILLE.',bandButton:'REJOINDRE LE CLUB',bandButtonUrl:'/contact',contactTitle:'CONTACTEZ-NOUS',contactKicker:'RESTONS EN CONTACT',contactHeading:'UNE QUESTION ? PARLONS FUTSAL.',contactText:'Pour en savoir plus sur l’association ou rejoindre notre aventure, contactez notre équipe.',infoDiscipline:'FOOTBALL EN SALLE',infoValues:'PASSION · RESPECT · SOLIDARITÉ'} },
 histoire:{...demoHistory,statistics:demoHistory.statistics.map(stat=>({...stat,value:null as string|null})),vision:officialHistory.fr.vision,mission:officialHistory.fr.mission,future:{...demoHistory.future,joinLabel:'REJOINDRE L’ASSOCIATION',joinUrl:'/#contact',statutesLabel:'CONSULTER LES STATUTS'},steps:[],values:[],gallery:[]},
 equipe:{...demoTeam,players:[],staff:[]},
 galerie:{...demoGallery,categories:[],images:[]},
 bureau:{...demoBureau,members:[]},
 matchs:{...demoSports,default_season_id:null as string|null,default_competition_id:null as string|null,seasons:[],competitions:[],teams:[],matches:[],standings:[],trophies:[]},
 contact:contactContent,
};
export type DocumentKey=keyof typeof documentTemplates;
function templateSchema(value:unknown):z.ZodType {
 if(value===null)return z.string().max(4000).nullable();
 if(typeof value==='string')return z.string().max(20000);
 if(typeof value==='number')return z.number().finite();
 if(typeof value==='boolean')return z.boolean();
 if(Array.isArray(value))return z.array(value.length?templateSchema(value[0]):z.unknown()).max(200);
 if(typeof value==='object')return z.object(Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([key,child])=>{
  const schema=templateSchema(child);
  return [key,['playersButtonUrl','galleryButtonUrl','galleryCardUrl','joinLabel','joinUrl','statutesLabel','unavailableLabel','vision','mission'].includes(key)?schema.default(['vision','mission'].includes(key)?{title:'',description:''}:child):schema];
 })));
 return z.unknown();
}
const schemas=new Map<DocumentKey,z.ZodType>();
export function validateDocument(key:DocumentKey,value:unknown) {
 // Les images Histoire sont désormais stockées dans page_content.image_url.
 // Le modèle de rendu garde src, injecté par le dépôt ou l'aperçu.
 if(key==='histoire'&&value&&typeof value==='object'&&!Array.isArray(value)){
  const image='image' in value?value.image:undefined;
  if(image==null||(typeof image==='object'&&!Array.isArray(image)))value={...value,image:{src:null,alt:'',caption:'',...image as Record<string,unknown>}};
 }
 let schema=schemas.get(key);
 if(!schema){schema=templateSchema(documentTemplates[key]);schemas.set(key,schema);}
 return schema.parse(value);
}
