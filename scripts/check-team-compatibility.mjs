import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

let failures={},warnings=[];
const rows={
 page_content:[{page_key:'equipe',section_key:'config',settings_json:{fr:{season:'2026',hero:{title:'Équipe'}},ar:{}}}],
 players:[{id:'player',full_name:'Joueur existant',position:'Gardiens',sort_order:0,is_active:true,is_visible:true,category_id:null}],
 player_statistics:[],staff_members:[],seasons:[],team_categories:[],
};
const source=readFileSync('lib/data/supabase-repository.ts','utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const loadedModule={exports:{}};
const require=id=>{
 if(id==='server-only')return {};
 if(id==='react')return {cache:fn=>fn};
 if(id==='next/navigation')return {notFound(){throw new Error('not found');}};
 if(id==='@/lib/supabase/public')return {createPublicClient:()=>({from:table=>({select:async()=>({data:rows[table]??[],error:failures[table]??null})})})};
 if(id==='@/lib/locale')return {getLocale:async()=>'fr'};
 if(id==='./public-settings')return {};
 if(id==='./history-images')return {};
 if(id==='./documents')return {documentTemplates:{equipe:{}},validateDocument:(_key,value)=>value};
 throw new Error(`Unexpected module ${id}`);
};
new Function('require','exports','module',outputText)(require,loadedModule.exports,loadedModule);
const {loadTeam}=loadedModule.exports;
const warn=console.warn;console.warn=(...args)=>warnings.push(args);
try{
 for(const code of ['PGRST205','42P01']){
  failures={team_categories:{code}};
  const team=await loadTeam();assert.equal(team.players.length,1);assert.deepEqual(team.categories,[]);
 }
 assert.equal(warnings.length,2);
 failures={team_categories:{code:'42501'}};
 await assert.rejects(loadTeam(),/team_categories \[42501\]/);
 failures={team_categories:{code:'',message:'fetch failed'}};
 await assert.rejects(loadTeam(),/team_categories \[UNKNOWN\]/);
 failures={players:{code:'42P01'}};
 await assert.rejects(loadTeam(),/players \[42P01\]/);
 failures={};rows.players[0].category_id='category';
 rows.team_categories=[{id:'category',name_fr:'Gardiens',slug:'gardiens',sort_order:0,is_visible:true}];
 assert.equal((await loadTeam()).players.length,1);
 rows.team_categories[0].is_visible=false;
 assert.equal((await loadTeam()).players.length,0);
 failures={team_categories:{code:'PGRST205'}};
 assert.equal((await loadTeam()).players.length,0,'Une catégorie non vérifiable ne doit pas exposer ses joueurs');
}finally{console.warn=warn;}
console.log('PASS équipe : migration absente, joueurs existants, catégories masquées, permissions et erreurs réseau.');
