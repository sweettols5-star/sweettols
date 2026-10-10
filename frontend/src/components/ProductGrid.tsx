'use client';

import { useMemo, useState } from 'react';
import { isSellable } from '@/lib/catalogue';
import type { Product } from '@/types';
import { useLang, useT } from './LangProvider';
import { useLiveList } from './LiveCatalogue';
import ProductCard from './ProductCard';

type Sort = 'default' | 'price-asc' | 'price-desc' | 'name';

/** Accent-insensitive lower-case, for the search box. */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * A grid of products refreshed from the live catalogue, with an optional sort
 * bar. The built order is the default so the static HTML and the first client
 * render match.
 */
export default function ProductGrid({
  products,
  categoryId,
  query = '',
  sortable = false,
  empty,
}: {
  products: Product[];
  categoryId?: string;
  query?: string;
  sortable?: boolean;
  empty?: string;
}) {
  const live = useLiveList(products, categoryId);
  const lang = useLang();
  const t = useT().grid;
  const [sort, setSort] = useState<Sort>('default');

  const list = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    let out = words.length
      ? live.filter((p) => {
          const hay = fold(`${p.name} ${p.description} ${p.details.join(' ')}`);
          return words.every((w) => hay.includes(w));
        })
      : live;
    // Orderable products first: an « à venir » card should not open the page.
    const rank = (p: Product) => (isSellable(p) ? 0 : 1);
    out = [...out].sort((a, b) => {
      if (sort === 'price-asc') return (a.price || Infinity) - (b.price || Infinity);
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name, lang);
      return rank(a) - rank(b);
    });
    return out;
  }, [live, query, sort, lang]);

  return (
    <>
      {sortable && (
        <div className="toolbar">
          <p className="toolbar__count">{t.count(list.length)}</p>
          <label className="toolbar__sort">
            <span>{t.sort}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="default">{t.sortDefault}</option>
              <option value="price-asc">{t.priceAsc}</option>
              <option value="price-desc">{t.priceDesc}</option>
              <option value="name">{t.nameAz}</option>
            </select>
          </label>
        </div>
      )}
      {list.length ? (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <p className="empty">{empty ?? t.empty}</p>
      )}
    </>
  );
}
