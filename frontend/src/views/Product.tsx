import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ProductFallback from '@/components/ProductFallback';
import ProductView from '@/components/ProductView';
import { site } from '@/config/site';
import { getDict, type Lang } from '@/i18n';
import { locCategory, locProduct } from '@/i18n/content';
import { categoryById, productBySlug, products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { abs, excerpt, pageMeta } from '@/lib/seo';

export const productParams = () => products.map((p) => ({ slug: p.slug }));

export function productMeta(lang: Lang, slug: string) {
  const raw = productBySlug(slug);
  if (!raw) return {};
  const t = getDict(lang);
  const p = locProduct(raw, lang);
  const price = p.price ? ` — ${t.dh(p.price)}` : '';
  return pageMeta({
    lang,
    title: `${p.name}${price}`,
    description: excerpt(`${p.description} ${t.meta.codSuffix}`),
    path: routes.product(p.slug),
    image: p.images[0]?.url,
  });
}

export default function ProductPageView({ lang, slug }: { lang: Lang; slug: string }) {
  const raw = productBySlug(slug);
  if (!raw) notFound();
  const t = getDict(lang);
  const product = locProduct(raw, lang);
  const rawCategory = categoryById(product.categoryId);
  const category = rawCategory && locCategory(rawCategory, lang);
  const url = abs(lang, routes.product(product.slug));

  return (
    <>
      <div className="container crumbs-wrap">
        <Breadcrumbs
          lang={lang}
          items={[
            { label: t.pages.shop.crumb, href: routes.shop },
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

/** /produit/?slug=… — products added after the last build. Never indexed. */
export function productFallbackMeta(lang: Lang) {
  const t = getDict(lang).product;
  return pageMeta({ lang, title: t.metaTitle, description: t.metaDescription, path: '/produit/', noindex: true });
}

export function ProductFallbackView({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<div className="container section">{getDict(lang).product.loading}</div>}>
      <ProductFallback />
    </Suspense>
  );
}
