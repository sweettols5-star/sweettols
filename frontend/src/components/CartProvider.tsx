'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { validOptions } from '@/i18n/content';
import { isSellable } from '@/lib/catalogue';
import type { Product } from '@/types';
import { useProducts } from './LiveCatalogue';

const STORAGE_KEY = 'sweettools.cart.v1';

/**
 * Only slug, options and qty are stored: prices are always re-read from the
 * catalogue. The same product in two colours makes two lines.
 */
type StoredLine = { slug: string; qty: number; color?: string; size?: string };

/** Chosen colour (French name) and size (cm, no unit), when the product has some. */
export type CartOptions = { color?: string; size?: string };

export type CartLine = {
  /** Identifies the line for setQty / remove: slug + options. */
  key: string;
  product: Product;
  qty: number;
  color?: string;
  size?: string;
  /** False when the product lost its price, stock or the chosen option since it was added. */
  sellable: boolean;
  /** The chosen colour or size is no longer offered (or was never chosen). */
  optionGone: boolean;
};

const keyOf = (l: { slug: string; color?: string; size?: string }) => [l.slug, l.color || '', l.size || ''].join('|');

interface CartApi {
  lines: CartLine[];
  /** Units across all lines. */
  count: number;
  /** Sum of the sellable lines only. */
  subtotal: number;
  /** Something in the cart can no longer be ordered. */
  blocked: boolean;
  add: (product: Product, qty?: number, options?: CartOptions) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** False on the first render so server and client HTML match. */
  ready: boolean;
  /** Bumped on every add, for the header badge animation. */
  lastAdd: number;
}

const CartContext = createContext<CartApi | null>(null);
const MAX = 99;

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useProducts();
  const [stored, setStored] = useState<StoredLine[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdd, setLastAdd] = useState(0);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(parsed)) {
        setStored(
          parsed
            .filter((l) => l && typeof l.slug === 'string' && Number.isFinite(l.qty))
            .map((l) => ({
              slug: l.slug,
              qty: Math.max(1, Math.min(MAX, Math.floor(l.qty))),
              ...(typeof l.color === 'string' && l.color ? { color: l.color } : {}),
              ...(typeof l.size === 'string' && l.size ? { size: l.size } : {}),
            })),
        );
      }
    } catch {
      /* blocked storage: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* the cart still works for this page view */
    }
  }, [stored, ready]);

  const api = useMemo<CartApi>(() => {
    const lines = stored
      .map((l): CartLine | null => {
        const product = products.find((p) => p.slug === l.slug);
        if (!product) return null;
        const optionGone = !validOptions(product, l.color, l.size);
        return {
          key: keyOf(l),
          product,
          qty: l.qty,
          color: l.color,
          size: l.size,
          sellable: isSellable(product) && !optionGone,
          optionGone,
        };
      })
      .filter((l): l is CartLine => l !== null);

    return {
      lines,
      ready,
      lastAdd,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + (l.sellable ? l.product.price * l.qty : 0), 0),
      blocked: lines.some((l) => !l.sellable),
      add: (product, qty = 1, options = {}) => {
        if (!isSellable(product)) return;
        const line: StoredLine = {
          slug: product.slug,
          qty: Math.min(MAX, qty),
          ...(product.colors?.length && options.color ? { color: options.color } : {}),
          ...(product.sizes?.length && options.size ? { size: options.size } : {}),
        };
        const key = keyOf(line);
        setStored((prev) =>
          prev.some((l) => keyOf(l) === key)
            ? prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(MAX, l.qty + qty) } : l))
            : [...prev, line],
        );
        setLastAdd(Date.now());
      },
      setQty: (key, qty) =>
        setStored((prev) =>
          qty <= 0
            ? prev.filter((l) => keyOf(l) !== key)
            : prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(MAX, qty) } : l)),
        ),
      remove: (key) => setStored((prev) => prev.filter((l) => keyOf(l) !== key)),
      clear: () => setStored([]),
    };
  }, [stored, ready, products, lastAdd]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
