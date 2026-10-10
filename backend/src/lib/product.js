/**
 * Product validation and the public shape.
 *
 * Prices are whole dirhams. `price: 0` means "prix à venir": the product is
 * shown but cannot be added to the cart — the client has not priced half the
 * catalogue yet, and selling at 0 DH is never what anyone wants.
 *
 * Stock: `null` = not tracked (always orderable), a number = units left, and
 * each order takes them off (see lib/order.js).
 */
import { bool, clean, int, slugify, stringList, translations } from './text.js';

const MAX_IMAGES = 8;

function image(raw) {
  if (!raw) return null;
  const url = clean(typeof raw === 'string' ? raw : raw.url, 500);
  // A site path (/products/x.webp) or an absolute http(s) URL — nothing else
  // may end up in an <img src>.
  if (!/^(https?:\/\/|\/)/i.test(url) || /^\/\//.test(url)) return null;
  const thumb = clean(raw.thumb, 500);
  return {
    url,
    thumb: /^(https?:\/\/|\/)/i.test(thumb) && !/^\/\//.test(thumb) ? thumb : url,
  };
}

/**
 * @param body       untrusted input from /admin
 * @param existing   the stored product when editing, null when creating
 * @param categories stored categories, to check categoryId
 * @param taken      slugs already used by OTHER products
 */
export function normaliseProduct(body = {}, existing = null, categories = [], taken = new Set()) {
  const name = clean(body.name, 140);
  if (!name) return { error: 'Le nom du produit est obligatoire.' };

  const categoryId = clean(body.categoryId, 60);
  if (!categories.some((c) => c.id === categoryId)) return { error: 'Catégorie inconnue.' };

  const slug = slugify(body.slug || name);
  if (!slug) return { error: 'Adresse (slug) invalide.' };
  if (taken.has(slug)) return { error: `Un autre produit utilise déjà l'adresse « ${slug} ».` };

  const price = int(body.price, { min: 0, max: 1_000_000, fallback: 0 });
  const compareAtPrice = int(body.compareAtPrice, { min: 0, max: 1_000_000, fallback: 0 });
  if (compareAtPrice && compareAtPrice <= price) {
    return { error: "L'ancien prix (barré) doit être supérieur au prix de vente." };
  }

  const stockRaw = body.stock;
  const stock = stockRaw === null || stockRaw === undefined || stockRaw === ''
    ? null
    : int(stockRaw, { min: 0, max: 100_000, fallback: 0 });

  const images = (Array.isArray(body.images) ? body.images : [])
    .map(image)
    .filter(Boolean)
    .slice(0, MAX_IMAGES);

  const now = new Date().toISOString();
  return {
    product: {
      slug,
      name,
      categoryId,
      price,
      compareAtPrice: compareAtPrice || 0,
      description: clean(body.description, 4000),
      details: stringList(body.details),
      // Absent = untouched (an older admin screen must not wipe the translations).
      i18n: body.i18n === undefined ? existing?.i18n || {} : translations(body.i18n, { name: 140, description: 4000, details: 'list' }),
      images,
      stock,
      active: body.active === undefined ? true : bool(body.active),
      featured: bool(body.featured),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
  };
}

/** What the shop receives: no internal fields, and a computed availability. */
export function publicView(p) {
  return {
    slug: p.slug,
    name: p.name,
    categoryId: p.categoryId,
    price: p.price || 0,
    compareAtPrice: p.compareAtPrice || 0,
    description: p.description || '',
    details: p.details || [],
    i18n: p.i18n || {},
    images: (p.images || []).map(({ url, thumb }) => ({ url, thumb: thumb || url })),
    featured: !!p.featured,
    // The exact count stays private; the shop only needs "can I sell it".
    inStock: p.stock === null || p.stock === undefined || p.stock > 0,
    lowStock: typeof p.stock === 'number' && p.stock > 0 && p.stock <= 3 ? p.stock : 0,
    createdAt: p.createdAt,
  };
}

export const isSellable = (p) => !!p && p.active !== false && p.price > 0
  && (p.stock === null || p.stock === undefined || p.stock > 0);
