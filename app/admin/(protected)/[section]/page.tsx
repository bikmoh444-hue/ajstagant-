import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import { adminPages, legacyAdminPages, adminTableLabels } from '@/lib/admin/pages';
import { CollectionManager, type AdminRecord } from '@/components/admin/collection-manager';
import { MediaManager } from '@/components/admin/media-manager';
import { PageContentEditor } from '@/components/admin/page-content-editor';
import Link from 'next/link';
import { collections } from '@/lib/admin/collections.generated';
import type { FieldDefinition } from '@/lib/admin/types';

export default async function Page({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{tab?:string}>}){
 const {section}=await params;const page=adminPages[section]??legacyAdminPages[section];if(!page)notFound();const {tab}=await searchParams;const selected=page.tables.find(table=>table===tab)??page.tables[0];
 const {client}=await requireAdmin();
 const needed=new Set((collections[selected].fields as readonly FieldDefinition[]).flatMap(field=>field.reference?[field.reference]:[]));
 const empty=()=>Promise.resolve({data:[]});
 const [sets,players,seasons,competitions,teams,categories,assets,site,teamCategories]=await Promise.all([
  Promise.all(page.tables.filter(table=>table===selected).map(async table=>{const query=table==='page_content'&&page.pageKey?client.from('page_content').select('*').eq('page_key',page.pageKey):client.from(table).select('*');const {data,error}=await query;if(error)throw new Error('Lecture administrative impossible. Vérifiez les migrations et vos droits.');return {table,rows:(data??[]) as unknown as AdminRecord[]};})),
  needed.has('players')?client.from('players').select('id,full_name'):empty(),needed.has('seasons')?client.from('seasons').select('id,name'):empty(),needed.has('competitions')?client.from('competitions').select('id,name'):empty(),needed.has('teams')?client.from('teams').select('id,name'):empty(),needed.has('gallery_categories')?client.from('gallery_categories').select('id,name_fr'):empty(),
  selected==='gallery_images'||(selected==='site_settings'&&['parametres','apparence'].includes(section))?client.from('media_assets').select('id,public_url,bucket_id').order('created_at',{ascending:false}):Promise.resolve({data:[]}),client.from('site_settings').select('*').single(),
 needed.has('team_categories')?client.from('team_categories').select('id,name_fr').order('sort_order'):Promise.resolve({data:[]}),
 ]);
 const references={team_categories:teamCategories.data?.map(item=>({id:item.id,label:item.name_fr}))??[],players:players.data?.map(item=>({id:item.id,label:item.full_name}))??[],seasons:seasons.data?.map(item=>({id:item.id,label:item.name}))??[],competitions:competitions.data?.map(item=>({id:item.id,label:item.name}))??[],teams:teams.data?.map(item=>({id:item.id,label:item.name}))??[],gallery_categories:categories.data?.map(item=>({id:item.id,label:item.name_fr}))??[]};
 return <><p className="admin-page-intro">Modifiez cette page avec les onglets ci-dessous. Vos changements sont visibles sur le site après enregistrement.</p>
 <nav className="admin-section-tabs" aria-label="Rubriques de la page">{page.tables.map(table=><Link key={table} href={`/admin/${section}?tab=${table}`} aria-current={selected===table?'page':undefined}>{table==='site_settings'&&section==='parametres'?'Logo, icone et identite':adminTableLabels[table]??table}</Link>)}</nav>
 {selected==='gallery_images'&&<MediaManager assets={assets.data??[]} categories={references.gallery_categories}/>}
 {sets.map(set=>set.table==='page_content'?<div key={set.table}>{set.rows.filter(row=>row.section_key==='config').map(row=><PageContentEditor key={row.id} row={row} site={site.data}/>)}{!set.rows.length&&<p className="admin-notice">Preparez le contenu de depart depuis Mon site.</p>}</div>:<CollectionManager site={site.data} key={set.table} table={set.table} rows={[...set.rows].sort((a,b)=>Number(a.sort_order??0)-Number(b.sort_order??0))} references={references} onlyFields={set.table==='site_settings'?page.fields:undefined} pageKey={page.pageKey}/>)}
 </>;
}
