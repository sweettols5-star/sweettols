'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import AdminShell from '@/admin/AdminShell';
import { api, errorText, uploadPhoto } from '@/admin/client';
import type { AdminCategory } from '@/admin/types';
import { Field, Flash, Loading, useFlash } from '@/admin/ui';
import Link from '@/components/Link';
import { routes } from '@/lib/routes';

export default function CategoriesPage() {
  return (
    <AdminShell title="Catégories">
      <CategoriesView />
    </AdminShell>
  );
}

function CategoriesView() {
  const [list, setList] = useState<AdminCategory[] | null>(null);
  const [adding, setAdding] = useState(false);
  const flash = useFlash();

  const load = useCallback(async () => {
    try {
      setList((await api<{ categories: AdminCategory[] }>('/api/admin/categories')).categories);
    } catch (e) {
      flash.err(errorText(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!list) return flash.flash ? <Flash flash={flash.flash} /> : <Loading />;

  return (
    <>
      <Flash flash={flash.flash} />
      <p className="adm-muted adm-intro">
        L’ordre fixe l’affichage dans les menus et sur l’accueil. Une catégorie vide reste cachée des menus jusqu’à ce
        qu’elle contienne un produit.
      </p>

      <div className="adm-cats">
        {list.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            onSaved={(msg) => {
              flash.ok(msg);
              load();
            }}
            onError={(m) => flash.err(m)}
          />
        ))}
      </div>

      {adding ? (
        <CategoryForm
          onCancel={() => setAdding(false)}
          onSaved={(msg) => {
            setAdding(false);
            flash.ok(msg);
            load();
          }}
          onError={(m) => flash.err(m)}
          nextOrder={list.length + 1}
        />
      ) : (
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setAdding(true)}>
          + Nouvelle catégorie
        </button>
      )}
    </>
  );
}

function CategoryCard({
  category: c,
  onSaved,
  onError,
}: {
  category: AdminCategory;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  async function remove() {
    if (!window.confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
      onSaved(`Catégorie « ${c.name} » supprimée.`);
    } catch (e) {
      onError(errorText(e));
    }
  }

  if (editing) {
    return (
      <CategoryForm
        category={c}
        onCancel={() => setEditing(false)}
        onSaved={(msg) => {
          setEditing(false);
          onSaved(msg);
        }}
        onError={onError}
      />
    );
  }

  return (
    <article className="adm-cat">
      <span className="adm-cat__order">{c.order}</span>
      {c.image ? <img src={c.image} alt="" width={56} height={56} /> : <span className="adm-cat__ph">Photo auto</span>}
      <div className="adm-cat__main">
        <strong>{c.name}</strong>
        <small>
          {c.productCount ? (
            <Link href={`/admin/produits/`}>
              {c.productCount} produit{c.productCount > 1 ? 's' : ''}
            </Link>
          ) : (
            <em className="adm-tag">Vide — cachée des menus</em>
          )}
          {' · '}
          <a href={routes.category(c.id)} target="_blank" rel="noopener noreferrer">
            /categorie/{c.id}/
          </a>
        </small>
      </div>
      <div className="adm-row">
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setEditing(true)}>
          Modifier
        </button>
        {!c.productCount && (
          <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={remove}>
            Supprimer
          </button>
        )}
      </div>
    </article>
  );
}

function CategoryForm({
  category,
  nextOrder = 99,
  onCancel,
  onSaved,
  onError,
}: {
  category?: AdminCategory;
  nextOrder?: number;
  onCancel: () => void;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [order, setOrder] = useState(String(category?.order ?? nextOrder));
  const [image, setImage] = useState(category?.image || '');
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      setImage((await uploadPhoto(file, name)).thumb);
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body = { name, description, order: Number(order) || 0, image };
    try {
      if (category) {
        await api(`/api/admin/categories/${category.id}`, { method: 'PUT', body });
        onSaved(`Catégorie « ${name} » enregistrée.`);
      } else {
        await api('/api/admin/categories', { method: 'POST', body });
        onSaved(`Catégorie « ${name} » créée.`);
      }
    } catch (err) {
      onError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <form className="adm-card adm-cat-form" onSubmit={submit}>
      <div className="adm-fields">
        <Field label="Nom">
          <input className="adm-input" required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </Field>
        <Field label="Ordre d’affichage">
          <input className="adm-input" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} />
        </Field>
        <Field label="Description" wide hint="Affichée en haut de la page de la catégorie et reprise par Google.">
          <textarea className="adm-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />
        </Field>
        <Field label="Photo" wide hint="Facultatif : sans photo, celle du premier produit de la catégorie est utilisée.">
          <div className="adm-row">
            {image && <img src={image} alt="" width={56} height={56} className="adm-thumb" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files?.[0])} />
            {image && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setImage('')}>
                Retirer
              </button>
            )}
          </div>
        </Field>
      </div>
      <div className="adm-row">
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
          {category ? 'Enregistrer' : 'Créer la catégorie'}
        </button>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
