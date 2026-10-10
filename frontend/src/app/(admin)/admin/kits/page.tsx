'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import AdminShell from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import type { AdminProduct, Settings } from '@/admin/types';
import Translations, { fromTrDraft, toTrDraft, type TrField } from '@/admin/Translations';
import { BusyButton, Field, Flash, Loading, SlowHint, useFlash } from '@/admin/ui';
import { dh } from '@/lib/format';
import type { Kit } from '@/types';

const TR_FIELDS: TrField[] = [
  { key: 'title', label: 'Nom du kit', max: 80 },
  { key: 'pitch', label: 'Phrase d’accroche', max: 200 },
];

export default function KitsPage() {
  return (
    <AdminShell title="Kits">
      <KitsView />
    </AdminShell>
  );
}

/** Kits live in the settings: every change sends the whole list back. */
function KitsView() {
  const [kits, setKits] = useState<Kit[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [adding, setAdding] = useState(false);
  const flash = useFlash();

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([
        api<{ settings: Settings }>('/api/admin/settings'),
        api<{ products: AdminProduct[] }>('/api/admin/products'),
      ]);
      setKits(s.settings.kits ?? []);
      setProducts(p.products);
    } catch (e) {
      flash.err(errorText(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next: Kit[], message: string) {
    const { settings } = await api<{ settings: Settings }>('/api/admin/settings', { method: 'PUT', body: { kits: next } });
    setKits(settings.kits ?? []);
    flash.ok(message);
  }

  if (!kits) return flash.flash ? <Flash flash={flash.flash} /> : <Loading text="Chargement des kits…" />;

  const move = (i: number, d: -1 | 1) => {
    const next = [...kits];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    save(next, 'Ordre des kits enregistré.').catch((e) => flash.err(errorText(e)));
  };

  return (
    <>
      <Flash flash={flash.flash} />
      <p className="adm-muted adm-intro">
        Les kits apparaissent sur l’accueil, dans la section « Kits prêts à l’emploi ». Le prix affiché est la somme des
        prix des produits ; un produit sans prix, épuisé ou masqué n’est pas ajouté au panier. Sans aucun kit, la section
        disparaît.
      </p>

      <div className="adm-cats">
        {kits.map((k, i) => (
          <KitRow
            key={k.id}
            kit={k}
            products={products}
            first={i === 0}
            last={i === kits.length - 1}
            onMove={(d) => move(i, d)}
            onSave={(kit) => save(kits.map((x, j) => (j === i ? kit : x)), `Kit « ${kit.title} » enregistré.`)}
            onRemove={() => save(kits.filter((_, j) => j !== i), `Kit « ${k.title} » supprimé.`)}
            onError={(m) => flash.err(m)}
          />
        ))}
        {!kits.length && <p className="adm-muted">Aucun kit pour le moment.</p>}
      </div>

      {adding ? (
        <KitForm
          products={products}
          onCancel={() => setAdding(false)}
          onSave={async (kit) => {
            await save([...kits, kit], `Kit « ${kit.title} » créé.`);
            setAdding(false);
          }}
          onError={(m) => flash.err(m)}
        />
      ) : (
        kits.length < 12 && (
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => setAdding(true)}>
            + Nouveau kit
          </button>
        )
      )}
    </>
  );
}

function KitRow({
  kit,
  products,
  first,
  last,
  onMove,
  onSave,
  onRemove,
  onError,
}: {
  kit: Kit;
  products: AdminProduct[];
  first: boolean;
  last: boolean;
  onMove: (d: -1 | 1) => void;
  onSave: (kit: Kit) => Promise<void>;
  onRemove: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!window.confirm(`Supprimer le kit « ${kit.title} » ?`)) return;
    setRemoving(true);
    try {
      await onRemove();
    } catch (e) {
      onError(errorText(e));
      setRemoving(false);
    }
  }

  if (editing) {
    return (
      <KitForm
        kit={kit}
        products={products}
        onCancel={() => setEditing(false)}
        onSave={async (k) => {
          await onSave(k);
          setEditing(false);
        }}
        onError={onError}
      />
    );
  }

  const items = kit.slugs.map((s) => products.find((p) => p.slug === s));
  const total = items.reduce((n, p) => n + (p && p.active && p.price > 0 ? p.price : 0), 0);
  const thumb = items.find((p) => p?.images[0])?.images[0]?.thumb;
  const off = items.filter((p) => !p || !p.active || p.price <= 0 || p.stock === 0).length;

  return (
    <article className="adm-cat">
      <span className="adm-kit__move">
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onMove(-1)} disabled={first} aria-label="Monter">
          ↑
        </button>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onMove(1)} disabled={last} aria-label="Descendre">
          ↓
        </button>
      </span>
      {thumb ? <img src={thumb} alt="" width={56} height={56} /> : <span className="adm-cat__ph">Kit</span>}
      <div className="adm-cat__main">
        <strong>{kit.title}</strong>
        <small>
          {kit.slugs.length} produit{kit.slugs.length > 1 ? 's' : ''} · {dh(total)}
          {off > 0 && (
            <em className="adm-tag adm-tag--warn">
              {off} non disponible{off > 1 ? 's' : ''}
            </em>
          )}
        </small>
      </div>
      <div className="adm-row">
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditing(true)} disabled={removing}>
          Modifier
        </button>
        <BusyButton type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={remove} busy={removing} busyText="Suppression…">
          Supprimer
        </BusyButton>
      </div>
    </article>
  );
}

