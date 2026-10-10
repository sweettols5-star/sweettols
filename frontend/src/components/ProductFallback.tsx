'use client';

import { useSearchParams } from 'next/navigation';
import { routes } from '@/lib/routes';
import { useT } from './LangProvider';
import Link from './Link';
import { useProductBySlug } from './LiveCatalogue';
import ProductView from './ProductView';

/**
 * Sheet for a product added in /admin after the last build: rendered in the
 * browser from the live catalogue until the next build gives it its own page.
 */
export default function ProductFallback() {
  const slug = (useSearchParams().get('slug') || '').trim();
  const { product, ready } = useProductBySlug(slug);
  const t = useT().product;

  if (product) return <ProductView product={product} />;

  return (
    <div className="container section">
      <div className="empty">
        <p>{ready || !slug ? t.notFound : t.loading}</p>
        {(ready || !slug) && (
          <Link href={routes.shop} className="btn btn--primary">
            {t.seeShop}
          </Link>
        )}
      </div>
    </div>
  );
}
