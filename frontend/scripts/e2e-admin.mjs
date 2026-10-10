// Browser end-to-end of the back office through CDP (headless Edge on :9333).
// It WRITES to the API it targets (orders, products, settings, categories):
// run it against the local dev store only, with a backup of backend/.data/db.json.
//
//   msedge --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank
//   node scripts/e2e-admin.mjs
import path from 'node:path';

const CDP = `http://localhost:${process.env.CDP_PORT || 9333}`;
const SITE = process.env.SITE || 'http://localhost:4330';
const API = process.env.API || 'http://localhost:4500';
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@sweettools.ma', password: process.env.ADMIN_PASSWORD || 'sweettools-demo-2026' };
const PHOTO = path.resolve(import.meta.dirname, '..', 'public', 'products', 'maryse-silicone-1.webp');

const target = (await (await fetch(`${CDP}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
const consoleErrors = [];
const send = (method, params = {}) =>
  new Promise((r) => {
    id += 1;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
    return;
  }
  if (!m.method) return;
  // window.confirm() would block the page forever in headless mode: accept it.
  if (m.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true });
  if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails?.exception?.description || 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    const text = m.params.args.map((a) => a.value ?? a.description).join(' ');
    // The wrong-password attempt is a deliberate 401.
    if (!/401/.test(text)) consoleErrors.push(text);
  }
  listeners.forEach((l) => l(m));
});
const once = (method) =>
  new Promise((r) => {
    const l = (m) => {
      if (m.method === method) {
        listeners.splice(listeners.indexOf(l), 1);
        r(m);
      }
    };
    listeners.push(l);
  });
const js = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (p) => {
  const l = once('Page.loadEventFired');
  await send('Page.navigate', { url: SITE + p });
  await l;
  await sleep(1200);
};
const click = (text, sel = 'button, a') =>
  js(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(b => b.textContent.trim().includes(${JSON.stringify(text)}) && !b.disabled); if (!el) return false; el.click(); return true; })()`);
const fill = (sel, value) =>
  js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return true; })()`);
/** Fills the input inside the .adm-field whose label starts with `label`. */
const fillField = (label, value) =>
  js(`(() => { const f = [...document.querySelectorAll('.adm-field')].find(f => f.querySelector('span')?.textContent.trim().startsWith(${JSON.stringify(label)})); const el = f?.querySelector('input, textarea, select'); if (!el) return false; const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); return true; })()`);
const text = (sel) => js(`document.querySelector(${JSON.stringify(sel)})?.textContent?.trim() ?? null`);
let failures = 0;
const ok = (c, label) => {
  console.log(`${c ? '✓' : '✗'} ${label}`);
  if (!c) failures += 1;
};
const apiJson = async (p, init = {}) => (await fetch(API + p, init)).json();

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

// ---- Login ----
await go('/admin/');
await js(`localStorage.clear()`);
await go('/admin/');
ok(!!(await js(`!!document.querySelector('.adm-login')`)), 'signed-out visitor sees the login form');
await fill('input[type=email]', ADMIN.email);
await fill('input[type=password]', 'mauvais-mot-de-passe');
await click('Se connecter');
await sleep(800);
ok((await text('.adm-alert--err'))?.includes('incorrect'), 'wrong password is refused with a clear message');
await fill('input[type=password]', ADMIN.password);
await click('Se connecter');
await sleep(1500);
ok((await text('.adm-h1')) === 'Tableau de bord', 'correct password opens the dashboard');
ok((await js(`document.querySelectorAll('.adm-stat').length`)) === 4, 'dashboard shows 4 figures');
ok((await js(`document.querySelectorAll('.adm-todo li').length`)) >= 1, 'dashboard lists what to complete (missing prices)');

// ---- Orders ----
const placed = await apiJson('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { name: 'Client Admin Test', phone: '0661234567', city: 'Rabat', address: 'Avenue de Test 4, Agdal', notes: 'Sonner deux fois' },
    zoneId: 'autres-villes',
    items: [{ slug: 'maryse-silicone', qty: 8 }], // 200 DH: exactly the minimum order
  }),
});
ok(/^ST-/.test(placed.reference || ''), `test order placed (${placed.reference})`);
await go('/admin/');
ok(Number(await text('.adm-nav__badge')) >= 1, 'sidebar badge counts new orders');

await go(`/admin/commandes/?ref=${placed.reference}`);
ok((await js(`!!document.querySelector('.adm-order.is-open')`)), 'order opened from its reference');
ok((await text('.adm-note'))?.includes('Sonner deux fois'), 'customer note visible');
ok((await text('.adm-totals__total dd'))?.replace(/\s/g, '') === '245DH', 'amount to collect 8×25 + 45 = 245 DH (exactly the 200 DH minimum is accepted)');
await click('Confirmer (client appelé)');
await sleep(900);
ok((await text('.adm-order.is-open .adm-badge')) === 'Confirmée', 'one click moves it to « Confirmée »');
await fill('.adm-order.is-open textarea', 'Rappelé à 10 h');
await click('Enregistrer la note');
await sleep(700);
await fill('.adm-order.is-open select', 'annulee');
await sleep(900);
const { orders } = await (async () => {
  const { token } = await apiJson('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ADMIN) });
  globalThis.AUTH = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return apiJson(`/api/admin/orders?q=${placed.reference}`, { headers: globalThis.AUTH });
})();
ok(orders[0]?.status === 'annulee' && orders[0]?.adminNote === 'Rappelé à 10 h', 'status (after confirm) and internal note saved in the API');
ok(orders[0]?.history?.map((h) => h.status).join('>') === 'nouvelle>confirmee>annulee', 'status history kept');

// ---- Products: quick price ----
await go('/admin/produits/?filtre=sans-prix');
const unpricedBefore = await js(`document.querySelectorAll('.adm-prod').length`);
ok(unpricedBefore >= 5, `« Sans prix » filter lists ${unpricedBefore} products`);
await js(`(() => { const row = [...document.querySelectorAll('.adm-prod')].find(r => r.textContent.includes('Plateau tournant')); const input = row.querySelector('.adm-prod__price input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '150'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(200);
await js(`[...document.querySelectorAll('.adm-prod')].find(r => r.textContent.includes('Plateau tournant')).querySelector('.adm-prod__price button').click()`);
await sleep(900);
ok((await text('.adm-alert--ok'))?.includes('150'), 'price typed in the list is saved');
await go('/produit/plateau-tournant-acier-inoxydable/');
ok((await text('.product .price__now'))?.replace(/\s/g, '') === '150DH', 'shop page shows the new price without a rebuild');
ok(await js(`[...document.querySelectorAll('.product button')].some(b => b.textContent.includes('Ajouter au panier') && !b.disabled)`), 'and it can now be ordered');

// ---- Products: create with photo, then delete ----
await go('/admin/produits/?nouveau=1');
await fillField('Nom du produit', 'Poche à douille test e2e');
ok((await js(`[...document.querySelectorAll('.adm-field')].find(f => f.textContent.includes('Adresse de la page')).querySelector('input').value`)) === 'poche-a-douille-test-e2e', 'page address generated from the name');
await fillField('Prix de vente', '39');
await fillField('Description', 'Poche réutilisable pour tester l’éditeur.');
await fillField('Caractéristiques', 'Silicone\nRéutilisable');
const { root } = (await send('DOM.getDocument')).result;
const { nodeId } = (await send('DOM.querySelector', { nodeId: root.nodeId, selector: '.adm-drop input[type=file]' })).result;
await send('DOM.setFileInputFiles', { nodeId, files: [PHOTO] });
await sleep(2500);
ok((await js(`document.querySelectorAll('.adm-photo').length`)) === 1, 'photo uploaded and shown');
await click('Créer le produit');
await sleep(1500);
ok((await js(`location.search`)) === '?modifier=poche-a-douille-test-e2e', 'after creation the editor switches to the saved product');
const created = await apiJson('/api/admin/products/poche-a-douille-test-e2e', { headers: globalThis.AUTH });
ok(created.product?.price === 39 && created.product.images.length === 1 && created.product.details.length === 2, 'product stored with price, photo and 2 features');
const img = created.product?.images?.[0]?.url;
ok(img && (await fetch(img)).ok, 'uploaded photo is served');

await go('/produit/?slug=poche-a-douille-test-e2e');
ok((await text('.product__title')) === 'Poche à douille test e2e', 'new product visible on the shop (fallback page) right away');

await go('/admin/produits/?modifier=poche-a-douille-test-e2e');
await click('Supprimer', '.adm-editor button');
await sleep(1500);
ok((await js(`location.pathname + location.search`)) === '/admin/produits/', 'deleting returns to the list');
ok((await fetch(`${API}/api/admin/products/poche-a-douille-test-e2e`, { headers: globalThis.AUTH })).status === 404, 'product deleted in the API');

// ---- Settings ----
await go('/admin/reglages/');
await fillField('WhatsApp', '06 12 34 56 78');
await fillField('Bandeau en haut du site', 'Livraison offerte dès 300 DH');
await fillField('Livraison offerte dès', '300');
await click('Enregistrer les réglages');
await sleep(1000);
ok((await text('.adm-alert--ok'))?.includes('Réglages enregistrés'), 'settings saved');
await go('/');
ok(await js(`!!document.querySelector('.float-btn--wa[href^="https://wa.me/212612345678"]')`), 'WhatsApp button appears on the shop with the normalised number');
ok(await js(`!!document.querySelector('.float-btn--phone[href="tel:0678779983"]')`), 'call button dials the shop phone number');
ok((await text('.announce')) === 'Livraison offerte dès 300 DH', 'announcement bar updated live');

// ---- Categories ----
await go('/admin/categories/');
const catsBefore = await js(`document.querySelectorAll('.adm-cat').length`);
await click('+ Nouvelle catégorie');
await sleep(300);
await fillField('Nom', 'Catégorie test e2e');
await click('Créer la catégorie');
await sleep(1200);
ok((await js(`document.querySelectorAll('.adm-cat').length`)) === catsBefore + 1, 'category created');
await js(`[...document.querySelectorAll('.adm-cat')].find(c => c.textContent.includes('Catégorie test e2e')).querySelector('.adm-btn--danger').click()`);
await sleep(1200);
ok((await js(`document.querySelectorAll('.adm-cat').length`)) === catsBefore, 'empty category deleted');

// ---- Session ----
await go('/admin/');
await click('Se déconnecter');
await sleep(500);
ok(await js(`!!document.querySelector('.adm-login')`), 'sign-out returns to the login form');

ok(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ` — ${consoleErrors.slice(0, 3).join(' | ')}` : ''}`);
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAdmin flow OK');
ws.close();
process.exit(failures ? 1 : 0);
