import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const files = ['supabase/migrations/001_initial_schema','supabase/migrations/002_content_tables','supabase/migrations/003_sports_tables','supabase/migrations/007_branding_and_publication','sql/team_management','supabase/migrations/010_bureau_bilingual_names'];
const sql = files.map(name => readFileSync(`${name}.sql`,'utf8')).join('\n');
function splitColumns(body) {
  const out=[]; let start=0, depth=0, quoted=false;
  for(let i=0;i<body.length;i++){ const c=body[i]; if(c==="'"){ if(quoted&&body[i+1]==="'"){i++;continue;} quoted=!quoted; } if(!quoted){if(c==='(')depth++;if(c===')')depth--;if(c===','&&depth===0){out.push(body.slice(start,i).trim());start=i+1;}} }
  out.push(body.slice(start).trim());return out;
}
const tables={};
for(const match of sql.matchAll(/create table(?: if not exists)? public\.(\w+)\s*\(([\s\S]*?)\n\);/g)) {
  tables[match[1]]=splitColumns(match[2]).flatMap(def=>{
    const m=def.match(/^(\w+)\s+(uuid|text|integer|boolean|jsonb|timestamptz|date|numeric)(\(\d+(?:,\d+)?\))?(\[\])?/);
    if(!m)return [];
    const type=m[4]?(m[2]==='integer'?'number[]':'string[]'):({integer:'number',boolean:'boolean',jsonb:'Json',numeric:'number'}[m[2]]??'string');
    return [{name:m[1],type,nullable:!(/not null|primary key|generated always/i.test(def)),generated:/generated always/.test(def),defaulted:/default|primary key/.test(def),sqlType:m[2]}];
  });
}
// Colonnes ajoutées par les migrations incrémentales, sans modifier le schéma initial.
const alterTypes={text:'string',uuid:'string',boolean:'boolean',integer:'number',numeric:'number',timestamptz:'string',date:'string'};
for(const match of sql.matchAll(/alter table public\.(\w+) add column if not exists (\w+)\s+([a-z]+)([^;]*);/g)) {
 const [,tableName,columnName,sqlType,tail]=match;
 if(!tables[tableName]||!alterTypes[sqlType]||tables[tableName].some(column=>column.name===columnName))continue;
 tables[tableName].push({name:columnName,type:alterTypes[sqlType],nullable:!/\bnot null\b/i.test(tail),generated:false,defaulted:/\bdefault\b/i.test(tail),sqlType});
}
let types=`// Contrat généré depuis les migrations. Régénérer avec npm run db:types.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport interface Database { public: { Tables: {\n`;
for(const [name,columns] of Object.entries(tables)) {
  const row=columns.map(c=>`${c.name}: ${c.type}${c.nullable?' | null':''};`).join(' ');
  const insert=columns.filter(c=>!c.generated).map(c=>`${c.name}${c.defaulted||c.nullable?'?':''}: ${c.type}${c.nullable?' | null':''};`).join(' ');
  types+=`${name}: { Row: { ${row} }; Insert: { ${insert} }; Update: Partial<{ ${insert} }>; Relationships: [] };\n`;
}
types+=`}; Views: Record<never, never>; Enums: Record<never, never>; CompositeTypes: Record<never, never>; Functions: {
current_admin_role: { Args: Record<never, never>; Returns: string | null };
is_admin: { Args: Record<never, never>; Returns: boolean };
is_super_admin: { Args: Record<never, never>; Returns: boolean };
move_content: { Args: { p_table:string; p_id:string; p_direction:string }; Returns:undefined };
media_is_referenced: { Args: { p_url:string }; Returns:boolean };
is_safe_url: { Args: { value:string|null }; Returns:boolean };
valid_document_links: { Args: { value:Json }; Returns:boolean };
set_admin_role: { Args: { target_user: string; new_role: string | null }; Returns: undefined };
submit_contact: { Args: { p_key:string; p_full_name:string; p_email:string; p_phone:string; p_subject:string; p_message:string }; Returns:string };
} } };\nexport type TableName = keyof Database['public']['Tables'];\nexport type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];\n`;
mkdirSync('lib/supabase',{recursive:true});writeFileSync('lib/supabase/database.ts',types);
const excluded=['admin_users','activity_logs','media_assets'];
const skip=['id','created_at','updated_at','singleton','goal_difference'];
const labels={club_name:'Nom du club',club_name_ar:'Nom arabe',full_name:'Nom complet',full_name_ar:'Nom complet en arabe',full_name_fr:'Nom complet en français',title_fr:'Titre FR',title_ar:'Titre AR',description_fr:'Description FR',description_ar:'Description AR',is_visible:'Visible',sort_order:'Ordre',is_featured:'Mis en avant',is_president:'Président',is_active:'Actif',is_captain:'Capitaine',is_vice_captain:'Vice-capitaine',shirt_number:'Numéro',position:'Poste / rang',photo_url:'Photo',image_url:'Image',logo_url:'Logo',favicon_url:'Favicon',settings_json:'Contenu détaillé',is_current:'Saison actuelle',home_score:'Score domicile',away_score:'Score extérieur',points_mode:'Mode des points',biography_fr:'Biographie FR',biography_ar:'Biographie AR',label_fr:'Libellé FR',label_ar:'Libellé AR',href:'Destination',page_key:'Page',section_key:'Section',category_id:'Catégorie',playing_role:'Poste précis',height_cm:'Taille (cm)',preferred_foot:'Pied préféré',nationality:'Nationalité',date_of_birth:'Date de naissance',name_fr:'Nom FR',name_ar:'Nom AR',slug:'Identifiant',role_fr:'Rôle FR',role_ar:'Rôle AR',created_at:'Créé le',updated_at:'Mis à jour le'};
Object.assign(labels,{header_logo_url:'Logo du header (facultatif)',footer_logo_url:'Logo du footer (facultatif)'});
const choices={position:['Gardiens','Défenseurs','Milieux','Attaquants'],status:['scheduled','live','finished','postponed','cancelled'],heading_font:['Anton','Oswald','Cairo'],body_font:['Poppins','Cairo'],points_mode:['manual','calculated']};
const references={player_id:'players',season_id:'seasons',competition_id:'competitions',team_id:'teams',home_team_id:'teams',away_team_id:'teams',category_id:'team_categories'};
const buckets={players:'players',staff_members:'staff',bureau_members:'bureau',gallery_images:'gallery',teams:'match-assets',competitions:'match-assets',team_categories:'players'};
const titles={site_settings:'Paramètres du site',navigation_items:'Navigation',page_content:'Textes et sections',homepage_sections:'Ordre des sections de l’accueil',history_milestones:'Étapes historiques',club_objectives:'Objectifs',club_values:'Valeurs',team_categories:'Catégories de l’équipe',players:'Joueurs',staff_members:'Staff',bureau_members:'Bureau',gallery_categories:'Catégories',gallery_images:'Photographies',contact_messages:'Messages',seasons:'Saisons',competitions:'Compétitions',teams:'Équipes',player_statistics:'Statistiques des joueurs',matches:'Matchs',standings:'Classement',trophies:'Palmarès'};
const collections={};
for(const [name,columns] of Object.entries(tables)){
 if(excluded.includes(name))continue;
 collections[name]={label:titles[name]??name,bucket:buckets[name]??'club-assets',fields:columns.filter(c=>!skip.includes(c.name)).map(c=>{
 let type=c.type==='boolean'?'boolean':c.type==='number'?'number':c.sqlType==='jsonb'?'json':c.type.endsWith('[]')?'numbers':c.name.endsWith('_color')?'color':references[c.name]?'reference':c.sqlType==='date'?'date':c.sqlType==='timestamptz'?'datetime-local':c.name.includes('email')?'email':/(_url|href)$/.test(c.name)?'url':/(content|description|biography|message|footer_text)/.test(c.name)?'textarea':'text';
 const f={name:c.name,label:labels[c.name]??c.name.replaceAll('_',' '),type,required:!c.nullable&&!c.defaulted,nullable:c.nullable};
 if(references[c.name])f.reference=name==='gallery_images'&&c.name==='category_id'?'gallery_categories':references[c.name];
  if(choices[c.name]&&!(c.name==='position'&&name==='standings')){f.type='select';f.options=choices[c.name];}
  if(name==='players'&&c.name==='preferred_foot'){f.type='select';f.options=['Droit','Gauche'];}
 if(name==='contact_messages'&&c.name==='status'){f.type='select';f.options=['new','read','processed','archived'];}
 if(name==='club_objectives'&&c.name==='icon'){f.type='select';f.options=['youth','ball','team','trophy'];}
 if(name==='club_values'&&c.name==='icon'){f.type='select';f.options=['respect','rigor','solidarity','passion'];}
 return f;
 })};
}
writeFileSync('lib/admin/collections.generated.ts',`// Généré depuis les migrations.\nimport type { CollectionDefinition } from './types';\nexport const collections = ${JSON.stringify(collections,null,2)} as const satisfies Record<string,CollectionDefinition>;\nexport type EditableTable = keyof typeof collections;\n`);
console.log(`${Object.keys(tables).length} tables typées, ${Object.keys(collections).length} collections administrables.`);
