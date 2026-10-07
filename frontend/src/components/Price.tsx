import { dh } from '@/lib/format';
import type { Product } from '@/types';

/** Price, struck-through old price, or « Prix à venir » when the owner has not priced it yet. */
export default function Price({ product, large = false }: { product: Product; large?: boolean }) {
  const cls = `price${large ? ' price--lg' : ''}`;
  if (!product.price) return <p className={`${cls} price--pending`}>Prix à venir</p>;
  return (
    <p className={cls}>
      <span className="price__now">{dh(product.price)}</span>
      {product.compareAtPrice > product.price && (
        <s className="price__was" aria-label={`au lieu de ${dh(product.compareAtPrice)}`}>
          {dh(product.compareAtPrice)}
        </s>
      )}
    </p>
  );
}
