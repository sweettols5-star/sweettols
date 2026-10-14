'use client';

import { useEffect, useState } from 'react';
import { colorName, hasOptions } from '@/i18n/content';
import { isSellable } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import type { Product } from '@/types';
import { useCart } from './CartProvider';
import { IconBag, IconCheck, IconWhatsapp } from './Icons';
import { useLang, useT } from './LangProvider';
import { useSettings } from './LiveCatalogue';
import Link from './Link';
import { productHref } from './ProductCard';

/**
 * The buy button, in two sizes: compact on cards, with a quantity stepper on
 * the product page. An unpriced or sold-out product never reaches the cart —
 * it offers to ask on WhatsApp instead, when a number is set.
 *
 * A product with colours or sizes is chosen on its page: the card button
 * leads there, and the page asks for one of each (preselected when there is
 * only one).
 */
export default function AddToCart({ product, withQty = false }: { product: Product; withQty?: boolean }) {
  const cart = useCart();
  const { whatsapp } = useSettings();
  const t = useT();
  const lang = useLang();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const [color, setColor] = useState(colors.length === 1 ? colors[0] : '');
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : '');
  const [missing, setMissing] = useState(false);

  // The live catalogue can drop the option that was picked.
  useEffect(() => {
    if (color && !colors.includes(color)) setColor(colors.length === 1 ? colors[0] : '');
    if (size && !sizes.includes(size)) setSize(sizes.length === 1 ? sizes[0] : '');
  }, [colors.join('|'), sizes.join('|')]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  if (!isSellable(product)) {
    const reason = product.price ? t.product.outOfStock : t.buy.soon;
    const short = product.price ? t.buy.shortSoldOut : t.buy.shortSoon;
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
            href={whatsappUrl(whatsapp, t.buy.askPriceMessage(product.name))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsapp width={18} height={18} /> {t.buy.askPrice}
          </a>
        )}
      </div>
    );
  }

  if (!withQty && hasOptions(product)) {
    return (
      <Link href={productHref(product.slug)} className="btn btn--primary btn--sm btn--block">
        <span className="lbl-long">{t.buy.choose}</span>
        <span className="lbl-short">{t.buy.chooseShort}</span>
      </Link>
    );
  }

  const add = () => {
    if ((colors.length && !color) || (sizes.length && !size)) {
      setMissing(true);
      return;
    }
    cart.add(product, withQty ? qty : 1, { color, size });
    setAdded(true);
  };

  if (!withQty) {
    return (
      <button type="button" className={`btn btn--primary btn--sm btn--block${added ? ' is-done' : ''}`} onClick={add}>
        {added ? (
          <>
            <IconCheck width={16} height={16} /> {t.buy.added}
          </>
        ) : (
          <>
            <IconBag width={16} height={16} className="lbl-icon" />
            <span className="lbl-long">{t.buy.add}</span>
            <span className="lbl-short">{t.buy.addShort}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="buy buy--lg">
      {colors.length > 0 && (
        <OptionPicker
          label={t.product.color}
          values={colors}
          value={color}
          show={(c) => colorName(product, c, lang)}
          onChange={(c) => {
            setColor(c);
            setAdded(false);
          }}
          error={missing && !color ? t.product.chooseColor : ''}
        />
      )}
      {sizes.length > 0 && (
        <OptionPicker
          label={t.product.size}
          values={sizes}
          value={size}
          show={t.product.cm}
          onChange={(s) => {
            setSize(s);
            setAdded(false);
          }}
          error={missing && !size ? t.product.chooseSize : ''}
        />
      )}
      <div className="buy__row">
        <div className="qty" role="group" aria-label={t.buy.quantity}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t.buy.minusOne}>
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            aria-label={t.buy.quantity}
          />
          <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label={t.buy.plusOne}>
            +
          </button>
        </div>
        <button type="button" className={`btn btn--primary btn--grow${added ? ' is-done' : ''}`} onClick={add}>
          {added ? <IconCheck width={18} height={18} /> : <IconBag width={18} height={18} />}
          {added ? t.buy.addedToCart : t.buy.add}
        </button>
      </div>
      {added && (
        <p className="buy__added" role="status">
          {t.buy.inCart} <Link href={routes.cart}>{t.buy.seeCart}</Link>
        </p>
      )}
    </div>
  );
}

/** One chip per value; a radio group underneath, so the keyboard and screen readers get it for free. */
function OptionPicker({
  label,
  values,
  value,
  show,
  onChange,
  error,
}: {
  label: string;
  values: string[];
  value: string;
  show: (v: string) => string;
  onChange: (v: string) => void;
  error: string;
}) {
  return (
    <fieldset className="opts" aria-invalid={!!error || undefined}>
      <legend>
        {label}
        {value && <span className="opts__value">{show(value)}</span>}
      </legend>
      <div className="opts__list">
        {values.map((v) => (
          <label key={v} className={`opt${v === value ? ' is-checked' : ''}`}>
            <input type="radio" name={label} value={v} checked={v === value} onChange={() => onChange(v)} />
            <span dir="auto">{show(v)}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
