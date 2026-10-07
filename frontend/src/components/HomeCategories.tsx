'use client';

import { categoryImage } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { useCategories, useProducts } from './LiveCatalogue';
import Link from './Link';

/** Category tiles, each illustrated by its own picture or its first product's. */
export default function HomeCategories() {
  const categories = useCategories();
  const products = useProducts();
  // An empty category would lead to an empty page: keep it off the home page.
  const shown = categories.filter((c) => products.some((p) => p.categoryId === c.id));

  return (
    <div className="cats">
      {shown.map((c) => {
        const n = products.filter((p) => p.categoryId === c.id).length;
        return (
          <Link key={c.id} href={routes.category(c.id)} className="cat">
            <span className="cat__img">
              <img src={categoryImage(c, products)} alt="" width={240} height={240} loading="lazy" />
            </span>
            <span className="cat__name">{c.name}</span>
            <span className="cat__count">
              {n} produit{n > 1 ? 's' : ''}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
