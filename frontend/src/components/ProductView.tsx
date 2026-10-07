'use client';

import { categoryById } from '@/lib/catalogue';
import { dh } from '@/lib/format';
import { routes } from '@/lib/routes';
import type { Product } from '@/types';
import AddToCart from './AddToCart';
import Gallery from './Gallery';
import { IconCash, IconCheck, IconTruck } from './Icons';
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
  const category = categories.find((c) => c.id === product.categoryId) ?? categoryById(product.categoryId);

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
            <p className="notice notice--warn">Ce produit n’est plus proposé à la vente.</p>
          ) : (
            <>
              <p className={`stock${product.inStock ? '' : ' stock--out'}`}>
                <span aria-hidden className="stock__dot" />
                {!product.inStock
                  ? 'Rupture de stock'
                  : product.lowStock
                    ? `En stock — plus que ${product.lowStock}`
                    : 'En stock'}
              </p>
              {!product.price && (
                <p className="notice">Le prix de ce produit sera bientôt publié. Contactez-nous pour le connaître.</p>
              )}
              <AddToCart product={product} withQty />
            </>
          )}

          <ul className="assure">
            <li>
              <IconCash />
              <span>
                <strong>Paiement à la livraison</strong>
                Vous payez en espèces à la réception.
              </span>
            </li>
            <li>
              <IconTruck />
              <span>
                <strong>Livraison partout au Maroc</strong>
                {minFee ? `À partir de ${dh(minFee)}` : 'Frais affichés à la commande'}
                {settings.freeShippingThreshold > 0 && `, offerte dès ${dh(settings.freeShippingThreshold)}`}.
              </span>
            </li>
          </ul>

          {product.description && (
            <div className="product__desc">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>
          )}
          {product.details.length > 0 && (
            <div className="product__desc">
              <h2>Caractéristiques</h2>
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
            <h2 className="section__title">Vous aimerez aussi</h2>
            {category && (
              <Link href={routes.category(category.id)} className="link-arrow">
                Voir la catégorie →
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
