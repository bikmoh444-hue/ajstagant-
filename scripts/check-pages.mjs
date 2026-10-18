import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Contrôles locaux sans téléchargement de navigateur ni dépendance de test.
const origin = 'http://127.0.0.1:3100';
const output = path.resolve('test-results');
const executable = process.env.CHROME_PATH ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(candidate => existsSync(candidate));
if (!executable) throw new Error('Définir CHROME_PATH vers un navigateur Chromium installé.');
await mkdir(output, { recursive: true });

let server;
let browser;
let connection;
let browserLog = '';
const results = [];const performanceResults=[];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function until(check, label, timeout = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await check()) return; } catch { /* Le serveur ou le DOM peut être en cours de chargement. */ }
    await delay(100);
  }
  throw new Error(`Délai dépassé : ${label}`);
}

class DevTools {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
    socket.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (message.method === 'Runtime.exceptionThrown') this.errors.push(message.params.exceptionDetails.text);
      if (!message.id) return;
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
    });
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`DevTools timeout: ${method}`)); }, 15_000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
}

try {
  try { await fetch(origin); throw new Error('Le port 3100 est occupé. Libérer ce port avant le test.'); }
  catch (error) { if (error.message.includes('occupé')) throw error; }
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3100'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, AJT_DATA_SOURCE:'demo', CONTACT_STORAGE_MODE: 'local', CONTACT_TRUST_PROXY: 'true' } });
  let serverLog = '';
  server.stdout.on('data', chunk => { serverLog += chunk; });
  server.stderr.on('data', chunk => { serverLog += chunk; });
  await until(async () => (await fetch(origin)).ok, `serveur local ${serverLog}`);

  browser = spawn(executable, ['--headless=new', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${path.join(output, 'browser-profile')}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  browser.stderr.on('data', chunk => { browserLog += chunk; });
  await until(() => /DevTools listening on (ws:\/\/[^\s]+)/.test(browserLog), 'démarrage du navigateur');
  const address = browserLog.match(/DevTools listening on (ws:\/\/[^\s]+)/)[1];
  const socket = new WebSocket(address);
  await once(socket, 'open');
  connection = new DevTools(socket);
  const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => connection.send(method, params, sessionId);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ajtMetrics={cls:0,lcp:0};try{new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__ajtMetrics.cls+=entry.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__ajtMetrics.lcp=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch{}"});

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);
    return result.result.value;
  }
  async function navigate(route) {
    await send('Page.navigate', { url: `${origin}${route}` });
    await until(() => evaluate(`location.pathname === ${JSON.stringify(route.split('?')[0])} && document.readyState === 'complete' && !!document.querySelector('main h1')`), route);
    await evaluate('document.fonts.ready.then(() => true)');
  }
  async function click(selector) {
    await until(() => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length === 1`), selector);
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); el.click(); })()`);
  }
  async function clickText(selector, text) {
    await until(() => evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).filter(el => el.textContent.trim() === ${JSON.stringify(text)}).length === 1`), text);
    await evaluate(`(() => { const el = Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(el => el.textContent.trim() === ${JSON.stringify(text)}); el.focus(); el.click(); })()`);
  }
  async function count(selector, expected) {
    await until(() => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length === ${expected}`), `${selector} : ${expected}`);
  }
  async function key(value) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value, windowsVirtualKeyCode: { Escape: 27, ArrowLeft: 37, ArrowRight: 39 }[value] });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code: value });
  }

  for (const viewport of [{name:'mobile320',width:320,height:844},{name:'mobile375',width:375,height:844},{name:'mobile390',width:390,height:844},{name:'mobile430',width:430,height:932},{name:'tablet',width:768,height:1024},{name:'desktop',width:1440,height:1000}]) {
    await send('Network.setExtraHTTPHeaders',{headers:{'x-forwarded-for':`192.0.2.${Math.floor(viewport.width/10)%200+20}`}});
    await send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false });
    for (const route of ['/', '/histoire', '/equipe', '/galerie', '/bureau', '/matchs', '/contact']) {
      const pageResponse=await fetch(`${origin}${route}`);assert.equal(pageResponse.status,200);assert.equal(pageResponse.headers.get('x-content-type-options'),'nosniff');assert.equal(pageResponse.headers.get('x-frame-options'),'DENY');assert.equal(pageResponse.headers.get('x-powered-by'),null);
      await navigate(route);
      assert.equal(await evaluate('document.querySelectorAll("main h1").length'), 1);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${route} déborde à ${viewport.width}px`);
      assert.equal(await evaluate('document.querySelector("header nav a[aria-current=page]")?.getAttribute("href")'), route);
      const perf=await evaluate("(()=>{const n=performance.getEntriesByType('navigation')[0];return {ttfb:n?Math.round(n.responseStart-n.requestStart):null,lcp:Math.round(window.__ajtMetrics?.lcp??0)||null,cls:window.__ajtMetrics?.cls??0}})()");performanceResults.push({viewport:viewport.width,route,...perf});
      assert.equal(await evaluate("document.querySelectorAll('img:not([alt])').length"),0,'Images avec texte alternatif');
      const metrics = await send('Page.getLayoutMetrics');
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: viewport.width, height: Math.ceil(metrics.cssContentSize.height), scale: 1 } });
      await writeFile(path.join(output, `${viewport.name}-${route.slice(1)||'accueil'}.png`), Buffer.from(screenshot.data, 'base64'));
    }

    await navigate('/equipe');
    await count('.roster-card', 4);
    await count('.roster-statistics', 0);
    for (const position of ['Gardiens', 'Défenseurs / Fixes', 'Milieux / Ailiers', 'Attaquants / Pivots']) {
      await clickText('.roster-filters button', position);
      await count('.roster-card', 1);
      assert.equal(await evaluate('location.pathname'), '/equipe');
    }
    await clickText('.roster-filters button', 'Staff technique');
    await count('.roster-card', 0);
    await count('.staff-card', 4);
    await clickText('.roster-filters button', 'Tous');
    await count('.roster-card', 4);

    await navigate('/galerie');
    await count('.photo-card', 9);
    await clickText('main button', 'VOIR PLUS');
    await count('.photo-card', 12);
    await clickText('.gallery-filters button', 'Matchs');
    await count('.photo-card', 3);
    const opener = '.photo-open[aria-label="Agrandir : Sur le terrain"]';
    await click(opener);
    await until(() => evaluate('!!document.querySelector("dialog[open]")'), 'ouverture lightbox');
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'), 'Fermer la photo');
    await key('ArrowRight');
    await until(() => evaluate('document.querySelector("#lightbox-title")?.textContent === "L’esprit de compétition"'), 'photo suivante');
    await key('ArrowLeft');
    await until(() => evaluate('document.querySelector("#lightbox-title")?.textContent === "Sur le terrain"'), 'photo précédente');
    await click('dialog button[aria-label="Photo précédente"]');
    await until(() => evaluate('document.querySelector("#lightbox-title")?.textContent === "Le futsal nous rassemble"'), 'boucle de navigation');
    await key('Escape');
    await count('dialog', 0);
    assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'), 'Agrandir : Sur le terrain');
    assert.equal(await evaluate('document.body.style.overflow'), '');
    await navigate('/galerie?categorie=category-4');
    await until(() => evaluate('document.querySelector(".gallery-filters [aria-pressed=true]")?.textContent === "Histoire"'), 'catégorie par URL');
    await count('.photo-card', 2);
    // Une navigation vers la galerie générale réinitialise aussi le filtre.
    if (viewport.width >= 960) {
      await click('header a[href="/galerie"]');
      await until(() => evaluate('document.querySelector(".gallery-filters [aria-pressed=true]")?.textContent === "Toutes"'), 'réinitialisation par navigation');
      await count('.photo-card', 9);
    }

    if (viewport.width < 960) {
      await navigate('/histoire');
      await click('button[aria-label="Ouvrir le menu"]');
      assert.equal(await evaluate('document.querySelector("#main-nav").classList.contains("open")'), true);
      await key('Escape');
      await until(()=>evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false"'),'fermeture clavier menu');
      await click('button[aria-label="Ouvrir le menu"]');
      await click('header a[href="/equipe"]');
      await until(() => evaluate('location.pathname === "/equipe" && document.querySelector("main h1")?.textContent === "SAISON EN COURS"'), 'navigation mobile');
      assert.equal(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded")'), 'false');
    }
    await navigate('/matchs');
    await count('.featured-fixture', 1);
    await count('.compact-fixture', 3);
    await count('.fixture-links', 0);
    assert.equal(await evaluate('Array.from(document.querySelectorAll(".result-outcome")).map(el => el.textContent).join("")'), 'VND');
    assert.equal(await evaluate('document.querySelector(".standings-empty").textContent.includes("Aucun classement officiel")'), true);
    assert.equal(await evaluate('document.querySelector(".standings-scroll").scrollWidth > document.querySelector(".standings-scroll").clientWidth'), viewport.width < 1000);
    await click('.match-section-nav a[href="#classement"]');
    await until(() => evaluate('location.hash === "#classement"'), 'navigation interne matchs');

    await navigate('/contact');
    await click('.dedicated-contact-form button[type="submit"]');
    assert.equal(await evaluate('document.querySelectorAll(".dedicated-contact-form input,.dedicated-contact-form textarea").length'),3);
    await until(() => evaluate('document.querySelectorAll(".contact-field-error").length === 3'), 'erreurs de validation');
    const contactDirectory = path.resolve('.local/contact-messages');
    const before = new Set(await readdir(contactDirectory).catch(() => []));
    await evaluate(`(() => { const values = { name: 'Test navigateur', email: 'test-${viewport.name}@example.com', message: 'Message de contrôle local du formulaire de contact.' }; for (const [name, value] of Object.entries(values)) document.querySelector('.dedicated-contact-form [name="' + name + '"]').value = value; })()`);
    await click('.dedicated-contact-form button[type="submit"]');
    try {
      await until(() => evaluate('!!document.querySelector(".contact-feedback.success")'), 'enregistrement réel du contact');
    } catch (error) {
      console.error(await evaluate('({ notice: document.querySelector(".contact-feedback")?.textContent, errors: Array.from(document.querySelectorAll(".contact-field-error")).map(el => el.textContent) })'));
      throw error;
    }
    for (const filename of await readdir(contactDirectory)) {
      if (!before.has(filename) && /^[0-9a-f-]{36}\.json$/.test(filename)) {
        const file = path.join(contactDirectory, filename);
        const saved = JSON.parse(await readFile(file, 'utf8'));
        if (saved.email === `test-${viewport.name}@example.com` && saved.subject === 'Message du site') await unlink(file);
      }
    }
    await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: [`${origin}/api/contact`] });
    await evaluate(`(() => { const values = { name: 'Test erreur', email: 'test@example.com', message: 'Message de contrôle d’une erreur réseau.' }; for (const [name, value] of Object.entries(values)) document.querySelector('.dedicated-contact-form [name="' + name + '"]').value = value; })()`);
    await click('.dedicated-contact-form button[type="submit"]');
    await until(() => evaluate('document.querySelector(".contact-feedback.error")?.textContent.includes("Impossible de confirmer")'), 'échec réseau affiché');
    await send('Network.setBlockedURLs', { urls: [] });

    for(const protectedRoute of ['/admin','/admin/joueurs','/admin/messages','/admin/administrateurs']){
      const response=await fetch(`${origin}${protectedRoute}`,{redirect:'manual'});
      assert.ok([307,308].includes(response.status),`Accès anonyme refusé : ${protectedRoute}`);
      assert.match(response.headers.get('location')??'',/\/admin\/login/);
    }
    await navigate('/admin/login');
    assert.equal(await evaluate('document.querySelectorAll(".site-header,.site-footer").length'),0);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
    await navigate('/histoire');
    assert.equal(await evaluate('document.querySelector("main h1").textContent'),'AJT TAGANT — Une nouvelle génération, une même passion');
    assert.equal(await evaluate('document.querySelectorAll(".history-stats-strip,.page-statistics").length'),0);
    assert.ok((await evaluate('document.querySelectorAll(".history-origin .body-copy").length'))>=4);
    assert.equal(await evaluate('document.querySelectorAll(".history-vision-mission article").length'),2);
    await click('.languages button[lang="ar"]');
    await until(()=>evaluate('document.documentElement.lang === "ar" && document.documentElement.dir === "rtl"'),'langue arabe');
    await until(()=>evaluate('document.querySelector("main h1").textContent === "الجمعية الشبابية لرياضة تكانت — جيل جديد وطموح مشترك"'),'histoire officielle arabe');
    assert.equal(await evaluate('document.querySelector(".history-vision-mission h2").textContent'),'رؤيتنا');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Histoire arabe sans débordement');
    await navigate('/contact');
    assert.equal(await evaluate('document.querySelectorAll(".dedicated-contact-form input,.dedicated-contact-form textarea").length'),3);
    assert.ok((await evaluate('document.querySelector("label[for=contact-name]").textContent')).includes('الاسم الكامل'));
    assert.equal(await evaluate('document.querySelector(".dedicated-contact-form button[type=submit]").textContent'),'إرسال الرسالة');
    if(viewport.width===390){
      await evaluate(`(() => { const values={name:'اختبار آلي',email:'test-arabic@example.invalid',message:'رسالة اختبار آلي للتحقق من إرسال النموذج باللغة العربية.'};for(const [name,value] of Object.entries(values))document.querySelector('.dedicated-contact-form [name="'+name+'"]').value=value;})()`);
      await click('.dedicated-contact-form button[type=submit]');
      await until(()=>evaluate('document.querySelector(".contact-feedback.success")?.textContent.includes("تم إرسال رسالتكم بنجاح")'),'confirmation arabe');
      for(const filename of await readdir(contactDirectory)){
        if(!before.has(filename)&&/^[0-9a-f-]{36}\.json$/.test(filename)){
          const file=path.join(contactDirectory,filename);const saved=JSON.parse(await readFile(file,'utf8'));
          if(saved.email==='test-arabic@example.invalid'&&saved.name==='اختبار آلي')await unlink(file);
        }
      }
    }
    for(const route of ['/','/histoire','/equipe','/matchs','/galerie','/bureau','/contact']){await navigate(route);assert.equal(await evaluate('document.documentElement.lang'),'ar');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,`Debordement AR ${route}/${viewport.width}`);}
    await navigate('/galerie');
    assert.equal(await evaluate('document.documentElement.lang'),'ar');
    await until(()=>evaluate('document.querySelector("header nav a")?.textContent === "الرئيسية"'),'navigation arabe');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Débordement en arabe');
    const arabicShot=await send('Page.captureScreenshot',{format:'png'});
    await writeFile(path.join(output,`${viewport.name}-arabe.png`),Buffer.from(arabicShot.data,'base64'));
    await click('.languages button:not([lang])');
    await until(()=>evaluate('document.documentElement.lang === "fr" && document.documentElement.dir === "ltr"'),'retour français');

    const favicon=await fetch(`${origin}/favicon`);assert.equal(favicon.status,200);assert.equal(favicon.headers.get('cache-control'),'no-store');
    results.push({ viewport: viewport.name, width: viewport.width, pages: 7, filters: 'passed', lightbox: 'passed', contact: 'passed', matches: 'passed', anonymousAdmin:'denied',language:'passed',favicon:'dynamic fallback, no-store',dataSource:'explicit demo', overflow: 'none' });
    console.log(`PASS ${viewport.name} : 7 pages, filtres, galerie, matchs, contact, favicon, accès admin refusé, FR/AR et responsive`);
  }
  assert.deepEqual(connection.errors, [], 'Erreur JavaScript navigateur');
  await writeFile(path.join(output, 'checks.json'), JSON.stringify({results,performance:performanceResults,javascriptErrors:connection.errors,scope:'Mesures locales avec donnees de demonstration, sans throttling ni score Lighthouse.'}, null, 2));
} finally {
  await writeFile(path.join(output, 'browser.log'), browserLog);
  connection?.socket.close();
  browser?.kill();
  server?.kill();
}
