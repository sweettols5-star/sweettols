/**
 * Freezes the live catalogue into src/data/catalogue.json before a build, so
 * every product gets a real static page (SEO) even though the data lives in
 * the API.
 *
 *   node scripts/sync-catalogue.mjs           keeps the previous snapshot if the API is down
 *   node scripts/sync-catalogue.mjs --strict  fails instead (use for a production build)
 *
 * Render's free plan sleeps after 15 min and takes ~50 s to wake up, hence the
 * long timeout and the retries.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'catalogue.json');
const strict = process.argv.includes('--strict');

// Same precedence as `next build`: production files first.
for (const name of ['.env.production.local', '.env.production', '.env.local', '.env', '.env.development.local']) {
  let text;
  try {
    text = fs.readFileSync(path.join(ROOT, name), 'utf8');
  } catch {
    continue;
  }
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const base = (process.env.CATALOGUE_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function fail(message) {
  if (strict || !fs.existsSync(OUT)) {
    console.error(`✗ catalogue : ${message}`);
    process.exit(1);
  }
  console.warn(`⚠ catalogue : ${message} — le build garde l'instantané précédent.`);
  process.exit(0);
}

if (!base) fail('CATALOGUE_API_URL non défini');

let data;
for (let attempt = 1; attempt <= 3 && !data; attempt += 1) {
  try {
    const res = await fetch(`${base}/api/catalogue`, { signal: AbortSignal.timeout(90_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) {
    console.warn(`  tentative ${attempt}/3 : ${e.message}`);
  }
}
if (!data) fail(`API injoignable (${base})`);
if (!Array.isArray(data.products) || !Array.isArray(data.categories)) fail('réponse inattendue');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`✓ catalogue : ${data.products.length} produits, ${data.categories.length} catégories (${base})`);
