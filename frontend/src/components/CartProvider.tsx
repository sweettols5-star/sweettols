'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSellable } from '@/lib/catalogue';
import type { Product } from '@/types';
import { useProducts } from './LiveCatalogue';

const STORAGE_KEY = 'sweettools.cart.v1';

/** Only slug + qty are stored: prices are always re-read from the catalogue. */
type StoredLine = { slug: string; qty: number };

export type CartLine = {
  product: Product;
  qty: number;
  /** False when the product lost its price or stock since it was added. */
  sellable: boolean;
};

interface CartApi {
  lines: CartLine[];
  /** Units across all lines. */
  count: number;
  /** Sum of the sellable lines only. */
  subtotal: number;
  /** Something in the cart can no longer be ordered. */
  blocked: boolean;
  add: (product: Product, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
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
            .map((l) => ({ slug: l.slug, qty: Math.max(1, Math.min(MAX, Math.floor(l.qty))) })),
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
      .map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        return product ? { product, qty: l.qty, sellable: isSellable(product) } : null;
      })
      .filter((l): l is CartLine => l !== null);

    return {
      lines,
      ready,
      lastAdd,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + (l.sellable ? l.product.price * l.qty : 0), 0),
      blocked: lines.some((l) => !l.sellable),
      add: (product, qty = 1) => {
        if (!isSellable(product)) return;
        setStored((prev) =>
          prev.some((l) => l.slug === product.slug)
            ? prev.map((l) => (l.slug === product.slug ? { ...l, qty: Math.min(MAX, l.qty + qty) } : l))
            : [...prev, { slug: product.slug, qty: Math.min(MAX, qty) }],
        );
        setLastAdd(Date.now());
      },
      setQty: (slug, qty) =>
        setStored((prev) =>
          qty <= 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(MAX, qty) } : l)),
        ),
      remove: (slug) => setStored((prev) => prev.filter((l) => l.slug !== slug)),
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
