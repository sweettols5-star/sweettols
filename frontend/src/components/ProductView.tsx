'use client';

import { locCategory } from '@/i18n/content';
import { categoryById } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import type { Product } from '@/types';
import AddToCart from './AddToCart';
import Gallery from './Gallery';
import { IconCash, IconCheck, IconTruck } from './Icons';
import { useLang, useT } from './LangProvider';
import { useCategories, useLiveProduct, useProducts, useSettings } from './LiveCatalogue';
import Link from './Link';
import Price from './Price';
import ProductCard from './ProductCard';

/** The product sheet. Rendered statically from the snapshot, then refreshed live. */
export default function ProductView({ product: built }: { product: Product }) {
  const { product, removed } = useLiveProduct(built);
  const settings = useSettings();
  const categories = useCategories();
  const all = useProducts();
  const lang = useLang();
  const t = useT();
  const builtCategory = categoryById(product.categoryId);
  const category =
    categories.find((c) => c.id === product.categoryId) ?? (builtCategory && locCategory(builtCategory, lang));

  const related = all
    .filter((p) => p.categoryId === product.categoryId && p.slug !== product.slug)
    .sort((a, b) => Number(b.price > 0) - Number(a.price > 0))
    .slice(0, 4);

  const fees = settings.zones.map((z) => z.fee).filter((f) => f > 0);
  const minFee = fees.length ? Math.min(...fees) : 0;

  return (
    <>
      <section className="product container">
        <Gallery images={product.images} name={product.name} />

        <div className="product__info">
          {category && (
            <Link href={routes.category(category.id)} className="eyebrow">
              {category.name}
            </Link>
          )}
          <h1 className="product__title">{product.name}</h1>
          <Price product={product} large />

          {removed ? (
            <p className="notice notice--warn">{t.product.removed}</p>
          ) : (
            <>
              <p className={`stock${product.inStock ? '' : ' stock--out'}`}>
                <span aria-hidden className="stock__dot" />
                {!product.inStock
                  ? t.product.outOfStock
                  : product.lowStock
                    ? t.product.inStockLow(product.lowStock)
                    : t.product.inStock}
              </p>
              {!product.price && (
                <p className="notice">{t.product.priceSoon}</p>
              )}
              <AddToCart product={product} withQty />
            </>
          )}

          <ul className="assure">
            <li>
              <IconCash />
              <span>
                <strong>{t.product.codTitle}</strong>
                {t.product.codText}
              </span>
            </li>
            <li>
              <IconTruck />
              <span>
                <strong>{t.product.shipTitle}</strong>
                {minFee ? t.product.shipFrom(t.dh(minFee)) : t.product.shipAtCheckout}
                {settings.freeShippingThreshold > 0 && t.product.shipFreeFrom(t.dh(settings.freeShippingThreshold))}.
              </span>
            </li>
          </ul>

          {product.description && (
            <div className="product__desc">
              <h2>{t.product.description}</h2>
              <p>{product.description}</p>
            </div>
          )}
          {product.details.length > 0 && (
            <div className="product__desc">
              <h2>{t.product.features}</h2>
              <ul className="checks">
                {product.details.map((d) => (
                  <li key={d}>
                    <IconCheck width={16} height={16} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <h2 className="section__title">{t.product.related}</h2>
            {category && (
              <Link href={routes.category(category.id)} className="link-arrow">
                {t.product.seeCategory}
              </Link>
            )}
          </div>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
