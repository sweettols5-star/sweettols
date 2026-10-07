/**
 * Home-page hero: builds public/hero/*.webp from one source photo.
 *
 *   node scripts/prepare-hero.mjs <photo.jpg>
 *
 * Current photo: pink buttercream-rose cake on a polka-dot stand, Pixabay image
 * 1202271 (https://pixabay.com/photos/id-1202271/ — Pixabay licence: free for
 * commercial use, no attribution required). Pixabay blocks scripted downloads:
 * download the largest size in a browser and pass its path here.
 *
 * Outputs
 *   cake-2400.webp / cake-1600.webp  full-width background (desktop); the cake
 *                                    sits on the right, the plain left side
 *                                    takes the headline
 *   cake-mobile.webp                 tighter crop on the cake, shown above the
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

// Small sources are enlarged with Lanczos and a light sharpen; real originals are only reduced.
const resize = (w, h) => (img) =>
  img.resize(w, h, { fit: 'cover', kernel: 'lanczos3' }).sharpen(width < w ? { sigma: 0.8 } : undefined);

for (const w of [2400, 1600]) {
  await resize(w, Math.round((w * 2) / 3))(sharp(src)).webp({ quality: 80 }).toFile(path.join(OUT, `cake-${w}.webp`));
}

// Phones: keep the cake (right ~70 % of the frame), drop most of the empty left side.
const left = Math.round(width * 0.3);
const cropW = width - left;
const cropH = Math.min(height, Math.round(cropW * (5 / 6)));
await resize(900, 750)(sharp(src).extract({ left, top: 0, width: cropW, height: cropH }))
  .webp({ quality: 80 })
  .toFile(path.join(OUT, 'cake-mobile.webp'));

for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith('cake-'))) {
  console.log(`✓ public/hero/${f} (${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)} KB)`);
}
