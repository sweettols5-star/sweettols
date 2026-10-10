'use client';

import { useSearchParams } from 'next/navigation';
import { routes } from '@/lib/routes';
import type { Product } from '@/types';
import { rich } from '@/i18n/rich';
import { useT } from './LangProvider';
import { useCategories, useProducts } from './LiveCatalogue';
import Link from './Link';
import ProductGrid from './ProductGrid';

/** /boutique/ : every product, the category chips, and the ?q= search from the header. */
export default function ShopBrowser({ products }: { products: Product[] }) {
  const query = (useSearchParams().get('q') || '').trim();
  const categories = useCategories();
  const live = useProducts();
  const t = useT();

  return (
    <>
      <nav className="chips" aria-label={t.nav.categories}>
        <Link href={routes.shop} className="chip is-active">
          {t.grid.all}
        </Link>
        {categories
          .filter((c) => live.some((p) => p.categoryId === c.id))
          .map((c) => (
            <Link key={c.id} href={routes.category(c.id)} className="chip">
              {c.name}
            </Link>
          ))}
      </nav>

      {query && (
        <p className="search-note">
          {rich(t.grid.resultsFor, {
            q: <strong>{query}</strong>,
            clear: <Link href={routes.shop}>{t.grid.clear}</Link>,
          })}
        </p>
      )}

      <ProductGrid
        products={products}
        query={query}
        sortable
        empty={query ? t.grid.noResults : undefined}
      />
    </>
  );
}
