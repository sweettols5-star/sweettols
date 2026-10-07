'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { apiUrl } from '@/config/api';
import { dh } from '@/lib/format';
import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import { useCart } from './CartProvider';
import { IconCheck, IconWhatsapp } from './Icons';
import { useSettings } from './LiveCatalogue';
import MinOrderNotice, { useMinOrder } from './MinOrderNotice';
import Link from './Link';
import OrderSteps from './OrderSteps';

type Confirmed = {
  reference: string;
  items: Array<{ slug: string; name: string; qty: number; price: number; lineTotal: number }>;
  subtotal: number;
  shipping: number;
  total: number;
  zone: { label: string };
  name: string;
  phone: string;
};

const PHONE = /^(0[5-7]\d{8}|212[5-7]\d{8})$/;
const STORAGE_KEY = 'sweettools.checkout.v1';

export default function CheckoutForm() {
  const cart = useCart();
  const settings = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [zoneId, setZoneId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Confirmed | null>(null);
  const minOrder = useMinOrder(cart.subtotal);

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

  if (done) return <Confirmation order={done} whatsapp={settings.whatsapp} />;

  if (!cart.ready) return <div className="container section" aria-busy="true" />;

  if (!cart.lines.length) {
    return (
      <div className="container section">
        <h1 className="page-title">Commande</h1>
        <div className="empty">
          <p>Votre panier est vide.</p>
          <Link href={routes.shop} className="btn btn--primary">
            Découvrir la boutique
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
    // Casablanca chosen and no city typed yet: fill it in.
    const z = settings.zones.find((x) => x.id === id);
    if (z && !/autre/i.test(z.label) && !form.city.trim()) setForm((f) => ({ ...f, city: z.label }));
  };

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Indiquez votre nom complet.';
    if (!PHONE.test(form.phone.replace(/\D/g, ''))) e.phone = 'Numéro invalide (ex. 06 12 34 56 78).';
    if (!form.city.trim()) e.city = 'Indiquez votre ville.';
    if (form.address.trim().length < 5) e.address = 'Indiquez votre adresse complète.';
    if (!zoneId) e.zone = 'Choisissez une zone de livraison.';
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
      setServerError(`Le montant minimum de commande est de ${minOrder.min} DH (hors livraison).`);
      return;
    }
    if (cart.blocked) {
      setServerError('Retirez les articles indisponibles de votre panier.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          zoneId,
          items: cart.lines.map((l) => ({ slug: l.product.slug, qty: l.qty, price: l.product.price })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error || 'La commande n’a pas pu être enregistrée. Réessayez.');
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
      setServerError('Connexion impossible. Vérifiez votre réseau puis réessayez.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container section">
      <h1 className="page-title">Livraison</h1>
      <OrderSteps current={2} />

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout__main">
          <fieldset className="panel">
            <legend>Adresse de livraison</legend>
            <div className="fields">
              <Field label="Nom complet" error={errors.name}>
                <input name="name" autoComplete="name" value={form.name} onChange={set('name')} required />
              </Field>
              <Field label="Téléphone" error={errors.phone} hint="Nous vous appelons pour confirmer.">
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
              <Field label="Ville" error={errors.city}>
                <input name="city" autoComplete="address-level2" value={form.city} onChange={set('city')} required />
              </Field>
              <Field label="Adresse complète" error={errors.address} wide>
                <textarea
                  name="address"
                  autoComplete="street-address"
                  rows={2}
                  placeholder="Quartier, rue, numéro, immeuble…"
                  value={form.address}
                  onChange={set('address')}
                  required
                />
              </Field>
              <Field label="Note (facultatif)" wide>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Créneau préféré, repère pour le livreur…"
                  value={form.notes}
                  onChange={set('notes')}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>Zone de livraison</legend>
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
                    <span className="zone__fee">{fee ? dh(fee) : 'Offerte'}</span>
                  </label>
                );
              })}
            </div>
            {errors.zone && <p className="field__error">{errors.zone}</p>}
          </fieldset>

          <Link href={routes.cart} className="link-back">
            ← Retour au panier
          </Link>
        </div>

        <aside className="summary">
          <h2>Récapitulatif</h2>
          <ul className="summary__items">
            {cart.lines.map((l) => (
              <li key={l.product.slug}>
                <span>
                  {l.qty} × {l.product.name}
                </span>
                <span>{l.sellable ? dh(l.product.price * l.qty) : '—'}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Sous-total</dt>
              <dd>{dh(cart.subtotal)}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{zone ? (shipping ? dh(shipping) : 'Offerte') : '—'}</dd>
            </div>
            <div className="summary__total">
              <dt>Total à payer</dt>
              <dd>{dh(cart.subtotal + shipping)}</dd>
            </div>
          </dl>
          <div className="cod">
            <strong>Paiement à la livraison</strong>
            <span>Vous payez en espèces au livreur. Aucune carte bancaire demandée.</span>
          </div>
          <MinOrderNotice subtotal={cart.subtotal} />
          {serverError && (
            <p className="notice notice--error" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={sending || cart.blocked || minOrder.blocked}>
            {sending ? 'Envoi…' : 'Confirmer la commande'}
          </button>
          {serverError && settings.whatsapp && (
            <a
              className="btn btn--ghost btn--block"
              href={whatsappUrl(
                settings.whatsapp,
                `Bonjour, je voudrais commander :\n${cart.lines.map((l) => `- ${l.qty} × ${l.product.name}`).join('\n')}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp width={18} height={18} /> Commander sur WhatsApp
            </a>
          )}
        </aside>
      </form>
    </div>
  );
}

function pick(o: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const k of ['name', 'phone', 'city', 'address']) if (typeof o[k] === 'string') out[k] = o[k] as string;
  return out;
}

function Field({
  label,
  error,
  hint,
  wide,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`field${wide ? ' field--wide' : ''}${error ? ' has-error' : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

function Confirmation({ order, whatsapp }: { order: Confirmed; whatsapp: string }) {
  return (
    <div className="container section">
      <OrderSteps current={3} />
      <div className="confirm">
        <span className="confirm__icon">
          <IconCheck width={34} height={34} />
        </span>
        <h1 className="page-title">Merci {order.name.split(' ')[0]} !</h1>
        <p>
          Votre commande <strong>{order.reference}</strong> est enregistrée. Nous vous appelons au{' '}
          <strong>{order.phone}</strong> pour la confirmer avant l’envoi.
        </p>

        <div className="summary confirm__summary">
          <ul className="summary__items">
            {order.items.map((l) => (
              <li key={l.slug}>
                <span>
                  {l.qty} × {l.name}
                </span>
                <span>{dh(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Sous-total</dt>
              <dd>{dh(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Livraison ({order.zone.label})</dt>
              <dd>{order.shipping ? dh(order.shipping) : 'Offerte'}</dd>
            </div>
            <div className="summary__total">
              <dt>À payer à la livraison</dt>
              <dd>{dh(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="confirm__actions">
          <Link href={routes.shop} className="btn btn--primary">
            Continuer mes achats
          </Link>
          {whatsapp && (
            <a
              className="btn btn--ghost"
              href={whatsappUrl(whatsapp, `Bonjour, j’ai passé la commande ${order.reference}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsapp width={18} height={18} /> Nous écrire
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
