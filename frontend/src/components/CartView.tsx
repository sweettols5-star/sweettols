'use client';

import { routes } from '@/lib/routes';
import { useCart } from './CartProvider';
import { IconArrow, IconBag, IconTrash } from './Icons';
import { useT } from './LangProvider';
import { useSettings } from './LiveCatalogue';
import MinOrderNotice, { useMinOrder } from './MinOrderNotice';
import Link from './Link';
import OrderSteps from './OrderSteps';
import { productHref } from './ProductCard';

export default function CartView() {
  const cart = useCart();
  const settings = useSettings();
  const t = useT();
  const c = t.cart;
  const fees = settings.zones.map((z) => z.fee);
  const minFee = fees.length ? Math.min(...fees) : 0;
  const free = settings.freeShippingThreshold;
  const missing = free > 0 ? free - cart.subtotal : 0;
  // City not chosen yet: the cheapest delivery is the most the customer can count on.
  const minDelivery = missing <= 0 && free > 0 ? 0 : minFee;
  const minOrder = useMinOrder(cart.subtotal, minDelivery);

  if (!cart.ready) return <div className="container section" aria-busy="true" />;

  if (!cart.lines.length) {
    return (
      <div className="container section">
        <h1 className="page-title">{c.title}</h1>
        <div className="empty">
          <IconBag width={40} height={40} />
          <p>{c.empty}</p>
          <Link href={routes.shop} className="btn btn--primary">
            {c.discover}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">{c.title}</h1>
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
                      <span className="line__unit">{c.perUnit(t.dh(product.price))}</span>
                    ) : (
                      <span className="line__warn">{c.unavailable}</span>
                    )}
                  </div>
                  <div className="qty qty--sm" role="group" aria-label={c.qtyOf(product.name)}>
                    <button type="button" onClick={() => cart.setQty(product.slug, qty - 1)} aria-label={t.buy.minusOne}>
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(product.slug, qty + 1)}
                      aria-label={t.buy.plusOne}
                      disabled={!sellable}
                    >
                      +
                    </button>
                  </div>
                  <span className="line__total">{sellable ? t.dh(product.price * qty) : '—'}</span>
                  <button
                    type="button"
                    className="icon-btn line__remove"
                    onClick={() => cart.remove(product.slug)}
                    aria-label={c.remove(product.name)}
                  >
                    <IconTrash width={18} height={18} />
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href={routes.shop} className="link-back">
            {c.continue}
          </Link>
        </div>

        <aside className="summary">
          <h2>{c.summary}</h2>
          <dl>
            <div>
              <dt>{c.subtotal}</dt>
              <dd>{t.dh(cart.subtotal)}</dd>
            </div>
            <div>
              <dt>{c.delivery}</dt>
              <dd>{missing <= 0 && free > 0 ? c.free : c.from(t.dh(minFee))}</dd>
            </div>
          </dl>
          {missing > 0 && <p className="summary__hint">{c.freeHint(t.dh(missing))}</p>}
          <p className="summary__note">{c.feesNote}</p>
          <MinOrderNotice subtotal={cart.subtotal} delivery={minDelivery} />
          {cart.blocked ? (
            <p className="notice notice--warn">{c.removeBlocked}</p>
          ) : minOrder.blocked ? (
            <button type="button" className="btn btn--primary btn--block" disabled>
              {c.toDelivery} <IconArrow width={18} height={18} className="flip-rtl" />
            </button>
          ) : (
            <Link href={routes.checkout} className="btn btn--primary btn--block">
              {c.toDelivery} <IconArrow width={18} height={18} className="flip-rtl" />
            </Link>
          )}
          <p className="summary__cod">{c.cash}</p>
        </aside>
      </div>
    </div>
  );
}
