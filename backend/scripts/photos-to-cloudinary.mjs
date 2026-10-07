/**
 * Moves the seeded product photos (frontend/public/products/*.webp, referenced
 * as "/products/...") to Cloudinary and rewrites each product's image URLs, so
 * every photo lives in the same place as the ones uploaded from /admin.
 *
 *   MONGODB_URI="..." CLOUDINARY_URL="..." node scripts/photos-to-cloudinary.mjs
 *
 * Idempotent: images that already have an absolute URL are left alone.
 */
import fs from 'node:fs';
import path from 'node:path';
import { env, ROOT } from '../src/env.js';
import { connectStore, store } from '../src/store/index.js';
import { uploadToCloudinary, usingCloudinary } from '../src/lib/cloudinary.js';

if (store.kind !== 'mongo' || !usingCloudinary()) {
  console.error('MONGODB_URI et CLOUDINARY_URL sont requis.');
  process.exit(1);
}

const PUBLIC = path.join(ROOT, '..', 'frontend', 'public');
const folder = env('CLOUDINARY_FOLDER', 'sweettools/produits');

async function send(url) {
  if (!url || !url.startsWith('/products/')) return url;
  const file = path.join(PUBLIC, url);
  const publicId = path.parse(file).name;
  return uploadToCloudinary(fs.readFileSync(file), publicId, folder);
}

await connectStore();

let moved = 0;
for (const product of await store.products.all()) {
  const images = [];
  let changed = false;
  for (const image of product.images || []) {
    const next = { ...image, url: await send(image.url), thumb: await send(image.thumb) };
    if (next.url !== image.url || next.thumb !== image.thumb) changed = true;
    images.push(next);
  }
  if (changed) {
    await store.products.update(product.slug, { images });
    moved += images.length;
    console.log(`✓ ${product.slug} (${images.length})`);
  }
}
console.log(`${moved} photos sur Cloudinary.`);

await store.close();
