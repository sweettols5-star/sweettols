import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ProductView from '@/components/ProductView';
import { site } from '@/config/site';
import { categoryById, productBySlug, products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { excerpt, pageMeta } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = productBySlug((await params).slug);
  if (!p) return {};
  const price = p.price ? ` — ${p.price} DH` : '';
  return pageMeta({
    title: `${p.name}${price}`,
    description: excerpt(`${p.description} Paiement à la livraison partout au Maroc.`),
    path: routes.product(p.slug),
    image: p.images[0]?.url,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  const category = categoryById(product.categoryId);
  const url = `${site.url}${routes.product(product.slug)}`;

  return (
    <>
      <div className="container crumbs-wrap">
        <Breadcrumbs
          items={[
            { label: 'Boutique', href: routes.shop },
            ...(category ? [{ label: category.name, href: routes.category(category.id) }] : []),
            { label: product.name },
          ]}
        />
      </div>
      <ProductView product={product} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images.map((i) => `${i.url.startsWith('http') ? '' : site.url}${i.url}`),
          sku: product.slug,
          brand: { '@type': 'Brand', name: site.brand },
          ...(category ? { category: category.name } : {}),
          url,
          // No Offer without a price: Google rejects an offer at 0.
          ...(product.price
            ? {
                offers: {
                  '@type': 'Offer',
                  url,
                  price: product.price,
                  priceCurrency: 'MAD',
                  availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                  itemCondition: 'https://schema.org/NewCondition',
                  seller: { '@type': 'Organization', name: site.brand },
                },
              }
            : {}),
        }}
      />
    </>
  );
}
