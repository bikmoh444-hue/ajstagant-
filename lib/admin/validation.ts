import { z } from 'zod';
import { collections, type EditableTable } from './collections.generated';
import type { CollectionDefinition } from './types';
export function safeDestination(value:string) {
 if(/^\/(?!\/)/.test(value))return !/[\\\u0000-\u001f]/.test(value);
 try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password;}catch{return false;}
}
export function validateNestedLinks(value:unknown,key=''):boolean {
 if(typeof value==='string'&&/(url|href|src)$/i.test(key)&&value)return safeDestination(value);
 if(Array.isArray(value))return value.every(child=>validateNestedLinks(child,key));
 if(value&&typeof value==='object')return Object.entries(value).every(([k,child])=>validateNestedLinks(child,k));
 return true;
}
export function rowSchema(table:EditableTable) {
 const definition:CollectionDefinition=collections[table];const shape:Record<string,z.ZodType>={};
 for(const field of definition.fields){
  let schema:z.ZodType;
  if(field.type==='boolean')schema=z.boolean();
  else if(field.type==='number')schema=z.number().int().min(field.name==='points'?-10000:0).max(1000000);
  else if(field.type==='numbers')schema=z.array(z.number().int().positive()).max(200);
  else if(field.type==='json')schema=z.record(z.string(),z.unknown()).refine(value=>validateNestedLinks(value),'Une destination de lien est invalide.');
  else if(field.type==='reference')schema=z.uuid();
  else if(field.type==='select')schema=z.string().refine(value=>field.options?.includes(value)??false,'Choix invalide');
  else if(field.type==='color')schema=z.string().regex(/^#[\da-f]{6}$/i,'Couleur hexadécimale requise');
  else if(field.type==='email')schema=z.email().max(254);
  else if(field.type==='url')schema=z.string().max(4000).refine(safeDestination,'Destination non autorisée');
  else if(field.type==='date')schema=z.iso.date();
  else if(field.type==='datetime-local')schema=z.iso.datetime({offset:true});
  else if(field.name==='slug')schema=z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/,'Utilisez des lettres minuscules sans accent, chiffres et tirets.');
  else schema=z.string().trim().min(field.required?1:0).max(field.type==='textarea'?20000:500);
  if(field.nullable)schema=schema.nullable();
  if(!field.required)schema=schema.optional();
  shape[field.name]=schema;
 }
 return z.object(shape).strict().superRefine((data,context)=>{
  if(table==='matches'){
   if(data.home_team_id&&data.home_team_id===data.away_team_id)context.addIssue({code:'custom',path:['away_team_id'],message:'Les deux équipes doivent être différentes.'});
   if(data.status==='finished'&&(data.home_score==null||data.away_score==null))context.addIssue({code:'custom',path:['home_score'],message:'Les deux scores sont requis pour un match terminé.'});
  }
  if(table==='standings'&&typeof data.played==='number'&&data.played!==Number(data.wins??0)+Number(data.draws??0)+Number(data.losses??0))context.addIssue({code:'custom',path:['played'],message:'J doit être égal à V + N + D.'});
  if(data.start_date&&data.end_date&&String(data.end_date)<String(data.start_date))context.addIssue({code:'custom',path:['end_date'],message:'La fin doit suivre le début.'});
  if(data.mandate_start&&data.mandate_end&&String(data.mandate_end)<String(data.mandate_start))context.addIssue({code:'custom',path:['mandate_end'],message:'La fin du mandat doit suivre son début.'});
 });
}
