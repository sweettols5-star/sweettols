/**
 * Loads data/catalogue.json into the store and creates the admin account.
 *
 *   npm run seed          adds what is missing (never overwrites an edit made in /admin)
 *   npm run seed:force    replaces categories and products (orders are kept)
 *
 * The admin comes from ADMIN_EMAIL / ADMIN_PASSWORD. An existing admin's
 * password is only reset with --reset-admin.
 */
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { env, ROOT } from '../src/env.js';
import { connectStore, store } from '../src/store/index.js';
import { normaliseProduct } from '../src/lib/product.js';

const force = process.argv.includes('--force');
const resetAdmin = process.argv.includes('--reset-admin');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'catalogue.json'), 'utf8'));

await connectStore();

// Categories
const existingCats = force ? [] : await store.categories.all();
const categories = data.categories.map((c) => ({ ...c, image: c.image || '' }));
if (force) {
  await store.categories.replaceAll(categories);
} else {
  for (const c of categories) {
    if (!existingCats.some((e) => e.id === c.id)) await store.categories.create(c);
  }
}
console.log(`✓ ${categories.length} catégories`);

// Products: images point at the files `npm run images` wrote into the shop's
// public/products/ — same name scheme, so the two scripts never disagree.
const products = [];
for (const raw of data.products) {
  const images = (raw.images || []).map((_, i) => ({
    url: `/products/${raw.slug}-${i + 1}.webp`,
    thumb: `/products/${raw.slug}-${i + 1}-thumb.webp`,
  }));
  const { error, product } = normaliseProduct({ ...raw, images, stock: raw.stock ?? null }, null, categories);
  if (error) throw new Error(`${raw.slug}: ${error}`);
  products.push(product);
}
if (force) {
  await store.products.replaceAll(products);
  console.log(`✓ ${products.length} produits (remplacés)`);
} else {
  const have = new Set((await store.products.all()).map((p) => p.slug));
  const missing = products.filter((p) => !have.has(p.slug));
  for (const p of missing) await store.products.create(p);
  console.log(`✓ ${missing.length} produits ajoutés, ${products.length - missing.length} déjà présents`);
}

// Admin
const email = env('ADMIN_EMAIL').toLowerCase();
const password = env('ADMIN_PASSWORD');
if (email && password) {
  const admin = await store.admins.get(email);
  if (!admin) {
    await store.admins.create({ email, name: 'Administrateur', passwordHash: await bcrypt.hash(password, 10) });
    console.log(`✓ compte admin créé : ${email}`);
  } else if (resetAdmin) {
    await store.admins.update(email, { passwordHash: await bcrypt.hash(password, 10) });
    console.log(`✓ mot de passe admin réinitialisé : ${email}`);
  } else {
    console.log(`• admin déjà présent : ${email}`);
  }
} else {
  console.warn('• ADMIN_EMAIL / ADMIN_PASSWORD absents : aucun compte admin créé.');
}

await store.close?.();
// The JSON store writes asynchronously; give it a tick to flush.
setTimeout(() => process.exit(0), 300);
