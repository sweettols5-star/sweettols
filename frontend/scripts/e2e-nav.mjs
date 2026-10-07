// Header dropdown with REAL mouse events through CDP (headless Edge on :9333):
// hover opens it, leaving closes it, clicking a category navigates and closes it,
// Escape closes it. Also checks the floating buttons don't hide the page on phones.
//
//   node scripts/e2e-nav.mjs
const CDP = `http://localhost:${process.env.CDP_PORT || 9333}`;
const SITE = process.env.SITE || 'http://localhost:4330';

const target = (await (await fetch(`${CDP}/json`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) listeners.forEach((l) => l(m));
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
const go = async (p) => {
  const l = once('Page.loadEventFired');
  await send('Page.navigate', { url: SITE + p });
  await l;
  await sleep(900);
};
const center = (sel) =>
  js(`(() => { const b = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
const move = (x, y) => send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
const clickAt = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const menuVisible = () => js(`getComputedStyle(document.querySelector('.header__menu')).visibility === 'visible'`);
let failures = 0;
const ok = (c, label) => {
  console.log(`${c ? '✓' : '✗'} ${label}`);
  if (!c) failures += 1;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await go('/');
await move(5, 600);
await sleep(300);
ok(!(await menuVisible()), 'dropdown closed on load');

const cat = await center('.header__drop > a');
await move(cat.x, cat.y);
await sleep(300);
ok(await menuVisible(), 'hovering « Catégories » opens the dropdown');

// travel down into the menu: it must stay open on the way
const first = await center('.header__menu a');
await move(cat.x, cat.y + 20);
await sleep(60);
await move(first.x, first.y);
await sleep(300);
ok(await menuVisible(), 'moving the pointer down into the menu keeps it open');

await move(5, 600);
await sleep(400);
ok(!(await menuVisible()), 'moving the pointer away closes it');

await move(cat.x, cat.y);
await sleep(250);
const target2 = await center('.header__menu a');
const href = await js(`document.querySelector('.header__menu a').getAttribute('href')`);
await move(target2.x, target2.y);
await sleep(150);
await clickAt(target2.x, target2.y);
await sleep(1200);
ok((await js('location.pathname')) === href, `clicking a category navigates (${href})`);
// pointer is still where the menu was: it must not reopen by itself after the click
ok(!(await menuVisible()), 'the dropdown is closed after clicking a link');

await move(5, 600);
await sleep(300);
await move(cat.x, cat.y);
await sleep(250);
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(300);
ok(!(await menuVisible()), 'Escape closes it');

// Floating buttons on a phone: present when a number is set, and never covering the page width.
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 800, deviceScaleFactor: 1, mobile: true });
await go('/');
const floats = await js(`document.querySelectorAll('.float-btn').length`);
if (floats) {
  const box = await js(`(() => { const b = document.querySelector('.floats').getBoundingClientRect(); return { right: b.right, w: b.width }; })()`);
  ok(box.right <= 390 && box.w <= 60, `floating buttons fit in the corner on a phone (${floats} shown)`);
} else {
  console.log('· no contact number in the settings: floating buttons hidden (expected)');
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nNavigation OK');
ws.close();
process.exit(failures ? 1 : 0);
