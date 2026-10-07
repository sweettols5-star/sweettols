import raw from '@/data/catalogue.json';
import type { Catalogue, Category, Product } from '@/types';

/**
 * The build-time snapshot (scripts/sync-catalogue.mjs). Every static page is
 * generated from it; the browser then refreshes it through LiveCatalogue.
 */
const data = raw as unknown as Catalogue;

export const products: Product[] = data.products;
export const categories: Category[] = [...data.categories].sort((a, b) => a.order - b.order);
export const settings = data.settings;

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const productsIn = (id: string) => products.filter((p) => p.categoryId === id);

/** Can it go in the cart? Same rule as the API's isSellable. */
export const isSellable = (p: Product) => p.price > 0 && p.inStock;

/** Picture standing for a category: its own, else its first product's. */
export function categoryImage(c: Category, list: Product[] = products): string {
  if (c.image) return c.image;
  const p = list.find((x) => x.categoryId === c.id && x.images.length);
  return p ? p.images[0].thumb : '/brand/emblem.png';
}

/** Featured first, then priced, then the rest — the home page's selection. */
export function bestSellers(list: Product[], n = 8): Product[] {
  const score = (p: Product) => (p.featured ? 2 : 0) + (isSellable(p) ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a)).slice(0, n);
}
