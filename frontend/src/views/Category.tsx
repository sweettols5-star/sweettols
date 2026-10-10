import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryChips from '@/components/CategoryChips';
import JsonLd from '@/components/JsonLd';
import ProductGrid from '@/components/ProductGrid';
import { getDict, type Lang } from '@/i18n';
import { locCategory, locProduct } from '@/i18n/content';
import { categories, categoryById, categoryImage, productsIn } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { abs, excerpt, pageMeta } from '@/lib/seo';

/** Every category page is built from the snapshot. */
export const categoryParams = () => categories.map((c) => ({ id: c.id }));

export function categoryMeta(lang: Lang, id: string) {
  const raw = categoryById(id);
  if (!raw) return {};
  const t = getDict(lang);
  const c = locCategory(raw, lang);
  return pageMeta({
    lang,
    title: t.categories.metaTitle(c.name),
    description: excerpt(`${c.description} ${t.meta.codSuffix}`),
    path: routes.category(c.id),
    image: categoryImage(raw).replace('-thumb.webp', '.webp'),
  });
}

export default function CategoryView({ lang, id }: { lang: Lang; id: string }) {
  const raw = categoryById(id);
  if (!raw) notFound();
  const t = getDict(lang);
  const category = locCategory(raw, lang);
  const list = productsIn(category.id).map((p) => locProduct(p, lang));

  return (
    <div className="container section">
      <Breadcrumbs lang={lang} items={[{ label: t.pages.shop.crumb, href: routes.shop }, { label: category.name }]} />
      <header className="page-head">
        <h1 className="page-title">{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </header>
      <CategoryChips current={category.id} />
      <ProductGrid products={list} categoryId={category.id} sortable empty={t.grid.categoryEmpty} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.name,
          url: abs(lang, routes.category(category.id)),
          inLanguage: lang,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: list.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: abs(lang, routes.product(p.slug)),
              name: p.name,
            })),
          },
        }}
      />
    </div>
  );
}
