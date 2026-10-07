/**
 * public/og.jpg — the 1200×630 share image (WhatsApp, Facebook) for pages
 * without a product photo: three real products + the logo drawing + the name.
 *
 *   node scripts/make-og.mjs
 */
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const P = (f) => path.join(ROOT, 'public', f);

const W = 1200;
const H = 630;
const TILE = 300;
const tiles = [
  'products/moule-silicone-fleurs-1.webp',
  'products/plateau-tournant-acier-inoxydable-1.webp',
  'products/tapis-macaron-petite-taille-30x40-1.webp',
];

const rounded = (size, r) =>
  Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`);

async function tile(file) {
  return sharp(P(file))
    .resize(TILE, TILE)
    .composite([{ input: rounded(TILE, 28), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

const emblem = await sharp(P('brand/emblem.png'))
  .resize(120, 120)
  .composite([{ input: Buffer.from('<svg width="120" height="120"><circle cx="60" cy="60" r="60"/></svg>'), blend: 'dest-in' }])
  .png()
  .toBuffer();

const text = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="200" y="128" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#4b1d52">Sweet<tspan fill="#8e3a9f">Tools</tspan></text>
  <text x="70" y="560" font-family="Arial, sans-serif" font-size="30" fill="#4b1d52">Matériel de pâtisserie &amp; cake design</text>
  <text x="70" y="600" font-family="Arial, sans-serif" font-size="24" fill="#8e3a9f">Paiement à la livraison partout au Maroc</text>
</svg>`);

const layers = [
  { input: emblem, left: 70, top: 40 },
  { input: text, left: 0, top: 0 },
  ...(await Promise.all(tiles.map(tile))).map((input, i) => ({ input, left: 70 + i * (TILE + 45), top: 190 })),
];

await sharp({ create: { width: W, height: H, channels: 3, background: '#f6eef8' } })
  .composite(layers)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(P('og.jpg'));

console.log('✓ public/og.jpg');
