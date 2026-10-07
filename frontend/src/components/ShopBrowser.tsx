'use client';

import { useSearchParams } from 'next/navigation';
import { routes } from '@/lib/routes';
import type { Product } from '@/types';
import { useCategories, useProducts } from './LiveCatalogue';
import Link from './Link';
import ProductGrid from './ProductGrid';

/** /boutique/ : every product, the category chips, and the ?q= search from the header. */
export default function ShopBrowser({ products }: { products: Product[] }) {
  const query = (useSearchParams().get('q') || '').trim();
  const categories = useCategories();
  const live = useProducts();

  return (
    <>
      <nav className="chips" aria-label="Catégories">
        <Link href={routes.shop} className="chip is-active">
          Tout
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
          Résultats pour « <strong>{query}</strong> » — <Link href={routes.shop}>effacer</Link>
        </p>
      )}

      <ProductGrid
        products={products}
        query={query}
        sortable
        empty={query ? 'Aucun produit ne correspond à votre recherche.' : undefined}
      />
    </>
  );
}
