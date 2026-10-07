'use client';

import { useEffect, useState } from 'react';
import { isSellable } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import type { Product } from '@/types';
import { useCart } from './CartProvider';
import { IconBag, IconCheck, IconWhatsapp } from './Icons';
import { useSettings } from './LiveCatalogue';
import Link from './Link';

/**
 * The buy button, in two sizes: compact on cards, with a quantity stepper on
 * the product page. An unpriced or sold-out product never reaches the cart —
 * it offers to ask on WhatsApp instead, when a number is set.
 */
export default function AddToCart({ product, withQty = false }: { product: Product; withQty?: boolean }) {
  const cart = useCart();
  const { whatsapp } = useSettings();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  if (!isSellable(product)) {
    const reason = product.price ? 'Rupture de stock' : 'Bientôt disponible';
    const short = product.price ? 'Épuisé' : 'Bientôt';
    return (
      <div className={`buy${withQty ? ' buy--lg' : ''}`}>
        <button type="button" className={`btn btn--muted${withQty ? '' : ' btn--sm'} btn--block`} disabled>
          {withQty ? (
            reason
          ) : (
            <>
              <span className="lbl-long">{reason}</span>
              <span className="lbl-short">{short}</span>
            </>
          )}
        </button>
        {withQty && whatsapp && (
          <a
            className="btn btn--ghost btn--block"
            href={whatsappUrl(whatsapp, `Bonjour, je suis intéressé(e) par « ${product.name} ». Quel est son prix ?`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsapp width={18} height={18} /> Demander le prix
          </a>
        )}
      </div>
    );
  }

  const add = () => {
    cart.add(product, withQty ? qty : 1);
    setAdded(true);
  };

  if (!withQty) {
    return (
      <button type="button" className={`btn btn--primary btn--sm btn--block${added ? ' is-done' : ''}`} onClick={add}>
        {added ? (
          <>
            <IconCheck width={16} height={16} /> Ajouté
          </>
        ) : (
          <>
            <IconBag width={16} height={16} className="lbl-icon" />
            <span className="lbl-long">Ajouter au panier</span>
            <span className="lbl-short">Ajouter</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="buy buy--lg">
      <div className="buy__row">
        <div className="qty" role="group" aria-label="Quantité">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Retirer un">
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            aria-label="Quantité"
          />
          <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Ajouter un">
            +
          </button>
        </div>
        <button type="button" className={`btn btn--primary btn--grow${added ? ' is-done' : ''}`} onClick={add}>
          {added ? <IconCheck width={18} height={18} /> : <IconBag width={18} height={18} />}
          {added ? 'Ajouté au panier' : 'Ajouter au panier'}
        </button>
      </div>
      {added && (
        <p className="buy__added" role="status">
          C’est dans votre panier. <Link href={routes.cart}>Voir le panier →</Link>
        </p>
      )}
    </div>
  );
}
