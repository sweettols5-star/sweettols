/**
 * Order validation and pricing — cash on delivery only.
 *
 * The cart is untrusted: only slugs and quantities are read from it. Every
 * price comes back from the catalogue, and the delivery fee from the zone the
 * customer picked. When the cart displayed a different price, the database
 * wins and the old figure is kept on the line for the phone call.
 */
import { clean, int, reference } from './text.js';
import { msg, nameIn, shopLang } from './i18n.js';
import { isSellable } from './product.js';
import { shippingFor } from './settings.js';

export const STATUSES = ['nouvelle', 'confirmee', 'expediee', 'livree', 'annulee'];
export const STATUS_LABELS = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const MAX_LINES = 40;
/** VAT added when the customer asks for an invoice: 20 % of the products (delivery excluded). */
export const INVOICE_RATE = 0.2;
export const invoiceFee = (subtotal) => Math.round(subtotal * INVOICE_RATE);

/** `null` when no invoice is wanted; company and ICE are optional. */
function invoice(raw) {
  if (!raw) return null;
  return { company: clean(raw.company, 120), ice: clean(raw.ice, 30) };
}

function customer(raw = {}, lang = 'fr') {
  const c = {
    name: clean(raw.name, 120),
    phone: clean(raw.phone, 30),
    email: clean(raw.email, 160).toLowerCase(),
    city: clean(raw.city, 80),
    address: clean(raw.address, 400),
    notes: clean(raw.notes, 1000),
  };
  if (c.name.length < 2) return { error: msg(lang, 'name') };
  const d = c.phone.replace(/\D/g, '');
  // 06/07/05 + 8 digits locally, or 212 + 9 digits.
  if (!/^(0[5-7]\d{8}|212[5-7]\d{8})$/.test(d)) {
    return { error: msg(lang, 'phone') };
  }
  // Optional, but a typo would be kept and never reach the customer.
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    return { error: msg(lang, 'email') };
  }
  if (!c.city) return { error: msg(lang, 'city') };
  if (c.address.length < 5) return { error: msg(lang, 'address') };
  return { customer: c };
}

/**
 * @returns {{error: string, problems?: object[]} | {order: object}}
 */
export function buildOrder(body = {}, catalogue = [], settings) {
  // The shopper's language: their error messages, and a hint for the confirmation call.
  const lang = shopLang(body.lang);
  const who = customer(body.customer, lang);
  if (who.error) return { error: who.error };

  const requested = Array.isArray(body.items) ? body.items.slice(0, MAX_LINES) : [];
  if (!requested.length) return { error: msg(lang, 'emptyCart') };

  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
  const merged = new Map();
  for (const line of requested) {
    const slug = clean(line?.slug, 90);
    const qty = int(line?.qty, { min: 1, max: 99, fallback: 1 });
    merged.set(slug, { qty: (merged.get(slug)?.qty || 0) + qty, price: line?.price });
  }

  const items = [];
  const problems = [];
  for (const [slug, line] of merged) {
    const product = bySlug.get(slug);
    if (!isSellable(product)) {
      problems.push({ slug, name: product?.name || slug, reason: 'indisponible' });
      continue;
    }
    if (typeof product.stock === 'number' && line.qty > product.stock) {
      problems.push({ slug, name: product.name, reason: 'stock', available: product.stock });
      continue;
    }
    items.push({
      slug,
      name: product.name,
      image: product.images?.[0]?.thumb || product.images?.[0]?.url || '',
      qty: line.qty,
      price: product.price,
      lineTotal: product.price * line.qty,
      ...(line.price !== undefined && int(line.price, { fallback: -1 }) !== product.price
        ? { cartPrice: int(line.price, { fallback: 0 }) }
        : {}),
    });
  }

  // Refuse rather than silently drop: a customer who ordered three things and
  // receives two calls the shop angry. The cart shows what to fix.
  if (problems.length) {
    const first = problems[0];
    const name = nameIn(bySlug.get(first.slug), lang) || first.name;
    const error = first.reason === 'stock'
      ? msg(lang, 'stock', { name, available: first.available })
      : msg(lang, 'unavailable', { name });
    return { error, problems };
  }

  const subtotal = items.reduce((n, l) => n + l.lineTotal, 0);
  const delivery = shippingFor(settings, clean(body.zoneId, 60), subtotal);
  if (!delivery) return { error: msg(lang, 'zone') };

  // Client rule (2026-10-10): the minimum counts products + delivery (invoice VAT excluded).
  const minOrder = settings?.minOrder || 0;
  if (minOrder && subtotal + delivery.fee < minOrder) {
    return {
      error: msg(lang, 'minOrder', { min: minOrder, missing: minOrder - subtotal - delivery.fee }),
      minOrder,
    };
  }

  const facture = invoice(body.invoice);
  const factureFee = facture ? invoiceFee(subtotal) : 0;

  const now = new Date().toISOString();
  return {
    order: {
      reference: reference(),
      customer: who.customer,
      zone: { id: delivery.zone.id, label: delivery.zone.label },
      items,
      subtotal,
      shipping: delivery.fee,
      invoice: facture,
      invoiceFee: factureFee,
      total: subtotal + delivery.fee + factureFee,
      payment: 'cod',
      lang,
      status: 'nouvelle',
      history: [{ status: 'nouvelle', at: now }],
      createdAt: now,
      updatedAt: now,
    },
  };
}

/** True when moving between these statuses puts units back (or takes them again). */
export const stockDelta = (from, to) => {
  if (from !== 'annulee' && to === 'annulee') return +1;
  if (from === 'annulee' && to !== 'annulee') return -1;
  return 0;
};
