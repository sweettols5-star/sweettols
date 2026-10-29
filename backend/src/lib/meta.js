/**
 * Meta Conversions API: the Purchase event, sent by the server.
 *
 * The browser pixel misses shoppers whose browser blocks connect.facebook.net
 * (Firefox tracking protection, Brave, ad blockers, some in-app browsers).
 * The server sends the same Purchase with the order reference as event_id, so
 * Meta keeps one when both arrive.
 *
 * Off when META_CAPI_TOKEN is unset. A failure is logged, never shown to the
 * customer: the order is already saved.
 */
import crypto from 'node:crypto';
import { env, envInt } from '../env.js';

const API_VERSION = 'v21.0';

export const metaEnabled = () => !!env('META_CAPI_TOKEN');

const sha = (v) => (v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined);

/** Moroccan number to E.164 digits without the plus: 0612345678 → 212612345678. */
function phoneDigits(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  return d.startsWith('0') ? `212${d.slice(1)}` : d;
}

/** Only the fields that have a value: Meta rejects empty strings. */
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));

/**
 * `browser` comes from the checkout form (cookies _fbp/_fbc and the page URL);
 * `ip` and `userAgent` from the request.
 */
export async function sendPurchase(order, { ip, userAgent, browser = {} } = {}) {
  if (!metaEnabled()) return;
  const [first, ...rest] = (order.customer?.name || '').trim().split(/\s+/);
  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(new Date(order.createdAt || Date.now()).getTime() / 1000),
    event_id: order.reference,
    action_source: 'website',
    event_source_url: typeof browser.url === 'string' ? browser.url.slice(0, 500) : `${env('PUBLIC_URL')}/commande/`,
    user_data: compact({
      ph: [sha(phoneDigits(order.customer?.phone))],
      em: order.customer?.email ? [sha(order.customer.email)] : undefined,
      fn: first ? [sha(first)] : undefined,
      ln: rest.length ? [sha(rest.join(' '))] : undefined,
      ct: order.customer?.city ? [sha(order.customer.city.replace(/\s+/g, ''))] : undefined,
      country: [sha('ma')],
      client_ip_address: ip,
      client_user_agent: userAgent,
      fbp: typeof browser.fbp === 'string' ? browser.fbp.slice(0, 200) : undefined,
      fbc: typeof browser.fbc === 'string' ? browser.fbc.slice(0, 500) : undefined,
    }),
    // Same figures as the browser pixel: products only, delivery excluded.
    custom_data: {
      currency: 'MAD',
      value: order.subtotal,
      content_type: 'product',
      content_ids: order.items.map((l) => l.slug),
      contents: order.items.map((l) => ({ id: l.slug, quantity: l.qty, item_price: l.price })),
      num_items: order.items.reduce((n, l) => n + l.qty, 0),
      order_id: order.reference,
    },
  };
  const body = compact({ data: [event], test_event_code: env('META_TEST_EVENT_CODE') || undefined });
  const pixel = env('META_PIXEL_ID', '1430716852354633');
  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${pixel}/events?access_token=${encodeURIComponent(env('META_CAPI_TOKEN'))}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(envInt('META_TIMEOUT_MS', 10000)),
    });
    if (!res.ok) console.error('[meta] Purchase %s refusé : %s', order.reference, await res.text());
  } catch (e) {
    console.error('[meta] Purchase %s non envoyé : %s', order.reference, e.message);
  }
}
