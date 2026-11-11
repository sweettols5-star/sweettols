'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { routes } from '@/lib/routes';
import { useT } from './LangProvider';
import Link from './Link';
import { useProductBySlug } from './LiveCatalogue';
import ProductView from './ProductView';

/**
 * Sheet for a product added in /admin after the last build: rendered in the
 * browser from the live catalogue until the next build gives it its own page.
 *
 * Reached two ways: /produit/?slug=<slug> (links inside the shop), or the
 * product's normal address /produit/<slug>/, which Nginx answers with this
 * page when no file was built for it (a link shared before the next build).
 */
export default function ProductFallback() {
  const query = (useSearchParams().get('slug') || '').trim();
  // Read from the real address bar: the router reports the page that was served (/produit/).
  const [fromPath, setFromPath] = useState('');
  const [pathRead, setPathRead] = useState(false);
  useEffect(() => {
    const m = window.location.pathname.match(/\/produit\/([^/]+)\/?$/);
    if (m) {
      try {
        setFromPath(decodeURIComponent(m[1]).trim());
      } catch {
        /* malformed address: not found */
      }
    }
    setPathRead(true);
  }, []);
  const slug = query || fromPath;
  const { product, ready } = useProductBySlug(slug);
  const t = useT().product;

  if (!slug && !pathRead) return <div className="container section" aria-busy="true" />;

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
