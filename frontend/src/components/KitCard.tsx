'use client';

import { useEffect, useState } from 'react';
import type { Kit } from '@/types';
import { isSellable } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { useCart } from './CartProvider';
import { IconBag, IconCheck } from './Icons';
import { useT } from './LangProvider';
import { useProducts } from './LiveCatalogue';
import Link from './Link';
import { productHref } from './ProductCard';

/** A bundle of real products, priced at their live sum, added to the cart in one click. */
export default function KitCard({ kit }: { kit: Kit }) {
  const all = useProducts();
  const cart = useCart();
  const t = useT();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(t);
  }, [added]);

  const items = kit.slugs.map((s) => all.find((p) => p.slug === s)).filter((p) => !!p);
  const sellable = items.filter(isSellable);
  const total = sellable.reduce((n, p) => n + p.price, 0);
  const missing = items.length - sellable.length;

  if (!sellable.length) return null;

  return (
    <article className="kit">
      <div className="kit__imgs" aria-hidden>
        {items.slice(0, 4).map((p) => (
          <img key={p.slug} src={p.images[0]?.thumb || '/brand/emblem.png'} alt="" width={160} height={160} loading="lazy" />
        ))}
      </div>
      <div className="kit__body">
        <h3 className="kit__title">{kit.title}</h3>
        <p className="kit__pitch">{kit.pitch}</p>
        <ul className="kit__list">
          {items.map((p) => (
            <li key={p.slug} className={isSellable(p) ? '' : 'is-off'}>
              <Link href={productHref(p.slug)}>{p.name}</Link>
              <span>{isSellable(p) ? t.dh(p.price) : t.kits.soon}</span>
            </li>
          ))}
        </ul>
        <div className="kit__foot">
          <p className="kit__total">
            <span>{t.kits.items(sellable.length, missing > 0)}</span>
            <strong>{t.dh(total)}</strong>
          </p>
          <button
            type="button"
            className={`btn btn--primary${added ? ' is-done' : ''}`}
            onClick={() => {
              sellable.forEach((p) => cart.add(p, 1));
              setAdded(true);
            }}
          >
            {added ? <IconCheck width={18} height={18} /> : <IconBag width={18} height={18} />}
            {added ? t.kits.added : t.kits.add}
          </button>
        </div>
        {added && (
          <p className="buy__added" role="status">
            <Link href={routes.cart}>{t.buy.seeCart}</Link>
          </p>
        )}
      </div>
    </article>
  );
}
