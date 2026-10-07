import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryChips from '@/components/CategoryChips';
import JsonLd from '@/components/JsonLd';
import ProductGrid from '@/components/ProductGrid';
import { site } from '@/config/site';
import { categories, categoryById, categoryImage, productsIn } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { excerpt, pageMeta } from '@/lib/seo';

// Static export: every category page is built from the snapshot.
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const c = categoryById((await params).id);
  if (!c) return {};
  return pageMeta({
    title: `${c.name} — matériel de pâtisserie`,
    description: excerpt(`${c.description} Paiement à la livraison partout au Maroc.`),
    path: routes.category(c.id),
    image: categoryImage(c).replace('-thumb.webp', '.webp'),
  });
}

export default async function CategoryPage({ params }: Props) {
  const category = categoryById((await params).id);
  if (!category) notFound();
  const list = productsIn(category.id);

  return (
    <div className="container section">
      <Breadcrumbs items={[{ label: 'Boutique', href: routes.shop }, { label: category.name }]} />
      <header className="page-head">
        <h1 className="page-title">{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </header>
      <CategoryChips current={category.id} />
      <ProductGrid
        products={list}
        categoryId={category.id}
        sortable
        empty="Cette catégorie sera bientôt remplie. En attendant, découvrez le reste de la boutique."
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.name,
          url: `${site.url}${routes.category(category.id)}`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: list.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${site.url}${routes.product(p.slug)}`,
              name: p.name,
            })),
          },
        }}
      />
    </div>
  );
}
