'use client';

import { routes } from '@/lib/routes';
import { useCategories, useProducts } from './LiveCatalogue';
import Link from './Link';

export default function CategoryChips({ current }: { current: string }) {
  const categories = useCategories();
  const products = useProducts();
  return (
    <nav className="chips" aria-label="Catégories">
      <Link href={routes.shop} className="chip">
        Tout
      </Link>
      {categories
        .filter((c) => c.id === current || products.some((p) => p.categoryId === c.id))
        .map((c) => (
          <Link
            key={c.id}
            href={routes.category(c.id)}
            className={`chip${c.id === current ? ' is-active' : ''}`}
            aria-current={c.id === current ? 'page' : undefined}
          >
            {c.name}
          </Link>
        ))}
    </nav>
  );
}
