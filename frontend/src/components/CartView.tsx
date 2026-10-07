'use client';

import { dh } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useCart } from './CartProvider';
import { IconArrow, IconBag, IconTrash } from './Icons';
import { useSettings } from './LiveCatalogue';
import MinOrderNotice, { useMinOrder } from './MinOrderNotice';
import Link from './Link';
import OrderSteps from './OrderSteps';
import { productHref } from './ProductCard';

export default function CartView() {
  const cart = useCart();
  const settings = useSettings();
  const minOrder = useMinOrder(cart.subtotal);

  if (!cart.ready) return <div className="container section" aria-busy="true" />;

  if (!cart.lines.length) {
    return (
      <div className="container section">
        <h1 className="page-title">Mon panier</h1>
        <div className="empty">
          <IconBag width={40} height={40} />
          <p>Votre panier est vide.</p>
          <Link href={routes.shop} className="btn btn--primary">
            Découvrir la boutique
          </Link>
        </div>
      </div>
    );
  }

  const fees = settings.zones.map((z) => z.fee);
  const minFee = fees.length ? Math.min(...fees) : 0;
  const free = settings.freeShippingThreshold;
  const missing = free > 0 ? free - cart.subtotal : 0;

  return (
    <div className="container section">
      <h1 className="page-title">Mon panier</h1>
      <OrderSteps current={1} />

      <div className="checkout">
        <div className="checkout__main">
          <ul className="lines">
            {cart.lines.map(({ product, qty, sellable }) => {
              const href = productHref(product.slug);
              return (
                <li key={product.slug} className={`line${sellable ? '' : ' line--blocked'}`}>
                  <Link href={href} className="line__img" tabIndex={-1} aria-hidden>
                    <img src={product.images[0]?.thumb || '/brand/emblem.png'} alt="" width={96} height={96} />
                  </Link>
                  <div className="line__body">
                    <Link href={href} className="line__name">
                      {product.name}
                    </Link>
                    {sellable ? (
                      <span className="line__unit">{dh(product.price)} / pièce</span>
                    ) : (
                      <span className="line__warn">Plus disponible — retirez-le pour commander.</span>
                    )}
                  </div>
                  <div className="qty qty--sm" role="group" aria-label={`Quantité de ${product.name}`}>
                    <button type="button" onClick={() => cart.setQty(product.slug, qty - 1)} aria-label="Retirer un">
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(product.slug, qty + 1)}
                      aria-label="Ajouter un"
                      disabled={!sellable}
                    >
                      +
                    </button>
                  </div>
                  <span className="line__total">{sellable ? dh(product.price * qty) : '—'}</span>
                  <button
                    type="button"
                    className="icon-btn line__remove"
                    onClick={() => cart.remove(product.slug)}
                    aria-label={`Retirer ${product.name} du panier`}
                  >
                    <IconTrash width={18} height={18} />
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href={routes.shop} className="link-back">
            ← Continuer mes achats
          </Link>
        </div>

        <aside className="summary">
          <h2>Récapitulatif</h2>
          <dl>
            <div>
              <dt>Sous-total</dt>
              <dd>{dh(cart.subtotal)}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{missing <= 0 && free > 0 ? 'Offerte' : `dès ${dh(minFee)}`}</dd>
            </div>
          </dl>
          {missing > 0 && <p className="summary__hint">Plus que {dh(missing)} pour la livraison offerte.</p>}
          <p className="summary__note">Les frais exacts dépendent de votre ville, choisie à l’étape suivante.</p>
          <MinOrderNotice subtotal={cart.subtotal} />
          {cart.blocked ? (
            <p className="notice notice--warn">Retirez les articles indisponibles pour continuer.</p>
          ) : minOrder.blocked ? (
            <button type="button" className="btn btn--primary btn--block" disabled>
              Passer à la livraison <IconArrow width={18} height={18} />
            </button>
          ) : (
            <Link href={routes.checkout} className="btn btn--primary btn--block">
              Passer à la livraison <IconArrow width={18} height={18} />
            </Link>
          )}
          <p className="summary__cod">Paiement en espèces à la livraison</p>
        </aside>
      </div>
    </div>
  );
}
