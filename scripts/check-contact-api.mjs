import { spawn } from 'node:child_process';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const port = 3110;
const origin = `http://127.0.0.1:${port}`;
const sample = { name: '  Test automatisé  ', email: 'test-api@example.com', message: 'Ceci est un message de contrôle automatisé local.' };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let server;
async function start(mode) {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    windowsHide: true, stdio: 'ignore', env: { ...process.env, AJT_DATA_SOURCE:'demo', CONTACT_STORAGE_MODE: mode, CONTACT_TRUST_PROXY: 'true' },
  });
  for (let index = 0; index < 100; index++) {
    try { if ((await fetch(`${origin}/contact`)).ok) return; } catch { /* Démarrage. */ }
    if (server.exitCode !== null) throw new Error('Le serveur de test a quitté.');
    await delay(100);
  }
  throw new Error('Serveur de test indisponible.');
}
async function stop() { if (server && server.exitCode === null) { const done = new Promise(resolve => server.once('exit', resolve)); server.kill(); await done; } server = undefined; }
function post(payload, ip, headers = {}) {
  return fetch(`${origin}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip, ...headers }, body: typeof payload === 'string' ? payload : JSON.stringify(payload) });
}
try {
  try { await fetch(origin); throw new Error('Le port 3110 est occupé.'); } catch (error) { if (error.message.includes('occupé')) throw error; }
  await start('local');
  let response = await post({ ...sample, email: 'invalide', name: '' }, '192.0.2.1');
  assert.equal(response.status, 400);
  const validation = await response.json();
  assert.ok(validation.errors.email && validation.errors.name);
  assert.equal((await post({ ...sample, website: 'robot' }, '192.0.2.2')).status, 400);
  assert.equal((await post('{invalid', '192.0.2.3')).status, 400);
  assert.equal((await post(sample, '192.0.2.4', { Origin: 'https://example.com' })).status, 403);
  assert.equal((await post(sample, '192.0.2.5', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await post({ ...sample, message: 'a'.repeat(25_000) }, '192.0.2.6')).status, 413);
  for (let index = 0; index < 5; index++) assert.equal((await post({ ...sample, email: 'bad' }, '192.0.2.7')).status, 400);
  response = await post(sample, '192.0.2.7');
  assert.equal(response.status, 429); assert.ok(Number(response.headers.get('Retry-After')) > 0);
  response = await post(sample, '192.0.2.8', { Origin: origin });
  assert.equal(response.status, 201);
  const saved = await response.json();
  assert.match(saved.id, /^[0-9a-f-]{36}$/);
  const file = path.resolve('.local/contact-messages', `${saved.id}.json`);
  const message = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(message.name, 'Test automatisé');
  assert.equal(message.email, sample.email);
  assert.equal(message.status, 'new');
  assert.equal(message.subject,'Message du site');
  assert.ok(!Number.isNaN(Date.parse(message.created_at)));
  assert.equal(saved.message,'Votre message a été envoyé avec succès. Nous vous répondrons dès que possible.');
  assert.equal(message.website, undefined);
  await unlink(file); // Seulement le message synthétique créé par ce test.
  await stop();
  await start('disabled');
  response = await post(sample, '192.0.2.9');
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /n’a pas été envoyé/);
  console.log('PASS API contact : validation, honeypot, origine, taille, quota, persistance locale et service désactivé.');
} finally { await stop(); }
