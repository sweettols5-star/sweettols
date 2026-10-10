'use client';

import type { Product } from '@/types';
import { useT } from './LangProvider';

/** Price, struck-through old price, or « Prix à venir » when the owner has not priced it yet. */
export default function Price({ product, large = false }: { product: Product; large?: boolean }) {
  const t = useT();
  const cls = `price${large ? ' price--lg' : ''}`;
  if (!product.price) return <p className={`${cls} price--pending`}>{t.product.pricePending}</p>;
  return (
    <p className={cls}>
      <span className="price__now">{t.dh(product.price)}</span>
      {product.compareAtPrice > product.price && (
        <s className="price__was" aria-label={t.product.insteadOf(t.dh(product.compareAtPrice))}>
          {t.dh(product.compareAtPrice)}
        </s>
      )}
    </p>
  );
}
