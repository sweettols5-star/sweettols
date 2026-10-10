/**
 * Loads English / Arabic translations into the store from a JSON file:
 *
 *   node scripts/apply-translations.mjs translations.json
 *
 * Shape: { products: { <slug>: { en: {...}, ar: {...} } },
 *          categories: { <id>: { en, ar } },
 *          settings: { i18n: { en, ar }, zones: { <id>: { en, ar } },
 *                      kits: { <id>: { title?, pitch?, en, ar } } } }
 *
 * Every value goes through the same validation as the admin (lib/text.js
 * translations), so the file cannot store anything the admin could not.
 * Products or categories missing from the store are reported and skipped.
 */
import fs from 'node:fs';
import { connectStore, store } from '../src/store/index.js';
import { translations } from '../src/lib/text.js';
import { normaliseSettings, readSettings } from '../src/lib/settings.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage : node scripts/apply-translations.mjs <fichier.json>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
await connectStore();

let n = 0;
for (const [slug, tr] of Object.entries(data.products || {})) {
  const ok = await store.products.update(slug, { i18n: translations(tr, { name: 140, description: 4000, details: 'list' }) });
  if (ok) n += 1;
  else console.warn(`  produit introuvable : ${slug}`);
}
console.log(`✓ ${n} produits traduits`);

n = 0;
for (const [id, tr] of Object.entries(data.categories || {})) {
  const ok = await store.categories.update(id, { i18n: translations(tr, { name: 80, description: 600 }) });
  if (ok) n += 1;
  else console.warn(`  catégorie introuvable : ${id}`);
}
console.log(`✓ ${n} catégories traduites`);

if (data.settings) {
  const s = await readSettings();
  const t = data.settings;
  const next = normaliseSettings(
    {
      i18n: t.i18n ?? s.i18n,
      zones: s.zones.map((z) => (t.zones?.[z.id] ? { ...z, i18n: t.zones[z.id] } : z)),
      kits: s.kits.map((k) => {
        const kt = t.kits?.[k.id];
        return kt ? { ...k, title: kt.title || k.title, pitch: kt.pitch || k.pitch, i18n: { en: kt.en, ar: kt.ar } } : k;
      }),
    },
    s,
  );
  await store.settings.write(next);
  console.log(`✓ réglages : bandeau/slogan, ${next.zones.length} zones, ${next.kits.length} kits`);
}

await store.close();
