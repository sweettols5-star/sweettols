/**
 * Shop settings — contact details and delivery zones — editable in /admin.
 *
 * Delivery is priced per zone (the mockup's "Casablanca / autres villes"). The
 * fees below are the client's (2026-10-09): Casablanca 30 DH, other cities 45 DH.
 */
import { store } from '../store/index.js';
import { clean, int, slugify, translations } from './text.js';

export const DEFAULT_SETTINGS = {
  brand: 'SWEETTOOLS',
  baseline: 'Outils et matériel de pâtisserie & cake design',
  url: 'https://sweettools.ma',
  phone: '06 78 77 99 83',
  whatsapp: '212678779983',
  email: '',
  city: 'Casablanca',
  hours: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  announcement: 'Paiement à la livraison partout au Maroc',
  freeShippingThreshold: 0,
  // Client rule (2026-10-10): no order under 200 DH, delivery included (invoice VAT not).
  minOrder: 200,
  zones: [
    { id: 'casablanca', label: 'Casablanca', fee: 30, delay: '24 à 48 h' },
    { id: 'autres-villes', label: 'Autres villes du Maroc', fee: 45, delay: '2 à 4 jours ouvrables' },
  ],
  // Home page "Kits prêts à l'emploi": products sold together, priced at their
  // live sum by the shop. Edited in /admin/kits.
  kits: [
    {
      id: 'debutant-cake-design',
      title: 'Kit débutant cake design',
      pitch: 'Étaler, couvrir et lisser vos premiers gâteaux en pâte à sucre.',
      slugs: [
        'rouleau-pate-a-sucre-anneaux-epaisseur',
        'double-lisseur-pate-a-sucre-2-en-1',
        'grattoirs-a-gateau-3-pieces',
        'spatule-coudee',
      ],
    },
    {
      id: 'decors-silicone',
      title: 'Kit décors en silicone',
      pitch: 'Fleurs, nœuds, couronnes et ornements en pâte à sucre ou en chocolat.',
      slugs: ['moule-silicone-fleurs', 'moule-silicone-noeuds-coeurs-couronnes', 'moule-silicone-ornements-venitiens'],
    },
  ],
};

const digits = (v) => clean(v, 30).replace(/[^\d]/g, '');
const link = (v) => {
  const s = clean(v, 300);
  return /^https?:\/\//i.test(s) ? s : '';
};

function zones(list, fallback) {
  if (!Array.isArray(list)) return fallback;
  const seen = new Set();
  const out = [];
  for (const z of list) {
    const label = clean(z?.label, 80);
    if (!label) continue;
    let id = slugify(z.id || label) || `zone-${out.length + 1}`;
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    out.push({
      id,
      label,
      fee: int(z.fee, { min: 0, max: 10_000, fallback: 0 }),
      delay: clean(z.delay, 60),
      i18n: translations(z.i18n, { label: 80, delay: 60 }),
    });
    if (out.length >= 20) break;
  }
  return out.length ? out : fallback;
}

/** Unlike zones, an empty list is kept: the owner may remove every kit. */
function kits(list, fallback) {
  if (!Array.isArray(list)) return fallback;
  const seen = new Set();
  const out = [];
  for (const k of list) {
    const title = clean(k?.title, 80);
    if (!title) continue;
    let id = slugify(k.id || title) || `kit-${out.length + 1}`;
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    const slugs = [...new Set((Array.isArray(k.slugs) ? k.slugs : []).map((s) => slugify(s)).filter(Boolean))].slice(0, 8);
    if (!slugs.length) continue;
    out.push({ id, title, pitch: clean(k.pitch, 200), slugs, i18n: translations(k.i18n, { title: 80, pitch: 200 }) });
    if (out.length >= 12) break;
  }
  return out;
}

export function normaliseSettings(body = {}, base = DEFAULT_SETTINGS) {
  const m = { ...base, ...body };
  return {
    brand: clean(m.brand, 60) || DEFAULT_SETTINGS.brand,
    baseline: clean(m.baseline, 160),
    url: link(m.url) || base.url || DEFAULT_SETTINGS.url,
    phone: clean(m.phone, 30),
    whatsapp: digits(m.whatsapp),
    email: clean(m.email, 120),
    city: clean(m.city, 80),
    hours: clean(m.hours, 120),
    instagram: link(m.instagram),
    facebook: link(m.facebook),
    tiktok: link(m.tiktok),
    announcement: clean(m.announcement, 160),
    freeShippingThreshold: int(m.freeShippingThreshold, { min: 0, max: 1_000_000, fallback: 0 }),
    minOrder: int(m.minOrder, { min: 0, max: 1_000_000, fallback: DEFAULT_SETTINGS.minOrder }),
    zones: zones(m.zones, base.zones || DEFAULT_SETTINGS.zones),
    kits: kits(m.kits, base.kits || DEFAULT_SETTINGS.kits),
    // English / Arabic versions of the texts shown on the shop.
    i18n: translations(m.i18n, { baseline: 160, announcement: 160 }),
  };
}

export async function readSettings() {
  return normaliseSettings((await store.settings.read()) || {}, DEFAULT_SETTINGS);
}

/** Delivery fee for a zone and a subtotal. Free above the threshold, if set. */
export function shippingFor(settings, zoneId, subtotal) {
  const zone = settings.zones.find((z) => z.id === zoneId);
  if (!zone) return null;
  const free = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  return { zone, fee: free ? 0 : zone.fee };
}
