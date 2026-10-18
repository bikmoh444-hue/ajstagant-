import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const artifacts=[];
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(js|css|map)$/.test(file))artifacts.push(file);}}
walk('.next-production/static');
const secrets=['SUPABASE_SERVICE_ROLE_KEY','CONTACT_RATE_LIMIT_SECRET'].map(key=>process.env[key]).filter(value=>value&&value.length>=16);
const sizes={javascript:0,javascriptGzip:0,css:0,cssGzip:0};
for(const file of artifacts){const bytes=readFileSync(file),source=bytes.toString('utf8');for(const secret of secrets)assert.ok(!source.includes(secret),'Une valeur secrète ne doit jamais apparaître dans les fichiers client');if(file.endsWith('.js')){sizes.javascript+=bytes.length;sizes.javascriptGzip+=gzipSync(bytes).length;}if(file.endsWith('.css')){sizes.css+=bytes.length;sizes.cssGzip+=gzipSync(bytes).length;}}
const lock=JSON.parse(readFileSync('package-lock.json','utf8')),manifest=JSON.parse(readFileSync('package.json','utf8'));
for(const name of ['next','react','react-dom'])assert.equal(manifest.dependencies[name],lock.packages[`node_modules/${name}`].version,'Version de production revue et figée');
const config=readFileSync('next.config.ts','utf8');for(const header of ['X-Content-Type-Options','X-Frame-Options','Content-Security-Policy','Referrer-Policy'])assert.ok(config.includes(header));
const report={clientFilesScanned:artifacts.length,configuredPrivateValuesChecked:secrets.length,privateValuesExposed:0,sizes,versions:Object.fromEntries(['next','react','react-dom','sharp'].map(name=>[name,lock.packages[`node_modules/${name}`].version])),scope:'Contrôle local des fichiers client ; ne remplace pas npm audit, un audit Lighthouse ou une vérification Supabase distante.'};
assert.ok(readFileSync('lib/supabase/service.ts','utf8').includes("import 'server-only'"),'Service client must remain server-only');
assert.ok(!Object.keys(process.env).some(key=>/^NEXT_PUBLIC_.*(SERVICE_ROLE|SECRET|PASSWORD)/i.test(key)&&process.env[key]),'Private configuration must not use a public prefix');
report.configuration={
 supabaseUrlConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
 anonymousKeyConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
 serviceRoleConfigured:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
 contactRateSecretConfigured:Boolean(process.env.CONTACT_RATE_LIMIT_SECRET),
 demoData:process.env.AJT_DATA_SOURCE==='demo',
};
report.secretScanScope=secrets.length?'Configured private values checked against generated client files.':'No private values configured: real secret-value leakage could not be tested. Server-only boundary and public variable names checked.';
mkdirSync('test-results',{recursive:true});writeFileSync('test-results/production-audit.json',JSON.stringify(report,null,2));
console.log('PASS production : versions installées cohérentes, en-têtes configurés et absence des secrets configurés dans les fichiers client.');
