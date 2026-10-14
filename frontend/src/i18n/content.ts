import type { Catalogue, Category, Kit, Product, Settings, Zone } from '@/types';
import type { Lang } from './config';

/**
 * The catalogue in a language. Translations are optional, field by field:
 * whatever the owner has not translated yet stays in French. Applying it twice
 * is harmless — the French fields are only read when a translation is missing.
 */

export function locProduct(p: Product, lang: Lang): Product {
  const t = lang === 'fr' ? undefined : p.i18n?.[lang];
  if (!t) return p;
  return {
    ...p,
    name: t.name || p.name,
    description: t.description || p.description,
    details: t.details?.length ? t.details : p.details,
  };
}

/**
 * A colour in the shopper's language. `colors` keeps the French names (they
 * are what the cart and the order store); the translations sit in i18n, in
 * the same order.
 */
export function colorName(p: Product, color: string, lang: Lang): string {
  if (lang === 'fr') return color;
  const i = (p.colors || []).indexOf(color);
  return (i >= 0 && p.i18n?.[lang]?.colors?.[i]) || color;
}

/** Does the product ask for a colour or a size before going in the cart? */
export const hasOptions = (p: Product) => !!(p.colors?.length || p.sizes?.length);

/** A chosen colour/size is (still) one the product offers — none needed when it has none. */
export const validOptions = (p: Product, color?: string, size?: string) =>
  (p.colors?.length ? p.colors.includes(color || '') : true) && (p.sizes?.length ? p.sizes.includes(size || '') : true);

export function locCategory(c: Category, lang: Lang): Category {
  const t = lang === 'fr' ? undefined : c.i18n?.[lang];
  if (!t) return c;
  return { ...c, name: t.name || c.name, description: t.description || c.description };
}

export function locKit(k: Kit, lang: Lang): Kit {
  const t = lang === 'fr' ? undefined : k.i18n?.[lang];
  if (!t) return k;
  return { ...k, title: t.title || k.title, pitch: t.pitch || k.pitch };
}

export function locZone(z: Zone, lang: Lang): Zone {
  const t = lang === 'fr' ? undefined : z.i18n?.[lang];
  if (!t) return z;
  return { ...z, label: t.label || z.label, delay: t.delay || z.delay };
}

export function locSettings(s: Settings, lang: Lang): Settings {
  if (lang === 'fr') return s;
  const t = s.i18n?.[lang];
  return {
    ...s,
    baseline: t?.baseline || s.baseline,
    announcement: t?.announcement || s.announcement,
    zones: s.zones.map((z) => locZone(z, lang)),
    kits: s.kits?.map((k) => locKit(k, lang)),
  };
}

export function locCatalogue(c: Catalogue, lang: Lang): Catalogue {
  if (lang === 'fr') return c;
  return {
    ...c,
    products: c.products.map((p) => locProduct(p, lang)),
    categories: c.categories.map((x) => locCategory(x, lang)),
    settings: locSettings(c.settings, lang),
  };
}
