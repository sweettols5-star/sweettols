/**
 * Home-page hero: builds public/hero/*.webp from one source photo.
 *
 *   node scripts/prepare-hero.mjs <photo.jpg>
 *
 * Current photo: the hero of the client's ChatGPT/Gemini mockup, regenerated
 * alone at 3200×1312 with no text — cream cake with violet sugar flowers on a
 * gold stand, macarons, violet heart mould, whisks; the left third is left
 * plain for the headline.
 *
 * Outputs
 *   hero-2400.webp / hero-1600.webp  full-width background (desktop), the
 *                                    photo's own wide shape; the cake sits on
 *                                    the right, the headline on the plain left
 *   hero-mobile.webp                 6:5 crop around the cake, shown above the
 *                                    text on phones
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error('Usage: node scripts/prepare-hero.mjs <photo.jpg>');
  process.exit(1);
}
const OUT = path.resolve(import.meta.dirname, '..', 'public', 'hero');
fs.mkdirSync(OUT, { recursive: true });

const { width, height } = await sharp(src).metadata();
console.log(`source ${width}×${height}`);
if (width < 2400) console.warn('⚠ source narrower than 2400 px: the hero will look soft on large screens.');

for (const w of [2400, 1600]) {
  await sharp(src)
    .resize(w, Math.round((w * height) / width), { kernel: 'lanczos3' })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `hero-${w}.webp`));
}

// Phones: a 6:5 window centred on the cake (72 % across the frame), full height.
const CAKE_X = 0.72;
const cropW = Math.min(width, Math.round(height * (6 / 5)));
const left = Math.max(0, Math.min(width - cropW, Math.round(width * CAKE_X - cropW / 2)));
await sharp(src)
  .extract({ left, top: 0, width: cropW, height })
  .resize(900, 750, { fit: 'cover', kernel: 'lanczos3' })
  .webp({ quality: 80 })
  .toFile(path.join(OUT, 'hero-mobile.webp'));

for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith('hero-'))) {
  console.log(`✓ public/hero/${f} (${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)} KB)`);
}
