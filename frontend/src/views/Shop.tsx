import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import ShopBrowser from '@/components/ShopBrowser';
import { getDict, type Lang } from '@/i18n';
import { locProduct } from '@/i18n/content';
import { products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export function shopMeta(lang: Lang) {
  const t = getDict(lang).pages.shop;
  return pageMeta({ lang, title: t.title, description: t.description, path: routes.shop });
}

export default function ShopView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.shop;
  const list = products.map((p) => locProduct(p, lang));
  return (
    <div className="container section">
      <Breadcrumbs lang={lang} items={[{ label: t.crumb }]} />
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p>{t.intro}</p>
      </header>
      {/* useSearchParams needs a Suspense boundary in a static export; the
          fallback is the same grid without the search, so the HTML is complete. */}
      <Suspense fallback={<ProductGrid products={list} sortable />}>
        <ShopBrowser products={list} />
      </Suspense>
    </div>
  );
}
