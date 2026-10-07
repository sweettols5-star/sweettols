'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import ProductEditor from '@/admin/ProductEditor';
import type { AdminCategory, AdminProduct } from '@/admin/types';
import { Flash, Loading, useFlash } from '@/admin/ui';
import Link from '@/components/Link';
import { dh } from '@/lib/format';

export default function ProductsPage() {
  return (
    <Suspense fallback={<AdminShell title="Produits"><Loading /></AdminShell>}>
      <ProductsRouter />
    </Suspense>
  );
}

/**
 * List and editor on one static page: ?modifier=<slug> or ?nouveau=1 opens the
 * editor. A static export cannot build a page per product created later.
 */
function ProductsRouter() {
  const params = useSearchParams();
  const edit = params.get('modifier');
  const creating = params.get('nouveau') === '1';

  if (edit || creating) {
    return (
      <AdminShell title={creating ? 'Nouveau produit' : 'Modifier le produit'}>
        <ProductEditor key={edit || 'new'} slug={edit || ''} />
      </AdminShell>
    );
  }
  return (
    <AdminShell
      title="Produits"
      actions={
        <Link href="/admin/produits/?nouveau=1" className="adm-btn adm-btn--primary">
          + Ajouter un produit
        </Link>
      }
    >
      <ProductList filter={params.get('filtre') || ''} />
    </AdminShell>
  );
}

const FILTERS: Array<{ id: string; label: string; test: (p: AdminProduct) => boolean }> = [
  { id: '', label: 'Tous', test: () => true },
  { id: 'en-ligne', label: 'En vente', test: (p) => p.active && p.price > 0 && p.stock !== 0 },
  { id: 'sans-prix', label: 'Sans prix', test: (p) => p.active && !p.price },
  { id: 'rupture', label: 'Rupture', test: (p) => p.stock === 0 },
  { id: 'sans-photo', label: 'Sans photo', test: (p) => !p.images.length },
  { id: 'masques', label: 'Masqués', test: (p) => !p.active },
];

function ProductList({ filter }: { filter: string }) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const flash = useFlash();

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        api<{ products: AdminProduct[] }>('/api/admin/products'),
        api<{ categories: AdminCategory[] }>('/api/admin/categories'),
      ]);
      setProducts(p.products);
      setCategories(c.categories);
    } catch (e) {
      flash.err(errorText(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = FILTERS.find((f) => f.id === filter) || FILTERS[0];
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const shown = useMemo(() => {
    const q = query
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
    return (products || []).filter(
      (p) =>
        active.test(p) &&
        (!category || p.categoryId === category) &&
        (!q || p.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q)),
    );
  }, [products, active, category, query]);

  /** One-click edits from the list: price, visibility, featured. */
  async function quick(p: AdminProduct, patch: Partial<AdminProduct>, msg: string) {
    try {
      const { product } = await api<{ product: AdminProduct }>(`/api/admin/products/${p.slug}`, {
        method: 'PUT',
        body: { ...p, ...patch },
      });
      setProducts((list) => (list || []).map((x) => (x.slug === p.slug ? product : x)));
      flash.ok(msg);
    } catch (e) {
      flash.err(errorText(e));
    }
  }

  if (!products) return flash.flash ? <Flash flash={flash.flash} /> : <Loading />;

  return (
    <>
      <Flash flash={flash.flash} />
      <div className="adm-tabs">
        {FILTERS.map((f) => {
          const n = products.filter(f.test).length;
          return (
            <button
              key={f.id}
              type="button"
              className={active.id === f.id ? 'is-active' : ''}
              onClick={() => router.replace(f.id ? `/admin/produits/?filtre=${f.id}` : '/admin/produits/')}
            >
              {f.label} <span>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="adm-toolbar">
        <input
          type="search"
          className="adm-input"
          placeholder="Rechercher un produit…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher un produit"
        />
        <select className="adm-input adm-input--auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.productCount})
            </option>
          ))}
        </select>
      </div>

      {shown.length ? (
        <div className="adm-products">
          {shown.map((p) => (
            <ProductRow key={p.slug} product={p} category={catName.get(p.categoryId) || '—'} onQuick={quick} />
          ))}
        </div>
      ) : (
        <p className="adm-empty">Aucun produit ne correspond.</p>
      )}
    </>
  );
}

function ProductRow({
  product: p,
  category,
  onQuick,
}: {
  product: AdminProduct;
  category: string;
  onQuick: (p: AdminProduct, patch: Partial<AdminProduct>, msg: string) => Promise<void>;
}) {
  const [price, setPrice] = useState(p.price ? String(p.price) : '');
  useEffect(() => setPrice(p.price ? String(p.price) : ''), [p.price]);
  const typed = Number(price.replace(/[^\d]/g, '')) || 0;
  const href = `/admin/produits/?modifier=${encodeURIComponent(p.slug)}`;

  return (
    <article className={`adm-prod${p.active ? '' : ' is-hidden'}`}>
      <Link href={href} className="adm-prod__img" tabIndex={-1} aria-hidden>
        {p.images[0] ? <img src={p.images[0].thumb} alt="" width={64} height={64} /> : <span>Sans photo</span>}
      </Link>
      <div className="adm-prod__main">
        <Link href={href} className="adm-prod__name">
          {p.name}
        </Link>
        <span className="adm-prod__meta">
          {category}
          {!p.active && <em className="adm-tag">Masqué</em>}
          {p.featured && <em className="adm-tag adm-tag--star">Coup de cœur</em>}
          {p.stock === 0 && <em className="adm-tag adm-tag--warn">Rupture</em>}
          {typeof p.stock === 'number' && p.stock > 0 && <em className="adm-tag">Stock : {p.stock}</em>}
        </span>
      </div>
      <form
        className="adm-prod__price"
        onSubmit={(e) => {
          e.preventDefault();
          if (typed !== p.price) onQuick(p, { price: typed }, typed ? `${p.name} : ${dh(typed)}.` : `${p.name} : prix retiré.`);
        }}
      >
        <input
          className="adm-input"
          inputMode="numeric"
          placeholder="Prix"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label={`Prix de ${p.name} en DH`}
        />
        <span>DH</span>
        {typed !== p.price && (
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--sm">
            OK
          </button>
        )}
      </form>
      <div className="adm-prod__actions">
        <button
          type="button"
          className="adm-btn adm-btn--ghost adm-btn--sm"
          onClick={() => onQuick(p, { active: !p.active }, p.active ? `${p.name} est masqué.` : `${p.name} est en ligne.`)}
        >
          {p.active ? 'Masquer' : 'Mettre en ligne'}
        </button>
        <Link href={href} className="adm-btn adm-btn--ghost adm-btn--sm">
          Modifier
        </Link>
      </div>
    </article>
  );
}
