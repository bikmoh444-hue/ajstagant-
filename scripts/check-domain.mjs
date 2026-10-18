import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Exécuter les fonctions métier TypeScript sans ajouter de runner de test.
const nodeRequire = createRequire(import.meta.url);
function loadModule(filename) {
  const source = readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const loaded = { exports: {} };
  const require = id => id === 'server-only' ? {} : nodeRequire(id);
  new Function('require', 'exports', 'module', outputText)(require, loaded.exports, loaded);
  return loaded.exports;
}

const { matchResult, goalDifference, configuredLink, matchDate } = loadModule('lib/utils/sports.ts');
const match = { id: 'test', status: 'finished', home_team_id: 'club', away_team_id: 'other', home_score: 3, away_score: 1 };
assert.equal(matchResult(match, 'club').outcome, 'V');
assert.equal(matchResult({ ...match, home_score: 0, away_score: 1 }, 'club').outcome, 'D');
assert.equal(matchResult({ ...match, home_team_id: 'other', away_team_id: 'club' }, 'club').outcome, 'D');
assert.equal(matchResult({ ...match, home_team_id: 'other', away_team_id: 'club', home_score: 1, away_score: 3 }, 'club').outcome, 'V');
assert.equal(matchResult({ ...match, home_score: 0, away_score: 0 }, 'club').outcome, 'N');
assert.equal(matchResult({ ...match, away_score: null }, 'club'), null);
for (const status of ['scheduled', 'live', 'postponed', 'cancelled']) assert.equal(matchResult({ ...match, status }, 'club'), null);
assert.equal(matchResult(match, 'unrelated').outcome, null);
assert.equal(goalDifference({ goals_for: 4, goals_against: 9 }), -5);
assert.equal(configuredLink(null), null);
assert.equal(configuredLink('javascript:alert(1)'), null);
assert.equal(configuredLink('https://example.com/tickets'), 'https://example.com/tickets');
assert.equal(matchDate(null, 'UTC').time, 'Heure à confirmer');
assert.equal(matchDate('invalid', 'UTC').date, 'Date à confirmer');
assert.equal(matchDate('2026-10-17T18:30:00Z', 'UTC').time, '18:30');

const { contactSchema } = loadModule('lib/contact/schema.ts');
const {playerAge}=loadModule('lib/utils/content.ts');
assert.equal(playerAge('2000-10-19',new Date('2026-10-18T12:00:00Z')),25);
assert.equal(playerAge('2000-10-18',new Date('2026-10-18T12:00:00Z')),26);
assert.equal(playerAge('2027-01-01',new Date('2026-10-18T12:00:00Z')),null);
assert.equal(playerAge('2000-02-31'),null);
const {canOptimizeImage}=loadModule('lib/utils/images.ts');
const previousImageHost=process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_URL='https://test.supabase.co';
try{
 assert.equal(canOptimizeImage('https://test.supabase.co/storage/v1/object/public/players/photo.jpg'),true);
 assert.equal(canOptimizeImage('https://test.supabase.co/storage/v1/object/sign/players/photo.jpg?token=secret'),false);
 assert.equal(canOptimizeImage('https://another.example/image.jpg'),false);
 assert.equal(canOptimizeImage('/images/starter/logo.svg'),false);
 assert.equal(canOptimizeImage('/images/photo.jpg'),true);
}finally{if(previousImageHost===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previousImageHost;}
const input = { name: '  Test local  ', email: 'test@example.com', phone: '', subject: ' Test de contact ', message: 'Un message de test suffisamment long.', website: '' };
assert.equal(contactSchema.parse(input).name, 'Test local');
assert.equal(contactSchema.parse({...input,subject:'x'}).subject,'Message du site');
assert.equal(contactSchema.safeParse({name:'Test',email:'test@example.com',message:'Message avec trois champs seulement.'}).success,true);
assert.equal(contactSchema.parse({name:'Test',email:'test@example.com',message:'Message avec trois champs seulement.'}).subject,'Message du site');
assert.equal(contactSchema.safeParse({ ...input, email: 'invalide' }).success, false);
assert.equal(contactSchema.safeParse({ ...input, name: ' ' }).success, false);
assert.equal(contactSchema.safeParse({ ...input, phone: 'pas un téléphone' }).success, false);
assert.equal(contactSchema.safeParse({ ...input, phone: '+212 600 000 000' }).success, true);
assert.equal(contactSchema.safeParse({ ...input, website: 'robot.example' }).success, false);
assert.equal(contactSchema.safeParse({ ...input, message: 'x'.repeat(5001) }).success, false);

const { contactRateLimit } = loadModule('lib/contact/rate-limit.ts');
const previous = process.env.CONTACT_TRUST_PROXY;
try {
  process.env.CONTACT_TRUST_PROXY = 'false';
  for (let index = 0; index < 5; index++) assert.equal(contactRateLimit(new Headers({ 'x-forwarded-for': `192.0.2.${index}` }), 1000).allowed, true);
  // Changer un en-tête non fiable ne contourne pas le quota partagé.
  const rejected = contactRateLimit(new Headers({ 'x-forwarded-for': '192.0.2.250' }), 1000);
  assert.equal(rejected.allowed, false);
  assert.ok(rejected.retryAfter > 0);
  assert.equal(contactRateLimit(new Headers(), 1_000_000).allowed, true);
} finally { if (previous === undefined) delete process.env.CONTACT_TRUST_PROXY; else process.env.CONTACT_TRUST_PROXY = previous; }
console.log('PASS métier : V/N/D domicile et extérieur, scores absents, statuts, liens, dates, Zod et quota.');
