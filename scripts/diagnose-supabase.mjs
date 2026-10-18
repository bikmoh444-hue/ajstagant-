import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());

// Lecture seule. Ne journaliser ni les clés, ni les mots de passe, ni les sessions.
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const report={
 configuration:{url:!!url,anonymousKey:!!key,serverKey:!!process.env.SUPABASE_SERVICE_ROLE_KEY,demo:process.env.AJT_DATA_SOURCE==='demo'},
 checks:[],
};
if(!url||!key||!URL.canParse(url)){
 report.checks.push({check:'configuration',ok:false,message:'URL ou clé publique manquante/invalide.'});
} else {
 const probes=[
  ['Auth','/auth/v1/settings'],
  ['Paramètres et migration 007','/rest/v1/site_settings?select=id,logo_url,header_logo_url,footer_logo_url,favicon_url&limit=1'],
  ['Documents publics','/rest/v1/page_content?select=page_key,section_key&limit=100'],
  ['Catégories équipe — migration 008','/rest/v1/team_categories?select=id,name_fr,name_ar,slug,sort_order,is_visible&limit=1'],
  ['Colonnes joueurs — migration 008','/rest/v1/players?select=id,category_id,playing_role,is_vice_captain&limit=1'],
  ['Rôles RPC','/rest/v1/rpc/current_admin_role'],
 ];
 await Promise.all(probes.map(async([check,endpoint])=>{
  try{
   const response=await fetch(new URL(endpoint,url),{headers:{apikey:key},signal:AbortSignal.timeout(8000)});
   const body=await response.json();
   const result={check,ok:response.ok,status:response.status};
   if(!response.ok)result.code=body.code??body.error_code??'API_ERROR';
   if(Array.isArray(body))result.rows=body.length;
   if(check==='Auth'&&response.ok)result.emailProvider=body.external?.email;
   report.checks.push(result);
  }catch(error){report.checks.push({check,ok:false,code:error.cause?.code??error.name,message:'Service inaccessible depuis cet environnement.'});}
 }));
}
console.log(JSON.stringify(report,null,2));
console.log('Ce diagnostic anonyme ne vérifie pas le rôle de votre compte. Exécutez sql/diagnose-admin.sql avec votre UUID dans SQL Editor.');
if(report.checks.some(check=>!check.ok))process.exitCode=1;
