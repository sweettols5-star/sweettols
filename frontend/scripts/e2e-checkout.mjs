// Browser end-to-end of the shop through CDP (headless Edge on :9333):
// live catalogue → product page → add to cart → cart → checkout validation →
// cash-on-delivery order → confirmation → the order is in /api/admin/orders.
// The test order is then cancelled so it gives its stock back.
//
//   msedge --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank
//   node scripts/e2e-checkout.mjs
const CDP = `http://localhost:${process.env.CDP_PORT || 9333}`;
const SITE = process.env.SITE || 'http://localhost:4330';
const API = process.env.API || 'http://localhost:4500';
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@sweettools.ma', password: process.env.ADMIN_PASSWORD || 'sweettools-demo-2026' };

const target = (await (await fetch(`${CDP}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
const consoleErrors = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) {
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails?.exception?.description || 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    listeners.forEach((l) => l(m));
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    id += 1;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
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
const go = async (path) => {
  const l = once('Page.loadEventFired');
  await send('Page.navigate', { url: SITE + path });
  await l;
  await sleep(900);
};
const click = (text, sel = 'button, a') =>
  js(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find(b => b.textContent.trim().includes(${JSON.stringify(text)}) && !b.disabled); if (!el) return false; el.click(); return true; })()`);
const fill = (sel, value) =>
  js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
let failures = 0;
const ok = (c, label) => {
  console.log(`${c ? '✓' : '✗'} ${label}`);
  if (!c) failures += 1;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

// Fresh visitor.
await go('/');
await js(`localStorage.clear()`);

// Live refresh: a price changed in the API after the build must show up.
const { token } = await (
  await fetch(`${API}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ADMIN) })
).json();
ok(Boolean(token), 'admin login (for checks)');
const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

await go('/');
ok((await js(`document.querySelectorAll('.cat').length`)) >= 5, 'home shows category tiles');
ok((await js(`document.querySelectorAll('.grid .card').length`)) === 8, 'home shows 8 products');

// Unpriced product: no add-to-cart.
await go('/produit/plateau-tournant-acier-inoxydable/');
ok(Boolean(await js(`!!document.querySelector('.price--pending')`)), 'unpriced product shows « Prix à venir »');
ok(Boolean(await js(`[...document.querySelectorAll('.product button')].some(b => b.disabled && b.textContent.includes('Bientôt'))`)), 'unpriced product cannot be added');

// Priced product: add 2.
await go('/produit/spatule-coudee/');
ok((await js(`document.querySelector('.product__title')?.textContent`)) === 'Spatule coudée', 'product page renders');
await click('+', '.product .qty button');
await click('Ajouter au panier', '.product button');
await sleep(300);
ok((await js(`document.querySelector('.cart-btn__count')?.textContent`)) === '2', 'header badge shows 2');

// A second product from a card.
await go('/categorie/decoration-patisserie/');
await js(`[...document.querySelectorAll('.card')].find(c => c.textContent.includes('Grattoirs')).querySelector('button').click()`);
await sleep(300);
ok((await js(`document.querySelector('.cart-btn__count')?.textContent`)) === '3', 'card button adds one more');

await go('/panier/');
ok((await js(`document.querySelectorAll('.line').length`)) === 2, 'cart has 2 lines after navigation');
ok((await js(`document.querySelector('.summary dd')?.textContent`))?.replace(/\s/g, '') === '135DH', 'subtotal 2×60 + 15 = 135 DH');

// Minimum order (client rule: 200 DH of products): 135 DH is blocked everywhere.
ok((await js(`document.querySelector('.minorder')?.textContent`))?.replace(/\s/g, '').includes('65DH'), 'cart says 65 DH are missing to reach 200 DH');
ok(await js(`[...document.querySelectorAll('.summary .btn')].some(b => b.textContent.includes('Passer à la livraison') && b.disabled)`), 'order button disabled under the minimum');
await go('/commande/');
ok(await js(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Confirmer la commande') && b.disabled)`), 'checkout confirm button disabled too (direct URL)');
const tooSmall = await fetch(`${API}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { name: 'Test Minimum', phone: '0612345678', city: 'Casablanca', address: 'Rue du Test 1' },
    zoneId: 'casablanca',
    items: [{ slug: 'spatule-coudee', qty: 2 }, { slug: 'grattoirs-a-gateau-3-pieces', qty: 1 }],
  }),
});
ok(tooSmall.status === 400 && /minimum/i.test((await tooSmall.json()).error || ''), 'API refuses an order under the minimum');

// Two more spatulas: 4×60 + 15 = 255 DH, above the minimum.
await go('/panier/');
for (let i = 0; i < 2; i++) {
  await js(`[...document.querySelectorAll('.line')].find(l => l.textContent.includes('Spatule coudée')).querySelector('button[aria-label="Ajouter un"]').click()`);
  await sleep(200);
}
ok((await js(`document.querySelector('.summary dd')?.textContent`))?.replace(/\s/g, '') === '255DH', 'subtotal 4×60 + 15 = 255 DH');
ok(!(await js(`!!document.querySelector('.minorder')`)), 'minimum notice gone once reached');

await click('Passer à la livraison');
await sleep(1200);
ok((await js(`location.pathname`)) === '/commande/', 'goes to checkout');

// Empty submit → field errors, no request.
await click('Confirmer la commande');
await sleep(300);
ok((await js(`document.querySelectorAll('.field__error').length`)) >= 4, 'client-side validation flags missing fields');

const stamp = Date.now();
await fill('[name=name]', `Test E2E ${stamp}`);
await fill('[name=phone]', '06 12 34 56 78');
await fill('[name=address]', 'Rue des Tests 12, Maarif');
await js(`document.querySelector('input[name=zone][value=casablanca]').click()`);
await sleep(200);
ok((await js(`document.querySelector('[name=city]').value`)) === 'Casablanca', 'choosing Casablanca fills the city');
ok((await js(`document.querySelector('.summary__total dd')?.textContent`))?.replace(/\s/g, '') === '285DH', 'total with delivery = 255 + 30 = 285 DH');

await click('Confirmer la commande');
await sleep(1800);
const reference = await js(`document.querySelector('.confirm strong')?.textContent`);
ok(/^ST-[A-Z0-9]{6}$/.test(reference || ''), `confirmation shows a reference (${reference})`);
ok((await js(`JSON.parse(localStorage.getItem('sweettools.cart.v1') || '[]').length`)) === 0, 'cart emptied after ordering');
ok(!(await js(`!!document.querySelector('.cart-btn__count')`)), 'header badge gone');

const { orders } = await (await fetch(`${API}/api/admin/orders?q=${encodeURIComponent(reference)}`, { headers: auth })).json();
const order = orders?.[0];
ok(order?.customer?.name === `Test E2E ${stamp}`, 'order is in the admin list');
ok(order?.total === 285 && order?.shipping === 30 && order?.items?.length === 2, 'order totals computed by the API');
if (order) {
  await fetch(`${API}/api/admin/orders/${order.reference}`, { method: 'PATCH', headers: auth, body: JSON.stringify({ status: 'annulee', adminNote: 'Commande de test e2e' }) });
}

// Saved details are offered again next time.
await go('/produit/maryse-silicone/');
await click('Ajouter au panier', '.product button');
await go('/commande/');
ok((await js(`document.querySelector('[name=phone]').value`)) === '06 12 34 56 78', 'contact details remembered for next order');
await js(`localStorage.clear()`);

// Search from the header.
await go('/boutique/?q=tapis');
const found = await js(`[...document.querySelectorAll('.card__title')].map(t => t.textContent)`);
ok(found?.length >= 3 && found.every((t) => /tapis/i.test(t)), `search « tapis » → ${found?.length} results`);

// Kit: one click adds every product of the beginner kit.
await go('/');
await js(`localStorage.clear()`);
await go('/');
await click('Ajouter le kit au panier', '.kit button');
await sleep(400);
ok((await js(`document.querySelector('.cart-btn__count')?.textContent`)) === '4', 'beginner kit adds its 4 products');
ok((await js(`document.querySelector('.kit__total strong')?.textContent`))?.replace(/\s/g, '') === '125DH', 'kit price = live sum (125 DH)');
await js(`localStorage.clear()`);

// FAQ + guides pages.
await go('/faq/');
ok((await js(`document.querySelectorAll('.faq details').length`)) >= 12, 'FAQ page lists every question');
await go('/conseils/lisser-pate-a-sucre/');
ok((await js(`document.querySelectorAll('.grid .card').length`)) === 5, 'guide shows the 5 products it uses');

// Fallback sheet + 404.
await go('/produit/?slug=spatule-coudee');
ok((await js(`document.querySelector('.product__title')?.textContent`)) === 'Spatule coudée', 'fallback /produit/?slug= renders from the live catalogue');
await go('/nexiste-pas/');
ok((await js(`document.querySelector('h1')?.textContent`)) === 'Page introuvable', '404 page with shop chrome');

ok(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ` — ${consoleErrors.slice(0, 3).join(' | ')}` : ''}`);
console.log(failures ? `\n${failures} check(s) FAILED` : '\nShop flow OK');
ws.close();
process.exit(failures ? 1 : 0);
