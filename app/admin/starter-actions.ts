'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { starterDocuments, starterImages, starterObjectives, completeStarterContent } from '@/lib/admin/starter-content';
import type { MutationResult } from '@/lib/admin/types';
import type { Json } from '@/lib/supabase/database';

export async function prepareStarterContent():Promise<MutationResult>{
 const {client}=await requireAdmin();
 try{
  const check=(error:{message:string}|null)=>{if(error)throw new Error('starter-write');};
  const {data:documents,error:readError}=await client.from('page_content').select('*').eq('section_key','config');check(readError);
  for(const [page_key,settings] of Object.entries(starterDocuments())){
   const old=documents?.find(row=>row.page_key===page_key);
   if(old){
    const next=completeStarterContent(old.settings_json,settings) as Json;
    if(JSON.stringify(next)!==JSON.stringify(old.settings_json)){
     const {error}=await client.from('page_content').update({settings_json:next}).eq('id',old.id).eq('updated_at',old.updated_at).select('id').single();check(error);
    }
   }else{const {error}=await client.from('page_content').upsert({page_key,section_key:'config',settings_json:settings as Json,is_visible:true},{onConflict:'page_key,section_key',ignoreDuplicates:true});check(error);}
  }
  const {data:settings,error:settingsError}=await client.from('site_settings').select('*').maybeSingle();check(settingsError);
  if(settings){const {error}=await client.from('site_settings').update({logo_url:settings.logo_url||starterImages.logo,favicon_url:settings.favicon_url||starterImages.logo,seo_image_url:settings.seo_image_url||starterImages.hero}).eq('id',settings.id).eq('updated_at',settings.updated_at).select('id').single();check(error);}
  else{const {error}=await client.from('site_settings').insert({club_name:'A.J.S TAGANT',club_name_ar:'الجمعية الشبابية لرياضة تكانت',slogan:'Plus qu’une équipe, une famille.',slogan_ar:'أكثر من فريق، عائلة واحدة',address:'Tagant, Maroc',address_ar:'تكانت، المغرب',logo_url:starterImages.logo,favicon_url:starterImages.logo,seo_image_url:starterImages.hero,footer_text:'A.J.S TAGANT. Tous droits réservés.'});check(error);}
  const sections=['hero','info','about','history','objectives','players','gallery','bureau','band','contact'];
  check((await client.from('homepage_sections').upsert(sections.map((section_key,index)=>({section_key,sort_order:index*10,is_visible:true})),{onConflict:'section_key',ignoreDuplicates:true})).error);
  const nav=[['Accueil','الرئيسية','/'],['Histoire','تاريخنا','/histoire'],['Équipe','الفريق','/equipe'],['Matchs & Classement','المباريات والترتيب','/matchs'],['Galerie','معرض الصور','/galerie'],['Bureau directeur','المكتب المسير','/bureau'],['Contact','اتصل بنا','/contact']];
  const {data:links,error:linksError}=await client.from('navigation_items').select('href');check(linksError);
  const missing=nav.flatMap(([label_fr,label_ar,href],index)=>links?.some(link=>link.href===href)?[]:[{label_fr,label_ar,href,sort_order:index*10}]);
  if(missing.length)check((await client.from('navigation_items').insert(missing)).error);
  const objectives=await client.from('club_objectives').select('id',{count:'exact',head:true});check(objectives.error);
  if(!objectives.count)check((await client.from('club_objectives').insert(starterObjectives.map((row,index)=>({...row,sort_order:index*10})))).error);
  check((await client.from('gallery_categories').upsert({slug:'illustrations',name_fr:'Illustrations du club',name_ar:'رسومات تقديمية',is_visible:true},{onConflict:'slug',ignoreDuplicates:true})).error);
  const category=await client.from('gallery_categories').select('id').eq('slug','illustrations').single();check(category.error);
  const images=await client.from('gallery_images').select('image_url');check(images.error);
  const gallery=[{image_url:starterImages.hero,title_fr:'Illustration — Sur le terrain',title_ar:'رسم توضيحي — في الملعب'},{image_url:starterImages.about,title_fr:'Illustration — La force du collectif',title_ar:'رسم توضيحي — قوة الفريق'},{image_url:starterImages.history,title_fr:'Illustration — À l’entraînement',title_ar:'رسم توضيحي — في التدريب'}].filter(row=>!images.data?.some(old=>old.image_url===row.image_url));
  if(gallery.length)check((await client.from('gallery_images').insert(gallery.map((row,index)=>({...row,category_id:category.data!.id,description_fr:'Illustration de départ à remplacer par vos photos.',description_ar:'رسم تقديمي يمكن تعويضه بصور الجمعية.',sort_order:index*10,is_visible:true,is_featured:true})))).error);
  const players=await client.from('players').select('id',{count:'exact',head:true});check(players.error);
  if(!players.count)check((await client.from('players').insert((['Gardiens','Défenseurs','Milieux','Attaquants'] as const).map((position,index)=>({
    full_name:`Exemple — Joueur ${index+1}`,position,shirt_number:[1,4,8,9][index],photo_url:starterImages.player,
    sort_order:index*10,is_visible:false,is_active:true,is_featured:true,
    category_id: null
  })))).error);
  const staff=await client.from('staff_members').select('id',{count:'exact',head:true});check(staff.error);
  if(!staff.count)check((await client.from('staff_members').insert({full_name:'Exemple — Entraîneur à renseigner',role_fr:'Entraîneur',role_ar:'مدرب',biography_fr:'Présentez ici votre entraîneur et son parcours.',photo_url:starterImages.about,is_visible:false})).error);
  const bureau=await client.from('bureau_members').select('id',{count:'exact',head:true});check(bureau.error);
  if(!bureau.count)check((await client.from('bureau_members').insert(['Président','Vice-président','Secrétaire général','Trésorier'].map((role_fr,index)=>({full_name:'Exemple — Nom à renseigner',role_fr,sort_order:index*10,photo_url:starterImages.about,is_president:index===0,is_featured:true,is_visible:false})))).error);
  const milestones=await client.from('history_milestones').select('id',{count:'exact',head:true});check(milestones.error);
  if(!milestones.count)check((await client.from('history_milestones').insert([{title_fr:'Une passion commune',title_ar:'شغف مشترك',description_fr:'Le futsal et l’envie de partager nous rassemblent.',description_ar:'تجمعنا كرة القدم داخل القاعة والرغبة في المشاركة.',sort_order:0},{title_fr:'Un projet collectif',title_ar:'مشروع جماعي',description_fr:'Progresser ensemble, sur le terrain et dans la vie du club.',description_ar:'التطور معا في الملعب وفي حياة الجمعية.',sort_order:10}])).error);
  const values=await client.from('club_values').select('id',{count:'exact',head:true});check(values.error);
  if(!values.count)check((await client.from('club_values').insert([{icon:'respect',title_fr:'Respect',title_ar:'الاحترام',description_fr:'Respecter les autres, les règles et le jeu.',description_ar:'احترام الآخرين والقواعد واللعبة.',sort_order:0},{icon:'rigor',title_fr:'Engagement',title_ar:'الالتزام',description_fr:'Donner le meilleur de soi à chaque séance.',description_ar:'تقديم الأفضل في كل حصة.',sort_order:10},{icon:'solidarity',title_fr:'Solidarité',title_ar:'التضامن',description_fr:'S’entraider pour avancer ensemble.',description_ar:'التعاون من أجل التقدم معا.',sort_order:20},{icon:'passion',title_fr:'Passion',title_ar:'الشغف',description_fr:'Garder le plaisir du sport au cœur du projet.',description_ar:'جعل متعة الرياضة في قلب المشروع.',sort_order:30}])).error);
  const matches=await client.from('matches').select('id',{count:'exact',head:true});check(matches.error);
  if(!matches.count){
   let season=(await client.from('seasons').select('id').eq('name','Exemple — Saison à personnaliser').maybeSingle()).data;
   if(!season){const created=await client.from('seasons').insert({name:'Exemple — Saison à personnaliser',is_visible:false}).select('id').single();check(created.error);season=created.data;}
   let competition=(await client.from('competitions').select('id').eq('season_id',season!.id).eq('name','Exemple — Compétition').maybeSingle()).data;
   if(!competition){const created=await client.from('competitions').insert({name:'Exemple — Compétition',season_id:season!.id,is_visible:false}).select('id').single();check(created.error);competition=created.data;}
   let club=(await client.from('teams').select('id').eq('is_ajt',true).maybeSingle()).data;
   if(!club){const created=await client.from('teams').insert({name:'A.J.S TAGANT',short_name:'A.J.S TAGANT',is_ajt:true}).select('id').single();check(created.error);club=created.data;}
   let opponent=(await client.from('teams').select('id').eq('name','Exemple — Adversaire').maybeSingle()).data;
   if(!opponent){const created=await client.from('teams').insert({name:'Exemple — Adversaire',is_visible:false}).select('id').single();check(created.error);opponent=created.data;}
   check((await client.from('matches').insert({competition_id:competition!.id,season_id:season!.id,home_team_id:club!.id,away_team_id:opponent!.id,status:'scheduled',venue:'Salle à renseigner',is_visible:false})).error);
   const standing=await client.from('standings').select('id',{count:'exact',head:true});check(standing.error);
   if(!standing.count)check((await client.from('standings').insert({competition_id:competition!.id,season_id:season!.id,team_id:club!.id,position:1,is_visible:false})).error);
  }
  revalidatePath('/','layout');revalidatePath('/admin','layout');
  return {ok:true,message:'Contenu prêt : textes, illustrations, logo et fiches exemples. Vos contenus personnalisés sont conservés. Les personnes exemples restent masquées.'};
 }catch{
  revalidatePath('/','layout');revalidatePath('/admin','layout');
  return {ok:false,message:'Préparation interrompue. Certains contenus ont peut-être été ajoutés. Vérifiez Supabase et réessayez : les contenus existants seront conservés.'};
 }
}
