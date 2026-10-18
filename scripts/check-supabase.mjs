import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import nextEnv from '@next/env';
import {createClient} from '@supabase/supabase-js';
nextEnv.loadEnvConfig(process.cwd());

// Réservé à un projet de test jetable, jamais au projet de production.
if(process.env.AJT_RUN_MUTATION_TESTS!=='I_CONFIRM_DISPOSABLE_PROJECT')throw new Error('Configurer explicitement AJT_RUN_MUTATION_TESTS=I_CONFIRM_DISPOSABLE_PROJECT sur un projet de test jetable.');
const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','AJT_TEST_EDITOR_EMAIL','AJT_TEST_EDITOR_PASSWORD','AJT_TEST_SUPER_EMAIL','AJT_TEST_SUPER_PASSWORD'];
for(const key of required)if(!process.env[key])throw new Error(`Variable de test manquante : ${key}`);
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const options={auth:{persistSession:false,autoRefreshToken:false}};
const anon=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options);
const editor=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options);
const superAdmin=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,options);
const service=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,options);
const created=[];let uploaded;let settingsBefore;let documentBefore;
async function insert(table,data,client=editor){const id=randomUUID();const response=await client.from(table).insert({id,...data}).select('*').single();assert.equal(response.error,null,`Insertion ${table} refusée (${response.error?.code??''})`);created.push([table,id]);return response.data;}
async function login(client,prefix){const result=await client.auth.signInWithPassword({email:process.env[`AJT_TEST_${prefix}_EMAIL`],password:process.env[`AJT_TEST_${prefix}_PASSWORD`]});assert.equal(result.error,null,`Connexion ${prefix} refusée`);return result.data.user;}
try{
 const editorUser=await login(editor,'EDITOR');const superUser=await login(superAdmin,'SUPER');
 assert.equal((await editor.rpc('current_admin_role')).data,'editor');
 assert.equal((await superAdmin.rpc('current_admin_role')).data,'super_admin');
 assert.ok((await editor.from('admin_users').select('*')).data?.length===0);
 assert.ok((await anon.from('admin_users').select('*')).error);
 assert.deepEqual((await anon.from('contact_messages').select('*')).data,[]);
 assert.ok((await anon.from('players').insert({full_name:'Interdit',position:'Gardiens'})).error);
 assert.ok((await editor.rpc('set_admin_role',{target_user:editorUser.id,new_role:'super_admin'})).error);
 const administrators=await superAdmin.from('admin_users').select('*');assert.equal(administrators.error,null);
 if(administrators.data.filter(row=>row.role==='super_admin').length===1)assert.ok((await superAdmin.rpc('set_admin_role',{target_user:superUser.id,new_role:null})).error);
 console.log('PASS Supabase : Auth et permissions visiteur / editor / super_admin.');

 const season=await insert('seasons',{name:'TEST AUTOMATISÉ',is_visible:false});
 const competition=await insert('competitions',{name:'TEST AUTOMATISÉ',season_id:season.id,is_visible:false,win_points:3,draw_points:1,loss_points:0});
 const club=await service.from('teams').select('*').eq('is_ajt',true).single();assert.equal(club.error,null);
 const opponent=await insert('teams',{name:'TEST AUTOMATISÉ',is_visible:false});
 const player=await insert('players',{full_name:'TEST AUTOMATISÉ',position:'Gardiens',shirt_number:99,is_visible:false,is_active:true});
 assert.deepEqual((await anon.from('players').select('id').eq('id',player.id)).data,[]);
 const stats=await insert('player_statistics',{player_id:player.id,season_id:season.id,matches_played:2,goals:0,assists:1,clean_sheets:1});
 const changedStats=await editor.from('player_statistics').update({matches_played:3}).eq('id',stats.id).select('matches_played').single();assert.equal(changedStats.data.matches_played,3);
 const director=await insert('bureau_members',{full_name:'TEST AUTOMATISÉ',role_fr:'Conseiller',is_visible:false});assert.ok(director.id);
 const match=await insert('matches',{season_id:season.id,competition_id:competition.id,home_team_id:club.data.id,away_team_id:opponent.id,match_date:new Date(Date.now()+86400000).toISOString(),status:'scheduled',is_visible:false});
 assert.equal((await editor.from('matches').update({status:'finished',home_score:3,away_score:1}).eq('id',match.id)).error,null);
 const standings=await insert('standings',{season_id:season.id,competition_id:competition.id,team_id:club.data.id,position:1,played:1,wins:1,draws:0,losses:0,goals_for:3,goals_against:1,points:7,points_mode:'manual',is_visible:false});
 assert.equal(standings.goal_difference,2);assert.equal(standings.points,7);
 const calculated=await editor.from('standings').update({points_mode:'calculated'}).eq('id',standings.id).select('points').single();assert.equal(calculated.data.points,3);
 console.log('PASS Supabase : joueur/statistiques, bureau, match/résultat et classement persistés.');

 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2p0AAAAASUVORK5CYII=','base64');
 uploaded=`${editorUser.id}/${randomUUID()}.png`;
 assert.ok((await anon.storage.from('gallery').upload(`00000000-0000-4000-8000-000000000000/${randomUUID()}.png`,bytes,{contentType:'image/png'})).error);
 assert.equal((await editor.storage.from('gallery').upload(uploaded,bytes,{contentType:'image/png'})).error,null);
 const imageUrl=editor.storage.from('gallery').getPublicUrl(uploaded).data.publicUrl;
 const category=await insert('gallery_categories',{name_fr:'TEST AUTOMATISÉ',slug:`test-${randomUUID()}`,is_visible:false});
 const image=await insert('gallery_images',{category_id:category.id,image_url:imageUrl,title_fr:'TEST AUTOMATISÉ',is_visible:false});
 assert.equal((await editor.rpc('media_is_referenced',{p_url:imageUrl})).data,true);
 assert.equal((await editor.from('gallery_images').delete().eq('id',image.id)).error,null);
 assert.equal((await editor.rpc('media_is_referenced',{p_url:imageUrl})).data,false);
 console.log('PASS Supabase : Storage visiteur refusé, upload admin et références de photographie.');

 settingsBefore=(await service.from('site_settings').select('*').single()).data;assert.ok(settingsBefore);
 documentBefore=(await service.from('page_content').select('*').eq('page_key','home').eq('section_key','config').single()).data;assert.ok(documentBefore);
 const changed=structuredClone(documentBefore.settings_json);changed.fr.heroTitle='TEST AUTOMATISÉ HERO';changed.fr.introduction='TEST AUTOMATISÉ TEXTE';
 assert.equal((await editor.from('page_content').update({settings_json:changed}).eq('id',documentBefore.id)).error,null);
 assert.equal((await editor.from('site_settings').update({logo_url:imageUrl,primary_color:'#304395'}).eq('id',settingsBefore.id)).error,null);
 const reload=await anon.from('page_content').select('settings_json').eq('id',documentBefore.id).single();assert.equal(reload.data.settings_json.fr.heroTitle,'TEST AUTOMATISÉ HERO');
 const appearance=await anon.from('site_settings').select('logo_url,primary_color').single();assert.equal(appearance.data.logo_url,imageUrl);assert.equal(appearance.data.primary_color,'#304395');
 console.log('PASS Supabase : Hero, texte, logo et apparence visibles après relecture anonyme.');

 const contact=await service.rpc('submit_contact',{p_key:randomUUID().replaceAll('-','').repeat(2),p_full_name:'TEST AUTOMATISÉ',p_email:'test@example.invalid',p_phone:'',p_subject:'TEST AUTOMATISÉ',p_message:'Message synthétique du test de persistance.'});assert.equal(contact.error,null);created.push(['contact_messages',contact.data]);
 assert.ok((await editor.from('contact_messages').select('id').eq('id',contact.data)).data?.length===1);
 assert.deepEqual((await anon.from('contact_messages').select('id').eq('id',contact.data)).data,[]);
 console.log('PASS Supabase : contact persistant et privé.');
}finally{
 if(documentBefore)await service.from('page_content').update({settings_json:documentBefore.settings_json}).eq('id',documentBefore.id);
 if(settingsBefore)await service.from('site_settings').update({logo_url:settingsBefore.logo_url,primary_color:settingsBefore.primary_color}).eq('id',settingsBefore.id);
 for(const [table,id]of created.reverse())await service.from(table).delete().eq('id',id);
 if(uploaded)await editor.storage.from('gallery').remove([uploaded]);
 await editor.auth.signOut();await superAdmin.auth.signOut();
}
