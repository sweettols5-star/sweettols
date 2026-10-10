'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell, { useRefreshBadge } from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import type { Order, OrderStatus } from '@/admin/types';
import { BusyButton, Flash, Loading, SlowHint, Spinner, STATUS, STATUS_ORDER, StatusBadge, useFlash, when } from '@/admin/ui';
import { IconPhone, IconWhatsapp } from '@/components/Icons';
import { dh } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';

export default function OrdersPage() {
  return (
    <AdminShell title="Commandes">
      <Suspense fallback={<Loading text="Chargement des commandes…" />}>
        <OrdersView />
      </Suspense>
    </AdminShell>
  );
}

/** What comes next for an order, as one obvious button. */
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  nouvelle: { to: 'confirmee', label: 'Confirmer (client appelé)' },
  confirmee: { to: 'expediee', label: 'Marquer expédiée' },
  expediee: { to: 'livree', label: 'Marquer livrée et payée' },
};

function OrdersView() {
  const params = useSearchParams();
  const refreshBadge = useRefreshBadge();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState<OrderStatus | ''>((params.get('statut') as OrderStatus) || '');
  const [query, setQuery] = useState(params.get('ref') || '');
  const [open, setOpen] = useState<string>(params.get('ref') || '');
  const [refreshing, setRefreshing] = useState(false);
  const flash = useFlash();

  const load = useCallback(async () => {
    try {
      const { orders: list } = await api<{ orders: Order[] }>('/api/admin/orders');
      setOrders(list);
      return true;
    } catch (e) {
      flash.err(errorText(e));
      return false;
    }
  }, []);

  async function refresh() {
    setRefreshing(true);
    if (await load()) flash.ok('Liste des commandes à jour.');
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Partial<Record<OrderStatus, number>> = {};
    for (const o of orders || []) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders || []).filter(
      (o) =>
        (!status || o.status === status) &&
        (!q ||
          [o.reference, o.customer.name, o.customer.phone, o.customer.email || '', o.customer.city].some((v) => v.toLowerCase().includes(q))),
    );
  }, [orders, status, query]);

  function replace(updated: Order) {
    setOrders((list) => (list || []).map((o) => (o.reference === updated.reference ? updated : o)));
  }

  if (!orders) return flash.flash ? <Flash flash={flash.flash} /> : <Loading text="Chargement des commandes…" />;

  return (
    <>
      <Flash flash={flash.flash} />
      <div className="adm-tabs" role="tablist">
        <button type="button" className={!status ? 'is-active' : ''} onClick={() => setStatus('')}>
          Toutes <span>{orders.length}</span>
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} type="button" className={status === s ? 'is-active' : ''} onClick={() => setStatus(s)}>
            {STATUS[s].label} <span>{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      <div className="adm-toolbar">
        <input
          type="search"
          className="adm-input"
          placeholder="Référence, nom, téléphone, ville…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une commande"
        />
        <BusyButton type="button" className="adm-btn adm-btn--ghost" onClick={refresh} busy={refreshing} busyText="Actualisation…">
          Actualiser
        </BusyButton>
      </div>

      {shown.length ? (
        <div className="adm-orders">
          {shown.map((o) => (
            <OrderCard
              key={o.reference}
              order={o}
              open={open === o.reference}
              onToggle={() => setOpen((cur) => (cur === o.reference ? '' : o.reference))}
              onSaved={(u, msg) => {
                replace(u);
                flash.ok(msg);
                refreshBadge();
              }}
              onError={(m) => flash.err(m)}
              onDeleted={(msg) => {
                setOrders((list) => (list || []).filter((x) => x.reference !== o.reference));
                setOpen('');
                flash.ok(msg);
                refreshBadge();
              }}
            />
          ))}
        </div>
      ) : (
        <p className="adm-empty">
          {orders.length ? 'Aucune commande ne correspond.' : 'Aucune commande pour le moment. Elles arriveront ici dès le premier achat.'}
        </p>
      )}
    </>
  );
}

