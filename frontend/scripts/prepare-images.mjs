/**
 * Turns the client's raw photos (../products/*.jpeg, ../logo.jpeg) into the
 * web files the shop serves.
 *
 *   public/products/<slug>-<n>.webp       1000×1000, fond blanc, photo entière
 *   public/products/<slug>-<n>-thumb.webp  500×500 pour les cartes
 *   public/brand/emblem.png                 le gâteau du logo, sans le texte
 *
 * The mapping file ↔ slug lives in ../backend/data/catalogue.json (`source`
 * on each image), so the seed and the files can never drift apart.
 *
 * Usage: npm run images   (idempotent, overwrites)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.resolve(ROOT, '..', 'products');
const OUT = path.join(ROOT, 'public', 'products');
const BRAND = path.join(ROOT, 'public', 'brand');
const catalogue = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, '..', 'backend', 'data', 'catalogue.json'), 'utf8'),
);

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(BRAND, { recursive: true });

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function square(input, size, file, quality) {
  await sharp(input)
    .rotate()
    .flatten({ background: WHITE })
    // `contain` keeps the whole product in frame: the dimension arrows some
    // supplier photos carry would be cut by a cover crop.
    .resize(size, size, { fit: 'contain', background: WHITE, withoutEnlargement: false })
    .webp({ quality })
    .toFile(file);
}

let count = 0;
const sheet = [];
for (const product of catalogue.products) {
  for (const [i, image] of (product.images || []).entries()) {
    if (!image.source) continue;
    const src = path.join(RAW, image.source);
    if (!fs.existsSync(src)) {
      console.error(`✗ introuvable : ${image.source}`);
      process.exitCode = 1;
      continue;
    }
    const stem = `${product.slug}-${i + 1}`;
    await square(src, 1000, path.join(OUT, `${stem}.webp`), 82);
    await square(src, 500, path.join(OUT, `${stem}-thumb.webp`), 76);
    sheet.push({ file: path.join(OUT, `${stem}-thumb.webp`), label: product.slug });
    count += 1;
  }
}
console.log(`✓ ${count} photos produit`);

// Emblem: the round cake drawing, cropped off the purple square. The client's
// logo spells the name "SWEETTOLS"; the brand is SweetTools, so the wordmark is
// set in type on the site and only the drawing is reused.
const logo = path.resolve(ROOT, '..', 'logo.jpeg');
const meta = await sharp(logo).metadata();
const box = { left: 300, top: 70, width: 545, height: 625 };
const side = Math.max(box.width, box.height);
await sharp(logo)
  .extract({
    left: Math.max(0, box.left - Math.round((side - box.width) / 2)),
    top: box.top,
    width: Math.min(side, meta.width),
    height: side,
  })
  .resize(256, 256)
  .png()
  .toFile(path.join(BRAND, 'emblem.png'));
await sharp(path.join(BRAND, 'emblem.png')).resize(180, 180).png().toFile(path.join(ROOT, 'public', 'apple-touch-icon.png'));
await sharp(path.join(BRAND, 'emblem.png')).resize(48, 48).png().toFile(path.join(ROOT, 'src', 'app', 'icon.png'));
console.log('✓ emblème + icônes');

// Contact sheet (dev only) to eyeball every product against its slug.
if (process.argv.includes('--sheet')) {
  const cell = 220;
  const cols = 6;
  const rows = Math.ceil(sheet.length / cols);
  const composites = [];
  for (const [i, s] of sheet.entries()) {
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * (cell + 30);
    composites.push({ input: await sharp(s.file).resize(cell - 10, cell - 10).toBuffer(), left: x + 5, top: y });
    const svg = `<svg width="${cell}" height="30" xmlns="http://www.w3.org/2000/svg"><text x="4" y="18" font-size="11" font-family="Arial">${i + 1}. ${s.label.slice(0, 32)}</text></svg>`;
    composites.push({ input: Buffer.from(svg), left: x, top: y + cell - 5 });
  }
  const target = process.argv[process.argv.indexOf('--sheet') + 1];
  await sharp({ create: { width: cols * cell, height: rows * (cell + 30), channels: 3, background: WHITE } })
    .composite(composites)
    .jpeg({ quality: 80 })
    .toFile(target);
  console.log(`✓ planche : ${target}`);
}
