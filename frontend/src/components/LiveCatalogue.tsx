'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiUrl } from '@/config/api';
import * as built from '@/lib/catalogue';
import type { Catalogue, Category, Product, Settings } from '@/types';

/**
 * The catalogue, refreshed in the browser.
 *
 * Pages are static HTML frozen at build time, so a price changed in /admin is
 * stale until the next build. One request per page load brings back live
 * prices, stock, new products and delivery fees. If the API is asleep or down,
 * everything quietly stays on the built snapshot.
 */

const Ctx = createContext<Catalogue | null>(null);

let pending: Promise<Catalogue | null> | null = null;

function load(): Promise<Catalogue | null> {
  if (pending) return pending;
  // `no-cache` = always revalidate with the API (a cheap 304 via its ETag when
  // nothing changed). Without it the browser honours the API's max-age and an
  // edit made in /admin stays invisible for up to 20 s.
  pending = fetch(apiUrl('/api/catalogue'), { headers: { Accept: 'application/json' }, cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) =>
      // An empty answer is a misconfigured API, not an empty shop.
      Array.isArray(data?.products) && data.products.length && Array.isArray(data?.categories) && data.settings
        ? (data as Catalogue)
        : null,
    )
    .catch(() => null);
  return pending;
}

export function LiveCatalogueProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<Catalogue | null>(null);

  useEffect(() => {
    let alive = true;
    load().then((snap) => {
      if (alive && snap) setLive(snap);
    });
    return () => {
      alive = false;
    };
  }, []);

  return <Ctx.Provider value={live}>{children}</Ctx.Provider>;
}

/** null until the live answer arrives. */
export const useLiveCatalogue = () => useContext(Ctx);

export function useProducts(): Product[] {
  return useContext(Ctx)?.products ?? built.products;
}

export function useCategories(): Category[] {
  const live = useContext(Ctx);
  return live ? [...live.categories].sort((a, b) => a.order - b.order) : built.categories;
}

export function useSettings(): Settings {
  return useContext(Ctx)?.settings ?? built.settings;
}

const BUILT_CATEGORIES = new Set(built.categories.map((c) => c.id));

/**
 * Categories worth a link, empty ones included (their page says « bientôt »).
 * One created in /admin after the build has no page yet: it shows from the
 * next deploy instead of linking to a 404.
 */
export function useShownCategories(): Category[] {
  return useCategories().filter((c) => BUILT_CATEGORIES.has(c.id));
}

const BUILT_SLUGS = new Set(built.products.map((p) => p.slug));
export const hasStaticPage = (slug: string) => BUILT_SLUGS.has(slug);

/**
 * Live version of a product. `removed`: hidden or deleted after the build —
 * the page still exists, so it says so instead of taking an order.
 */
export function useLiveProduct(product: Product): { product: Product; removed: boolean } {
  const live = useContext(Ctx);
  if (!live) return { product, removed: false };
  const fresh = live.products.find((p) => p.slug === product.slug);
  return fresh ? { product: fresh, removed: false } : { product, removed: true };
}

export function useProductBySlug(slug: string): { product: Product | null; ready: boolean } {
  const live = useContext(Ctx);
  if (!live) return { product: built.productBySlug(slug) ?? null, ready: false };
  return { product: live.products.find((p) => p.slug === slug) ?? null, ready: true };
}

/**
 * A list refreshed without reshuffling: built order kept for products already
 * on screen, newcomers appended, removed ones dropped.
 */
export function useLiveList(fallback: Product[], categoryId?: string): Product[] {
  const live = useContext(Ctx);
  if (!live) return fallback;
  const wanted = categoryId ? live.products.filter((p) => p.categoryId === categoryId) : live.products;
  const bySlug = new Map(wanted.map((p) => [p.slug, p]));
  const kept = fallback.map((p) => bySlug.get(p.slug)).filter(Boolean) as Product[];
  const seen = new Set(kept.map((p) => p.slug));
  return [...kept, ...wanted.filter((p) => !seen.has(p.slug))];
}
