/**
 * Copies the local development store (.data/db.json) into MongoDB, so the
 * production database starts with every edit made in /admin (prices, photos,
 * settings) instead of the raw data/catalogue.json.
 *
 *   MONGODB_URI="mongodb+srv://..." node scripts/migrate-json-to-mongo.mjs
 *
 * Orders are NOT copied: the local ones are e2e test orders. Refuses to run
 * when the target already holds products, unless --force is passed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../src/env.js';
import { connectStore, store } from '../src/store/index.js';

if (store.kind !== 'mongo') {
  console.error('MONGODB_URI est vide : rien à migrer.');
  process.exit(1);
}

const force = process.argv.includes('--force');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, '.data', 'db.json'), 'utf8'));

await connectStore();

const existing = await store.products.all();
if (existing.length && !force) {
  console.error(`La base contient déjà ${existing.length} produits. Relancer avec --force pour les remplacer.`);
  await store.close();
  process.exit(1);
}

await store.categories.replaceAll(data.categories);
console.log(`✓ ${data.categories.length} catégories`);
await store.products.replaceAll(data.products);
console.log(`✓ ${data.products.length} produits`);
await store.admins.replaceAll(data.admins);
console.log(`✓ ${data.admins.length} admin(s)`);
await store.settings.write(data.settings);
console.log('✓ réglages');

await store.close();
