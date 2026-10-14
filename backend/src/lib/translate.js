/**
 * Automatic English / Arabic translation of a product, with Claude.
 *
 * On each save, a translation is (re)written when it is missing, or when the
 * French changed and the translation was the automatic one. A translation the
 * admin typed by hand is never overwritten: `i18nAuto` remembers which fields
 * hold an automatic translation, and an edit in the admin clears the mark.
 *
 * Off when ANTHROPIC_API_KEY is unset. A failure never blocks the save: the
 * product is saved as is and the shop falls back to French.
 */
import Anthropic from '@anthropic-ai/sdk';
import { env, envInt } from '../env.js';
import { LANGS } from './text.js';

const FIELDS = ['name', 'description', 'details', 'colors'];
const isList = (f) => f === 'details' || f === 'colors';
const empty = (v) => (Array.isArray(v) ? !v.length : !v);
const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');

let client;
const api = () => (client ??= new Anthropic({ apiKey: env('ANTHROPIC_API_KEY'), timeout: envInt('TRANSLATE_TIMEOUT_MS', 30000), maxRetries: 1 }));

export const translationEnabled = () => !!env('ANTHROPIC_API_KEY');

/** Which fields of which language need a (new) automatic translation. */
function todo(product, existing) {
  const auto = existing?.i18nAuto || {};
  const out = {};
  for (const lang of LANGS) {
    const tr = product.i18n?.[lang] || {};
    const fields = FIELDS.filter((f) => {
      if (empty(product[f])) return false;
      if (empty(tr[f])) return true;
      if (isList(f) && tr[f].length !== product[f].length) return true;
      // Still the automatic text (not edited in the admin), but the French moved on.
      return auto[lang]?.[f] && same(tr[f], existing?.i18n?.[lang]?.[f]) && !same(product[f], existing?.[f]);
    });
    if (fields.length) out[lang] = fields;
  }
  return out;
}

const SCHEMA = (fields) => {
  const props = Object.fromEntries(fields.map((f) => [f, isList(f) ? { type: 'array', items: { type: 'string' } } : { type: 'string' }]));
  const lang = { type: 'object', properties: props, required: fields, additionalProperties: false };
  return { type: 'object', properties: { en: lang, ar: lang }, required: LANGS, additionalProperties: false };
};

async function ask(source) {
  const fields = Object.keys(source);
  const res = await api().beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA(fields) } },
    system:
      'You translate product listings of SweetTools, a Moroccan online shop of pastry and cake-decorating tools, from French into English and Modern Standard Arabic. ' +
      'Keep brand names, model numbers, dimensions and units as they are (write "cm" as "سم" in Arabic). ' +
      'Lists keep the same number of items, in the same order. Write natural shop copy, not a word-for-word rendering.',
    messages: [{ role: 'user', content: JSON.stringify(source) }],
  });
  if (res.stop_reason !== 'end_turn') throw new Error(`stop_reason ${res.stop_reason}`);
  const text = res.content.find((b) => b.type === 'text')?.text;
  return JSON.parse(text);
}

/**
 * Returns `{ i18n, i18nAuto }` for the product about to be saved: its
 * translations with the missing or outdated ones filled in.
 */
export async function autoTranslate(product, existing = null) {
  // An edit in the admin turns an automatic translation into a manual one.
  const auto = structuredClone(existing?.i18nAuto || {});
  for (const lang of LANGS) {
    for (const f of FIELDS) {
      if (auto[lang]?.[f] && !same(product.i18n?.[lang]?.[f], existing?.i18n?.[lang]?.[f])) delete auto[lang][f];
    }
  }
  const result = { i18n: product.i18n || {}, i18nAuto: auto };

  const needed = todo(product, existing);
  if (!translationEnabled() || !Object.keys(needed).length) return result;

  const fields = [...new Set(Object.values(needed).flat())];
  try {
    const out = await ask(Object.fromEntries(fields.map((f) => [f, product[f]])));
    const i18n = structuredClone(result.i18n);
    for (const [lang, list] of Object.entries(needed)) {
      for (const f of list) {
        const v = out?.[lang]?.[f];
        if (empty(v) || (isList(f) && v.length !== product[f].length)) continue;
        (i18n[lang] ??= {})[f] = v;
        (auto[lang] ??= {})[f] = true;
      }
    }
    return { i18n, i18nAuto: auto };
  } catch (e) {
    console.error('[translate]', e?.message || e);
    return result;
  }
}
