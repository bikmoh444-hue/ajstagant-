import { documentTemplates, type DocumentKey } from '@/lib/data/documents';
import { localizeDemo } from '@/lib/data/demo-locale';
import type { SiteContent, Media } from '@/lib/types/site';
import type { PageHero, HistoryContent, BureauContent } from '@/lib/types/pages';
import { officialHistory } from '@/lib/data/official-history';

export const starterImages={logo:'/images/starter/logo.svg',hero:'/images/starter/terrain.svg',about:'/images/starter/collectif.svg',history:'/images/starter/entrainement.svg',player:'/images/starter/maillot.svg'};
export function starterDocuments(){
 const result={} as Record<DocumentKey,{fr:unknown;ar:unknown}>;
 for(const key of Object.keys(documentTemplates) as DocumentKey[]){
  const fr=structuredClone(documentTemplates[key]) as unknown as Record<string,unknown>;const ar=localizeDemo(structuredClone(fr),'ar');
  if('is_demo' in fr)fr.is_demo=false;if('is_demo' in ar)ar.is_demo=false;
  if('hero' in fr){(fr.hero as PageHero).description='Découvrez la vie d’A.J.S TAGANT, le futsal et la force du collectif.';(ar.hero as PageHero).description='اكتشفوا حياة الجمعية وشغف كرة القدم داخل القاعة وقوة الفريق.';}
  if(key==='home'){
   const f=fr as unknown as SiteContent&{historyImage:Media},a=ar as unknown as SiteContent&{historyImage:Media};
   f.heroImageUrl=a.heroImageUrl=starterImages.hero;f.aboutImage.src=a.aboutImage.src=starterImages.about;f.historyImage.src=a.historyImage.src=starterImages.history;
   f.aboutImage.alt='Illustration du collectif A.J.S TAGANT';a.aboutImage.alt='رسم توضيحي لروح الفريق';
   f.historyImage.alt='Illustration d’un terrain d’entraînement';a.historyImage.alt='رسم توضيحي لملعب التدريب';
   f.historyContent=['Le futsal nous rassemble autour d’une même envie : jouer, progresser et partager.','À Tagant, nous souhaitons faire vivre un projet collectif ouvert à celles et ceux qui aiment le sport et ses valeurs.'];
   a.introduction='تجمع الجمعية الشبابية لرياضة تكانت محبي كرة القدم داخل القاعة حول قيم الاحترام والتعاون والتطور. هنا، يجمعنا الشغف وتقوينا روح الفريق.';
   a.historyContent=['تجمعنا كرة القدم داخل القاعة حول الرغبة في اللعب والتطور والمشاركة.','في تكانت، نطمح إلى بناء مشروع جماعي مفتوح لكل محبي الرياضة وقيمها.'];
  }
  if(key==='histoire'){
   const f=fr as unknown as HistoryContent,a=ar as unknown as HistoryContent;
   f.image.src=a.image.src=starterImages.history;f.image.alt='Illustration — le futsal à Tagant';a.image.alt='رسم توضيحي لكرة القدم داخل القاعة';
   f.image.caption='Illustration de présentation · à remplacer par vos photos.';a.image.caption='رسم تقديمي يمكن تعويضه بصور الجمعية.';
   Object.assign(f,officialHistory.fr,{future:{...f.future,...officialHistory.fr.future}});
   Object.assign(a,officialHistory.ar,{future:{...a.future,...officialHistory.ar.future}});
  }
  if(key==='bureau'){
   (fr as unknown as BureauContent).introduction='Un projet collectif se construit avec des personnes engagées. Découvrez ici les membres qui accompagnent la vie du club.';
   (ar as unknown as BureauContent).introduction='يقوم المشروع الجماعي على التزام أفراده. تعرفوا هنا على أعضاء المكتب الذين يواكبون حياة الجمعية.';
  }
  result[key]={fr,ar};
 }
 return result;
}
export const starterObjectives=[
 {icon:'youth',title_fr:'Faire grandir les talents',title_ar:'تطوير المواهب',description_fr:'Apprendre, progresser et prendre confiance grâce au sport.',description_ar:'التعلم والتطور وبناء الثقة من خلال الرياضة.'},
 {icon:'ball',title_fr:'Partager la passion du futsal',title_ar:'مشاركة شغف الفوتسال',description_fr:'Faire vivre le football en salle au sein de notre territoire.',description_ar:'تطوير ممارسة كرة القدم داخل القاعة في منطقتنا.'},
 {icon:'team',title_fr:'Construire un collectif',title_ar:'بناء فريق متضامن',description_fr:'Avancer ensemble avec respect, solidarité et engagement.',description_ar:'التقدم معا بالاحترام والتضامن والالتزام.'},
 {icon:'trophy',title_fr:'Se dépasser ensemble',title_ar:'التطور معا',description_fr:'Cultiver l’effort, le plaisir du jeu et l’esprit sportif.',description_ar:'تعزيز العمل ومتعة اللعب والروح الرياضية.'},
];

// Compléter les champs vides/provisoires uniquement, jamais remplacer un contenu personnalisé.
export function completeStarterContent(current:unknown,fallback:unknown,key=''):unknown{
 if(key==='is_demo')return false;
 if(current==null||current==='')return fallback;
 if(typeof current==='string'&&/^(Texte provisoire|Contenu provisoire|محتوى مؤقت|نص مؤقت)/i.test(current))return fallback;
 if(Array.isArray(current)&&Array.isArray(fallback))return current.length?current.map((item,index)=>completeStarterContent(item,fallback[index]??item)):fallback;
 if(current&&fallback&&typeof current==='object'&&typeof fallback==='object'&&!Array.isArray(current)&&!Array.isArray(fallback)){
  const next={...fallback as Record<string,unknown>,...current as Record<string,unknown>};
  for(const [name,value] of Object.entries(fallback))next[name]=completeStarterContent((current as Record<string,unknown>)[name],value,name);
  return next;
 }
 return current;
}
