'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from '@/components/Link';
import { hasStaticPage } from '@/components/LiveCatalogue';
import { routes } from '@/lib/routes';
import type { ProductImage } from '@/types';
import { api, errorText, uploadPhoto } from './client';
import type { AdminCategory, AdminProduct } from './types';
import { Field, Flash, Loading, useFlash } from './ui';

/** Same rule as the API's slugify, so the preview matches what gets saved. */
export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/['’]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

type Draft = {
  name: string;
  slug: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  details: string;
  images: ProductImage[];
  active: boolean;
  featured: boolean;
};

const EMPTY: Draft = {
  name: '',
  slug: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  description: '',
  details: '',
  images: [],
  active: true,
  featured: false,
};

const toDraft = (p: AdminProduct): Draft => ({
  name: p.name,
  slug: p.slug,
  categoryId: p.categoryId,
  price: p.price ? String(p.price) : '',
  compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
  stock: p.stock === null || p.stock === undefined ? '' : String(p.stock),
  description: p.description,
  details: p.details.join('\n'),
  images: p.images,
  active: p.active !== false,
  featured: p.featured,
});

const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;
const MAX_IMAGES = 8;

export default function ProductEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(slug ? null : EMPTY);
  const [original, setOriginal] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [slugTouched, setSlugTouched] = useState(!!slug);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const flash = useFlash();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ categories: cats }, prod] = await Promise.all([
          api<{ categories: AdminCategory[] }>('/api/admin/categories'),
          slug ? api<{ product: AdminProduct }>(`/api/admin/products/${encodeURIComponent(slug)}`) : Promise.resolve(null),
        ]);
        if (!alive) return;
        setCategories(cats);
        if (prod) {
          setOriginal(prod.product);
          setDraft(toDraft(prod.product));
        } else {
          setDraft((d) => (d && !d.categoryId && cats[0] ? { ...d, categoryId: cats[0].id } : d));
        }
      } catch (e) {
        if (alive) flash.err(errorText(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (!draft) return flash.flash ? <Flash flash={flash.flash} /> : <Loading />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const onName = (name: string) =>
    setDraft((d) => (d ? { ...d, name, ...(slugTouched ? {} : { slug: slugify(name) }) } : d));

  const price = num(draft.price);
  const compare = num(draft.compareAtPrice);
  const dirty = !original || JSON.stringify(toDraft(original)) !== JSON.stringify(draft);

  async function addFiles(files: FileList | null) {
    if (!files?.length || !draft) return;
    const room = MAX_IMAGES - draft.images.length;
    const list = [...files].slice(0, room);
    if (files.length > room) flash.err(`${MAX_IMAGES} photos au maximum par produit.`);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const img = await uploadPhoto(file, draft.name || draft.slug);
        setDraft((d) => (d ? { ...d, images: [...d.images, img] } : d));
      } catch (e) {
        flash.err(`${file.name} : ${errorText(e)}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  const moveImage = (i: number, by: number) =>
    setDraft((d) => {
      if (!d) return d;
      const imgs = [...d.images];
      const j = i + by;
      if (j < 0 || j >= imgs.length) return d;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...d, images: imgs };
    });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) return flash.err('Le nom du produit est obligatoire.');
    if (compare && compare <= price) return flash.err('L’ancien prix (barré) doit être supérieur au prix de vente.');
    if (original && draft.slug !== original.slug && !window.confirm(
      'Changer l’adresse de la page casse les liens déjà partagés et le référencement de l’ancienne adresse. Continuer ?',
    )) return;

    setBusy(true);
    const body = {
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
      categoryId: draft.categoryId,
      price,
      compareAtPrice: compare,
      stock: draft.stock.trim() === '' ? null : num(draft.stock),
      description: draft.description,
      details: draft.details.split('\n'),
      images: draft.images,
      active: draft.active,
      featured: draft.featured,
    };
    try {
      const { product } = original
        ? await api<{ product: AdminProduct }>(`/api/admin/products/${encodeURIComponent(original.slug)}`, { method: 'PUT', body })
        : await api<{ product: AdminProduct }>('/api/admin/products', { method: 'POST', body });
      setOriginal(product);
      setDraft(toDraft(product));
      setSlugTouched(true);
      flash.ok(original ? 'Modifications enregistrées — visibles tout de suite sur la boutique.' : 'Produit créé.');
      if (!original || product.slug !== original.slug) {
        router.replace(`/admin/produits/?modifier=${encodeURIComponent(product.slug)}`);
      }
    } catch (err) {
      flash.err(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!original) return;
    if (!window.confirm(`Supprimer définitivement « ${original.name} » ?\n\nPour le retirer seulement de la vente, utilisez plutôt « Masquer ».`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/products/${encodeURIComponent(original.slug)}`, { method: 'DELETE' });
      router.push('/admin/produits/');
    } catch (err) {
      flash.err(errorText(err));
      setBusy(false);
    }
  }

  const preview = original
    ? hasStaticPage(original.slug)
      ? routes.product(original.slug)
      : routes.productFallback(original.slug)
    : '';

  return (
    <form className="adm-editor" onSubmit={save}>
      <div className="adm-editor__bar">
        <Link href="/admin/produits/" className="adm-link">
          ← Tous les produits
        </Link>
        {preview && original?.active && (
          <a href={preview} target="_blank" rel="noopener noreferrer" className="adm-link">
            Voir sur la boutique ↗
          </a>
        )}
      </div>
      <Flash flash={flash.flash} />

      <div className="adm-editor__grid">
        <div className="adm-editor__main">
          <section className="adm-card">
            <h2 className="adm-h2">Informations</h2>
            <div className="adm-fields">
              <Field label="Nom du produit" wide>
                <input className="adm-input" required value={draft.name} onChange={(e) => onName(e.target.value)} maxLength={140} />
              </Field>
              <Field label="Catégorie">
                <select className="adm-input" value={draft.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Adresse de la page" hint={`/produit/${draft.slug || '…'}/`}>
                <input
                  className="adm-input"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Description" wide hint="Affichée sur la fiche et reprise par Google.">
                <textarea className="adm-input" rows={5} value={draft.description} onChange={(e) => set('description', e.target.value)} maxLength={4000} />
              </Field>
              <Field label="Caractéristiques" wide hint="Une par ligne : matière, dimensions, nombre d’empreintes, entretien…">
                <textarea className="adm-input" rows={5} value={draft.details} onChange={(e) => set('details', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card__head">
              <h2 className="adm-h2">Photos</h2>
              <span className="adm-muted">
                {draft.images.length}/{MAX_IMAGES} — la première est la photo principale
              </span>
            </div>
            <div className="adm-photos">
              {draft.images.map((img, i) => (
                <figure key={img.url} className="adm-photo">
                  <img src={img.thumb} alt="" width={140} height={140} />
                  {i === 0 && <figcaption>Principale</figcaption>}
                  <div className="adm-photo__tools">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Avancer">
                      ←
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === draft.images.length - 1} aria-label="Reculer">
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => set('images', draft.images.filter((_, n) => n !== i))}
                      aria-label="Retirer la photo"
                      className="adm-photo__del"
                    >
                      ✕
                    </button>
                  </div>
                </figure>
              ))}
              {draft.images.length < MAX_IMAGES && (
                <label
                  className={`adm-drop${uploading ? ' is-busy' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => addFiles(e.target.files)} />
                  <strong>{uploading ? `Envoi… (${uploading})` : '+ Ajouter'}</strong>
                  <small>JPEG, PNG, WebP — cadrées en carré automatiquement</small>
                </label>
              )}
            </div>
          </section>
        </div>

        <aside className="adm-editor__side">
          <section className="adm-card">
            <h2 className="adm-h2">Prix & stock</h2>
            <Field label="Prix de vente (DH)" hint={price ? undefined : 'Vide = « Prix à venir » : visible mais non commandable.'}>
              <input className="adm-input" inputMode="numeric" value={draft.price} onChange={(e) => set('price', e.target.value)} placeholder="Ex. 45" />
            </Field>
            <Field label="Ancien prix barré (DH)" hint="Facultatif, pour une promotion.">
              <input className="adm-input" inputMode="numeric" value={draft.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} />
            </Field>
            <Field label="Stock" hint="Vide = non suivi (toujours disponible). 0 = rupture.">
              <input className="adm-input" inputMode="numeric" value={draft.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
          </section>

          <section className="adm-card">
            <h2 className="adm-h2">Visibilité</h2>
            <label className="adm-check">
              <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} />
              <span>
                <strong>Visible sur la boutique</strong>
                <small>Décocher pour le retirer sans le supprimer.</small>
              </span>
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} />
              <span>
                <strong>Coup de cœur</strong>
                <small>Mis en avant sur la page d’accueil.</small>
              </span>
            </label>
          </section>

          <div className="adm-editor__save">
            <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy || uploading > 0 || !dirty}>
              {busy ? 'Enregistrement…' : original ? 'Enregistrer' : 'Créer le produit'}
            </button>
            {original && (
              <button type="button" className="adm-btn adm-btn--danger adm-btn--block" onClick={remove} disabled={busy}>
                Supprimer
              </button>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}
