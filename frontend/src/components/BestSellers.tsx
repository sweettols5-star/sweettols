'use client';

import { bestSellers } from '@/lib/catalogue';
import { useProducts } from './LiveCatalogue';
import ProductCard from './ProductCard';

/** The owner's « featured » products first, then what can be ordered today. */
export default function BestSellers({ count = 8 }: { count?: number }) {
  const list = bestSellers(useProducts(), count);
  return (
    <div className="grid">
      {list.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
