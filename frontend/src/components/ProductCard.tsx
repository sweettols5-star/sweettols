'use client';

import { routes } from '@/lib/routes';
import type { Product } from '@/types';
import AddToCart from './AddToCart';
import { useT } from './LangProvider';
import { hasStaticPage } from './LiveCatalogue';
import Link from './Link';
import Price from './Price';

export function productHref(slug: string) {
  return hasStaticPage(slug) ? routes.product(slug) : routes.productFallback(slug);
}

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useT().product;
  const href = productHref(product.slug);
  const img = product.images[0];
  const badge = !product.inStock
    ? t.soldOut
    : product.compareAtPrice > product.price && product.price
      ? t.promo
      : product.lowStock
        ? t.onlyLeft(product.lowStock)
        : '';

  return (
    <article className="card">
      <Link href={href} className="card__media" tabIndex={-1} aria-hidden>
        {img ? (
          <img
            src={img.thumb}
            alt=""
            width={500}
            height={500}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <img src="/brand/emblem.png" alt="" width={256} height={256} className="card__placeholder" />
        )}
        {badge && <span className="card__badge">{badge}</span>}
      </Link>
      <div className="card__body">
        <h3 className="card__title" title={product.name}>
          <Link href={href}>{product.name}</Link>
        </h3>
        <Price product={product} />
        <AddToCart product={product} />
      </div>
    </article>
  );
}
