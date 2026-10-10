/** Shared text helpers. */

/** URL-safe slug: accents folded, punctuation dropped, single dashes. */
export function slugify(input) {
  return String(input ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/['’]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const clean = (v, max = 2000) => String(v ?? '').trim().slice(0, max);

/** Bounded integer. Returns `fallback` for anything unparseable. */
export function int(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export const bool = (v) => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';

/** Short reference read aloud on the phone: no I/L/O/0/1. */
export function reference(prefix = 'ST') {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}

/** Languages besides French (the base language, stored in the plain fields). */
export const LANGS = ['en', 'ar'];

/**
 * Translations of some text fields: `{ en: { name: '…' }, ar: { … } }`.
 * `fields` maps a field to its max length, or to 'list' for a string list.
 * Empty values are dropped: the shop falls back to the French field.
 */
export function translations(raw, fields) {
  const out = {};
  for (const lang of LANGS) {
    const src = raw && typeof raw === 'object' ? raw[lang] : null;
    if (!src || typeof src !== 'object') continue;
    const t = {};
    for (const [field, max] of Object.entries(fields)) {
      if (max === 'list') {
        const list = stringList(src[field]);
        if (list.length) t[field] = list;
      } else {
        const s = clean(src[field], max);
        if (s) t[field] = s;
      }
    }
    if (Object.keys(t).length) out[lang] = t;
  }
  return out;
}

/** Trimmed, de-duplicated list of short strings. */
export function stringList(value, { max = 12, len = 160 } = {}) {
  const raw = Array.isArray(value) ? value : String(value ?? '').split('\n');
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const s = clean(item, len);
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}
