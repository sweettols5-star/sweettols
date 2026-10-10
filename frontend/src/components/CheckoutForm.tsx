'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiUrl } from '@/config/api';
import type { Dict } from '@/i18n';
import { rich } from '@/i18n/rich';
import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import { useCart } from './CartProvider';
import { IconCheck, IconWhatsapp } from './Icons';
import { useLang, useT } from './LangProvider';
import { useProducts, useSettings } from './LiveCatalogue';
import MinOrderNotice, { useMinOrder } from './MinOrderNotice';
import Field from './FormField';
import Link from './Link';
import OrderSteps from './OrderSteps';

type Confirmed = {
  reference: string;
  items: Array<{ slug: string; name: string; qty: number; price: number; lineTotal: number }>;
  subtotal: number;
  shipping: number;
  invoiceFee: number;
  total: number;
  zone: { label: string };
  name: string;
  phone: string;
};

const PHONE = /^(0[5-7]\d{8}|212[5-7]\d{8})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = 'sweettools.checkout.v1';
/** Same rule as the API (backend/src/lib/order.js): +20 % VAT on the products, delivery excluded. */
const INVOICE_RATE = 0.2;

export default function CheckoutForm() {
  const cart = useCart();
  const settings = useSettings();
  const lang = useLang();
  const t = useT();
  const k = t.checkout;
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', address: '', notes: '' });
  const [zoneId, setZoneId] = useState('');
  const [invoice, setInvoice] = useState({ wanted: false, company: '', ice: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Confirmed | null>(null);

  // Remember the contact details for the next order (never the cart).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        setForm((f) => ({ ...f, ...pick(saved) }));
        if (typeof saved.zoneId === 'string') setZoneId(saved.zoneId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const zone = settings.zones.find((z) => z.id === zoneId);
  const freeFrom = settings.freeShippingThreshold;
  const shipping = zone ? (freeFrom > 0 && cart.subtotal >= freeFrom ? 0 : zone.fee) : 0;
  const invoiceFee = invoice.wanted ? Math.round(cart.subtotal * INVOICE_RATE) : 0;
  // Before a city is picked, count the cheapest delivery.
  const fees = settings.zones.map((z) => z.fee);
  const cheapest = freeFrom > 0 && cart.subtotal >= freeFrom ? 0 : fees.length ? Math.min(...fees) : 0;
  const minOrder = useMinOrder(cart.subtotal, zone ? shipping : cheapest);

  if (done) return <Confirmation order={done} whatsapp={settings.whatsapp} t={t} />;

  if (!cart.ready) return <div className="container section" aria-busy="true" />;

  if (!cart.lines.length) {
    return (
      <div className="container section">
        <h1 className="page-title">{k.emptyTitle}</h1>
        <div className="empty">
          <p>{t.cart.empty}</p>
          <Link href={routes.shop} className="btn btn--primary">
            {t.cart.discover}
          </Link>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };

  const chooseZone = (id: string) => {
    setZoneId(id);
    setErrors(({ zone: _drop, ...rest }) => rest);
    // Casablanca chosen and no city typed yet: fill it in (not for « other cities »).
    const z = settings.zones.find((x) => x.id === id);
    if (z && !/autre|other|أخرى|باقي/i.test(z.label) && !form.city.trim()) setForm((f) => ({ ...f, city: z.label }));
  };

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = k.errName;
    if (!PHONE.test(form.phone.replace(/\D/g, ''))) e.phone = k.errPhone;
    if (form.email.trim() && !EMAIL.test(form.email.trim())) e.email = k.errEmail;
    if (!form.city.trim()) e.city = k.errCity;
    if (form.address.trim().length < 5) e.address = k.errAddress;
    if (!zoneId) e.zone = k.errZone;
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    if (minOrder.blocked) {
      setServerError(k.errMinOrder(minOrder.min));
      return;
    }
    if (cart.blocked) {
      setServerError(k.errBlocked);
      return;
    }

    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          customer: form,
          zoneId,
          invoice: invoice.wanted ? { company: invoice.company, ice: invoice.ice } : null,
          items: cart.lines.map((l) => ({ slug: l.product.slug, qty: l.qty, price: l.product.price })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error || k.errFailed);
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pick(form), notes: '', zoneId }));
      } catch {
        /* ignore */
      }
      setDone({ ...data, name: form.name.trim(), phone: form.phone.trim() });
      cart.clear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setServerError(k.errNetwork);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container section">
      <h1 className="page-title">{k.title}</h1>
      <OrderSteps current={2} />

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout__main">
          <fieldset className="panel">
            <legend>{k.addressLegend}</legend>
            <div className="fields">
              <Field label={k.name} error={errors.name}>
                <input name="name" autoComplete="name" value={form.name} onChange={set('name')} required />
              </Field>
              <Field label={k.phone} error={errors.phone} hint={k.phoneHint}>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                />
              </Field>
              <Field label={k.email} error={errors.email}>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nom@gmail.com"
                  value={form.email}
                  onChange={set('email')}
                />
              </Field>
              <Field label={k.city} error={errors.city}>
                <input name="city" autoComplete="address-level2" value={form.city} onChange={set('city')} required />
              </Field>
              <Field label={k.address} error={errors.address} wide>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  rows={2}
                  placeholder={k.addressPlaceholder}
                  value={form.address}
                  onChange={set('address')}
                  required
                />
              </Field>
              <Field label={k.note} wide>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder={k.notePlaceholder}
                  value={form.notes}
                  onChange={set('notes')}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>{k.zoneLegend}</legend>
            <div className="zones" role="radiogroup" aria-invalid={!!errors.zone}>
              {settings.zones.map((z) => {
                const fee = freeFrom > 0 && cart.subtotal >= freeFrom ? 0 : z.fee;
                return (
                  <label key={z.id} className={`zone${zoneId === z.id ? ' is-checked' : ''}`}>
                    <input
                      type="radio"
                      name="zone"
                      value={z.id}
                      checked={zoneId === z.id}
                      onChange={() => chooseZone(z.id)}
                    />
                    <span className="zone__text">
                      <strong>{z.label}</strong>
                      {z.delay && <small>{z.delay}</small>}
                    </span>
                    <span className="zone__fee">{fee ? t.dh(fee) : t.cart.free}</span>
                  </label>
                );
              })}
            </div>
            {errors.zone && <p className="field__error">{errors.zone}</p>}
          </fieldset>

          <fieldset className="panel">
            <legend>{k.invoiceLegend}</legend>
            <label className={`zone${invoice.wanted ? ' is-checked' : ''}`}>
              <input
                type="checkbox"
                name="invoice"
                checked={invoice.wanted}
                onChange={(e) => setInvoice((i) => ({ ...i, wanted: e.target.checked }))}
              />
              <span className="zone__text">
                <strong>{k.invoiceWanted}</strong>
                <small>{k.invoiceVat}</small>
              </span>
              <span className="zone__fee">+{t.dh(Math.round(cart.subtotal * INVOICE_RATE))}</span>
            </label>
            {invoice.wanted && (
              <div className="fields invoice-fields">
                <Field label={k.company}>
                  <input
                    name="company"
                    autoComplete="organization"
                    value={invoice.company}
                    onChange={(e) => setInvoice((i) => ({ ...i, company: e.target.value }))}
                  />
                </Field>
                <Field label={k.ice}>
                  <input
                    name="ice"
                    inputMode="numeric"
                    value={invoice.ice}
                    onChange={(e) => setInvoice((i) => ({ ...i, ice: e.target.value }))}
                  />
                </Field>
              </div>
            )}
          </fieldset>

          <Link href={routes.cart} className="link-back">
            {k.back}
          </Link>
        </div>

        <aside className="summary">
          <h2>{t.cart.summary}</h2>
          <ul className="summary__items">
            {cart.lines.map((l) => (
              <li key={l.product.slug}>
                <span>
                  {l.qty} × {l.product.name}
                </span>
                <span>{l.sellable ? t.dh(l.product.price * l.qty) : '—'}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>{t.cart.subtotal}</dt>
              <dd>{t.dh(cart.subtotal)}</dd>
            </div>
            <div>
              <dt>{t.cart.delivery}</dt>
              <dd>{zone ? (shipping ? t.dh(shipping) : t.cart.free) : '—'}</dd>
            </div>
            {invoiceFee > 0 && (
              <div>
                <dt>{k.vat}</dt>
                <dd>{t.dh(invoiceFee)}</dd>
              </div>
            )}
            <div className="summary__total">
              <dt>{k.total}</dt>
              <dd>{t.dh(cart.subtotal + shipping + invoiceFee)}</dd>
            </div>
          </dl>
          <div className="cod">
            <strong>{k.codTitle}</strong>
            <span>{k.codText}</span>
          </div>
          <MinOrderNotice subtotal={cart.subtotal} delivery={zone ? shipping : cheapest} />
          {serverError && (
            <p className="notice notice--error" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={sending || cart.blocked || minOrder.blocked}>
            {sending ? k.sending : k.confirm}
          </button>
          {serverError && settings.whatsapp && (
            <a
              className="btn btn--ghost btn--block"
              href={whatsappUrl(
                settings.whatsapp,
                k.whatsappOrderMessage(cart.lines.map((l) => `- ${l.qty} × ${l.product.name}`).join('\n')),
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp width={18} height={18} /> {k.whatsappOrder}
            </a>
          )}
        </aside>
      </form>
    </div>
  );
}

function pick(o: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const k of ['name', 'phone', 'email', 'city', 'address']) if (typeof o[k] === 'string') out[k] = o[k] as string;
  return out;
}

function Confirmation({ order, whatsapp, t }: { order: Confirmed; whatsapp: string; t: Dict }) {
  const k = t.checkout;
  // The API stores French names (the admin reads them); show the shopper's language.
  const products = useProducts();
  const nameOf = (slug: string, fallback: string) => products.find((p) => p.slug === slug)?.name || fallback;
  return (
    <div className="container section">
      <OrderSteps current={3} />
      <div className="confirm">
        <span className="confirm__icon">
          <IconCheck width={34} height={34} />
        </span>
        <h1 className="page-title">{k.thanks(order.name.split(' ')[0])}</h1>
        <p>{rich(k.saved, { ref: <strong>{order.reference}</strong>, phone: <strong dir="ltr">{order.phone}</strong> })}</p>

        <div className="summary confirm__summary">
          <ul className="summary__items">
            {order.items.map((l) => (
              <li key={l.slug}>
                <span>
                  {l.qty} × {nameOf(l.slug, l.name)}
                </span>
                <span>{t.dh(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>{t.cart.subtotal}</dt>
              <dd>{t.dh(order.subtotal)}</dd>
            </div>
            <div>
              <dt>{k.deliveryTo(order.zone.label)}</dt>
              <dd>{order.shipping ? t.dh(order.shipping) : t.cart.free}</dd>
            </div>
            {order.invoiceFee > 0 && (
              <div>
                <dt>{k.vat}</dt>
                <dd>{t.dh(order.invoiceFee)}</dd>
              </div>
            )}
            <div className="summary__total">
              <dt>{k.toPay}</dt>
              <dd>{t.dh(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="confirm__actions">
          <Link href={routes.shop} className="btn btn--primary">
            {k.continueShopping}
          </Link>
          {whatsapp && (
            <a
              className="btn btn--ghost"
              href={whatsappUrl(whatsapp, k.placedMessage(order.reference))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp width={18} height={18} /> {k.writeUs}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
