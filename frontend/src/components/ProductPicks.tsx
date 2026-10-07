'use client';

import type { Product } from '@/types';
import { useProducts } from './LiveCatalogue';
import ProductCard from './ProductCard';

/** A fixed list of products (by slug), refreshed live; removed ones disappear. */
export default function ProductPicks({ slugs, fallback }: { slugs: string[]; fallback: Product[] }) {
  const live = useProducts();
  const list = slugs.map((s) => live.find((p) => p.slug === s) ?? fallback.find((p) => p.slug === s)).filter((p) => !!p);
  if (!list.length) return null;
  return (
    <div className="grid">
      {list.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
