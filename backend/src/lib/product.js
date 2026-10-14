/**
 * Product validation and the public shape.
 *
 * Prices are whole dirhams. `price: 0` means "prix à venir": the product is
 * shown but cannot be added to the cart — the client has not priced half the
 * catalogue yet, and selling at 0 DH is never what anyone wants.
 *
 * Stock: `null` = not tracked (always orderable), a number = units left, and
 * each order takes them off (see lib/order.js).
 *
 * Options: `colors` (names, French) and `sizes` (in cm, stored without the
 * unit: "20", "30 × 40"). When a product has some, the customer picks one of
 * each; same price and same stock for every option.
 */
import { bool, clean, int, slugify, stringList, translations } from './text.js';

const MAX_IMAGES = 8;
const MAX_OPTIONS = 20;

/** "20 cm", "30x40", "30 * 40 cm" -> "20", "30 × 40": the shop adds the unit in each language. */
export function sizeLabel(raw) {
  return clean(raw, 40)
    .replace(/\s*cm\.?$/i, '')
    .replace(/\s*[x×*]\s*/gi, ' × ')
    .replace(/,/g, '.')
    .trim();
}

export const sizeList = (value) =>
  stringList((Array.isArray(value) ? value : String(value ?? '').split('\n')).map(sizeLabel), { max: MAX_OPTIONS, len: 40 });
export const colorList = (value) => stringList(value, { max: MAX_OPTIONS, len: 40 });

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
 * @param categories stored categories, to check categoryIds
 * @param taken      slugs already used by OTHER products
 */
export function normaliseProduct(body = {}, existing = null, categories = [], taken = new Set()) {
  const name = clean(body.name, 140);
  if (!name) return { error: 'Le nom du produit est obligatoire.' };

  // A product can sit in several categories. The first one is the main one:
  // breadcrumb, Google product_type, « Dans la même catégorie ».
  const requested = Array.isArray(body.categoryIds) && body.categoryIds.length ? body.categoryIds : [body.categoryId];
  const categoryIds = [...new Set(requested.map((id) => clean(id, 60)).filter(Boolean))];
  if (!categoryIds.length) return { error: 'Choisissez au moins une catégorie.' };
  const unknown = categoryIds.find((id) => !categories.some((c) => c.id === id));
  if (unknown) return { error: `Catégorie inconnue : « ${unknown} ».` };

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
      categoryId: categoryIds[0],
      categoryIds,
      price,
      compareAtPrice: compareAtPrice || 0,
      description: clean(body.description, 4000),
      details: stringList(body.details),
      colors: colorList(body.colors),
      sizes: sizeList(body.sizes),
      // Absent = untouched (an older admin screen must not wipe the translations).
      i18n: body.i18n === undefined ? existing?.i18n || {} : translations(body.i18n, { name: 140, description: 4000, details: 'list', colors: 'list' }),
      images,
      stock,
      active: body.active === undefined ? true : bool(body.active),
      featured: bool(body.featured),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
  };
}

/** Every category of a product — products saved before multi-category only have categoryId. */
export const categoriesOf = (p) => (Array.isArray(p.categoryIds) && p.categoryIds.length ? p.categoryIds : [p.categoryId]);

/** What the shop receives: no internal fields, and a computed availability. */
export function publicView(p) {
  return {
    slug: p.slug,
    name: p.name,
    categoryId: p.categoryId,
    categoryIds: categoriesOf(p),
    price: p.price || 0,
    compareAtPrice: p.compareAtPrice || 0,
    description: p.description || '',
    details: p.details || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
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