function OrderCard({
  order: o,
  open,
  onToggle,
  onSaved,
  onError,
  onDeleted,
}: {
  order: Order;
  open: boolean;
  onToggle: () => void;
  onSaved: (o: Order, msg: string) => void;
  onError: (msg: string) => void;
  onDeleted: (msg: string) => void;
}) {
  const [note, setNote] = useState(o.adminNote || '');
  /** Which change is on its way: a status, the note, or the deletion. */
  const [busy, setBusy] = useState<'' | 'note' | 'delete' | OrderStatus>('');
  const next = NEXT[o.status];
  const count = o.items.reduce((n, l) => n + l.qty, 0);

  async function patch(body: { status?: OrderStatus; adminNote?: string }, msg: string) {
    setBusy(body.status || 'note');
    try {
      const { order } = await api<{ order: Order }>(`/api/admin/orders/${o.reference}`, { method: 'PATCH', body });
      onSaved(order, msg);
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy('');
    }
  }

  async function remove() {
    const restock = o.status !== 'annulee' && o.status !== 'livree';
    if (
      !window.confirm(
        `Supprimer définitivement la commande ${o.reference} (${o.customer.name}, ${dh(o.total)}) ?` +
          (restock ? '\n\nLes articles seront remis en stock.' : '') +
          '\n\nPour la garder dans l’historique, utilisez plutôt le statut « Annulée ».',
      )
    ) return;
    setBusy('delete');
    try {
      const r = await api<{ restocked: boolean }>(`/api/admin/orders/${o.reference}`, { method: 'DELETE' });
      onDeleted(`Commande ${o.reference} supprimée${r.restocked ? ' — articles remis en stock' : ''}.`);
    } catch (e) {
      onError(errorText(e));
      setBusy('');
    }
  }

  function changeStatus(to: OrderStatus) {
    if (to === o.status) return;
    if (to === 'annulee' && !window.confirm(`Annuler la commande ${o.reference} ? Le stock des articles sera remis.`)) return;
    patch({ status: to }, `${o.reference} : ${STATUS[to].label.toLowerCase()}.`);
  }

  const phone = o.customer.phone.replace(/\s/g, '');

  return (
    <article className={`adm-order${open ? ' is-open' : ''} adm-order--${o.status}`}>
      <button type="button" className="adm-order__head" onClick={onToggle} aria-expanded={open}>
        <span className="adm-mono">{o.reference}</span>
        <span className="adm-order__who">
          <strong>
            {o.customer.name}
            {o.invoice && <em className="adm-tag adm-tag--invoice">Facture</em>}
            {o.lang && o.lang !== 'fr' && (
              <em className="adm-tag" title="Langue du client sur le site">
                {o.lang === 'ar' ? 'Arabe' : 'Anglais'}
              </em>
            )}
          </strong>
          <small>
            {o.customer.city} · {count} article{count > 1 ? 's' : ''}
          </small>
        </span>
        <span className="adm-num">{dh(o.total)}</span>
        <StatusBadge status={o.status} />
        <span className="adm-muted adm-order__date">{when(o.createdAt)}</span>
      </button>

      {open && (
        <div className="adm-order__body">
          <div className="adm-order__cols">
            <section>
              <h3 className="adm-h3">Client</h3>
              <p className="adm-order__customer">
                <strong>{o.customer.name}</strong>
                <br />
                {o.customer.phone}
                <br />
                {o.customer.email && (
                  <>
                    <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a>
                    <br />
                  </>
                )}
                {o.customer.address}
                <br />
                {o.customer.city} — zone « {o.zone.label} »
              </p>
              {o.invoice && (
                <p className="adm-note">
                  Facture demandée
                  {o.invoice.company && ` — ${o.invoice.company}`}
                  {o.invoice.ice && ` — ICE ${o.invoice.ice}`}
                </p>
              )}
              {o.customer.notes && <p className="adm-note">Note du client : {o.customer.notes}</p>}
              <div className="adm-row">
                <a className="adm-btn adm-btn--ghost adm-btn--sm" href={`tel:${phone}`}>
                  <IconPhone width={16} height={16} /> Appeler
                </a>
                <a
                  className="adm-btn adm-btn--ghost adm-btn--sm"
                  href={whatsappUrl(phone, `Bonjour ${o.customer.name.split(' ')[0]}, SWEETTOOLS au sujet de votre commande ${o.reference} (${dh(o.total)}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWhatsapp width={16} height={16} /> WhatsApp
                </a>
              </div>
            </section>

            <section>
              <h3 className="adm-h3">Articles</h3>
              <ul className="adm-lines">
                {o.items.map((l) => (
                  <li key={l.slug}>
                    {l.image ? <img src={l.image} alt="" width={44} height={44} /> : <span className="adm-lines__ph" />}
                    <span>
                      {l.qty} × {l.name}
                      <small>
                        {dh(l.price)} / pièce
                        {l.cartPrice !== undefined && ` (le panier affichait ${dh(l.cartPrice)})`}
                      </small>
                    </span>
                    <strong>{dh(l.lineTotal)}</strong>
                  </li>
                ))}
              </ul>
              <dl className="adm-totals">
                <div>
                  <dt>Sous-total</dt>
                  <dd>{dh(o.subtotal)}</dd>
                </div>
                <div>
                  <dt>Livraison</dt>
                  <dd>{o.shipping ? dh(o.shipping) : 'Offerte'}</dd>
                </div>
                {!!o.invoiceFee && (
                  <div>
                    <dt>TVA (facture)</dt>
                    <dd>{dh(o.invoiceFee)}</dd>
                  </div>
                )}
                <div className="adm-totals__total">
                  <dt>À encaisser</dt>
                  <dd>{dh(o.total)}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="adm-order__actions">
            {next && (
              <BusyButton
                type="button"
                className="adm-btn adm-btn--primary"
                busy={busy === next.to}
                busyText="Mise à jour…"
                disabled={!!busy}
                onClick={() => changeStatus(next.to)}
              >
                {next.label}
              </BusyButton>
            )}
            <label className="adm-inline">
              <span>Statut</span>
              <select value={o.status} disabled={!!busy} onChange={(e) => changeStatus(e.target.value as OrderStatus)}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS[s].label}
                  </option>
                ))}
              </select>
            </label>
            {busy && busy !== 'note' && busy !== 'delete' && busy !== next?.to && (
              <span className="adm-muted adm-row" role="status">
                <Spinner /> Passage à « {STATUS[busy].label} »…
              </span>
            )}
          </div>
          <SlowHint active={!!busy} />

          <div className="adm-order__note">
            <label className="adm-field">
              <span>Note interne (invisible pour le client)</span>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. livrer après 18 h, client rappelé…" />
            </label>
            <BusyButton
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--sm"
              busy={busy === 'note'}
              busyText="Enregistrement…"
              disabled={!!busy || note === (o.adminNote || '')}
              onClick={() => patch({ adminNote: note }, 'Note enregistrée.')}
            >
              Enregistrer la note
            </BusyButton>
          </div>

          <div className="adm-order__foot">
            {o.history?.length > 0 && (
              <ol className="adm-history">
                {o.history.map((h, i) => (
                  <li key={i}>
                    <StatusBadge status={h.status} /> <span className="adm-muted">{when(h.at)}</span>
                  </li>
                ))}
              </ol>
            )}
            <BusyButton
              type="button"
              className="adm-btn adm-btn--danger adm-btn--sm adm-order__delete"
              busy={busy === 'delete'}
              busyText="Suppression…"
              disabled={!!busy}
              onClick={remove}
            >
              Supprimer la commande
            </BusyButton>
          </div>
        </div>
      )}
    </article>
  );
}
