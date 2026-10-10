'use client';

import { routes } from '@/lib/routes';
import { useT } from './LangProvider';
import { useShownCategories } from './LiveCatalogue';
import Link from './Link';

export default function CategoryChips({ current }: { current: string }) {
  const categories = useShownCategories();
  const t = useT();
  return (
    <nav className="chips" aria-label={t.nav.categories}>
      <Link href={routes.shop} className="chip">
        {t.grid.all}
      </Link>
      {categories.map((c) => (
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