function KitForm({
  kit,
  products,
  onCancel,
  onSave,
  onError,
}: {
  kit?: Kit;
  products: AdminProduct[];
  onCancel: () => void;
  onSave: (kit: Kit) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(kit?.title || '');
  const [pitch, setPitch] = useState(kit?.pitch || '');
  const [i18n, setI18n] = useState(toTrDraft(kit?.i18n));
  const [slugs, setSlugs] = useState<string[]>(kit?.slugs || []);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (slug: string) =>
    setSlugs((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : list.length < 8 ? [...list, slug] : list));

  const q = query.trim().toLowerCase();
  const shown = products.filter((p) => !q || p.name.toLowerCase().includes(q));
  const total = slugs.reduce((n, s) => n + (products.find((p) => p.slug === s)?.price || 0), 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (slugs.length < 2) {
      onError('Choisissez au moins 2 produits pour un kit.');
      return;
    }
    setBusy(true);
    try {
      await onSave({ id: kit?.id || '', title, pitch, slugs, i18n: fromTrDraft(i18n, TR_FIELDS) as Kit['i18n'] });
    } catch (err) {
      onError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <form className="adm-card adm-cat-form" onSubmit={submit}>
      <fieldset className="adm-lock adm-fields" disabled={busy}>
        <Field label="Nom du kit">
          <input className="adm-input" required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Kit débutant cake design" />
        </Field>
        <Field label="Phrase d’accroche" wide hint="Une ligne sous le nom du kit.">
          <input className="adm-input" value={pitch} onChange={(e) => setPitch(e.target.value)} maxLength={200} />
        </Field>
        <Translations fields={TR_FIELDS} value={i18n} onChange={setI18n} />
        <Field
          label={`Produits (${slugs.length}/8)`}
          wide
          hint={`Total actuel : ${dh(total)}. Les produits apparaissent dans l’ordre où vous les cochez.`}
        >
          <input className="adm-input" type="search" placeholder="Rechercher un produit…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Field>
        <div className="adm-kit__pick adm-field--wide" role="group" aria-label="Produits du kit">
          {shown.map((p) => {
            const on = slugs.includes(p.slug);
            return (
              <label key={p.slug} className={`adm-kit__item${on ? ' is-on' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(p.slug)} disabled={!on && slugs.length >= 8} />
                {p.images[0] ? <img src={p.images[0].thumb} alt="" width={40} height={40} /> : <span className="adm-kit__ph" />}
                <span className="adm-kit__name">
                  {on && <b>{slugs.indexOf(p.slug) + 1}. </b>}
                  {p.name}
                  {!p.active && <em className="adm-tag">masqué</em>}
                </span>
                <span className="adm-kit__price">{p.price > 0 ? dh(p.price) : 'sans prix'}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="adm-row">
        <BusyButton type="submit" className="adm-btn adm-btn--primary" busy={busy} busyText="Enregistrement…">
          {kit ? 'Enregistrer' : 'Créer le kit'}
        </BusyButton>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel} disabled={busy}>
          Annuler
        </button>
      </div>
      <SlowHint active={busy} />
    </form>
  );
}
