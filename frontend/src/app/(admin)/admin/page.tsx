'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import type { Dashboard } from '@/admin/types';
import { Flash, Loading, StatusBadge, useFlash, when } from '@/admin/ui';
import Link from '@/components/Link';
import { dh } from '@/lib/format';

export default function DashboardPage() {
  return (
    <AdminShell title="Tableau de bord">
      <DashboardView />
    </AdminShell>
  );
}

function DashboardView() {
  const [data, setData] = useState<Dashboard | null>(null);
  const flash = useFlash();

  useEffect(() => {
    api<Dashboard>('/api/admin/dashboard')
      .then(setData)
      .catch((e) => flash.err(errorText(e)));
  }, []);

  if (!data) return flash.flash ? <Flash flash={flash.flash} /> : <Loading />;

  const p = data.products;
  const todo = [
    p.withoutPrice > 0 && {
      text: `${p.withoutPrice} produit${p.withoutPrice > 1 ? 's' : ''} sans prix (affichés « Prix à venir », non commandables)`,
      href: '/admin/produits/?filtre=sans-prix',
    },
    p.outOfStock > 0 && {
      text: `${p.outOfStock} produit${p.outOfStock > 1 ? 's' : ''} en rupture de stock`,
      href: '/admin/produits/?filtre=rupture',
    },
    p.withoutImage > 0 && {
      text: `${p.withoutImage} produit${p.withoutImage > 1 ? 's' : ''} sans photo`,
      href: '/admin/produits/?filtre=sans-photo',
    },
  ].filter(Boolean) as Array<{ text: string; href: string }>;

  return (
    <>
      <div className="adm-stats">
        <Link href="/admin/commandes/?statut=nouvelle" className={`adm-stat${data.toProcess ? ' adm-stat--hot' : ''}`}>
          <span>À traiter</span>
          <strong>{data.toProcess}</strong>
          <small>nouvelle{data.toProcess > 1 ? 's' : ''} commande{data.toProcess > 1 ? 's' : ''}</small>
        </Link>
        <div className="adm-stat">
          <span>30 derniers jours</span>
          <strong>{data.last30.orders}</strong>
          <small>commande{data.last30.orders > 1 ? 's' : ''} (hors annulées)</small>
        </div>
        <div className="adm-stat">
          <span>Ventes 30 jours</span>
          <strong>{dh(data.last30.revenue)}</strong>
          <small>hors frais de livraison</small>
        </div>
        <Link href="/admin/produits/" className="adm-stat">
          <span>Catalogue</span>
          <strong>{p.active}</strong>
          <small>
            produits en ligne{p.total > p.active ? ` · ${p.total - p.active} masqué${p.total - p.active > 1 ? 's' : ''}` : ''}
          </small>
        </Link>
      </div>

      {todo.length > 0 && (
        <section className="adm-card">
          <h2 className="adm-h2">À compléter</h2>
          <ul className="adm-todo">
            {todo.map((t) => (
              <li key={t.href}>
                <Link href={t.href}>{t.text} →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="adm-card">
        <div className="adm-card__head">
          <h2 className="adm-h2">Dernières commandes</h2>
          <Link href="/admin/commandes/">Toutes les commandes →</Link>
        </div>
        {data.latest.length ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Ville</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.latest.map((o) => (
                  <tr key={o.reference}>
                    <td>
                      <Link href={`/admin/commandes/?ref=${o.reference}`} className="adm-mono">
                        {o.reference}
                      </Link>
                    </td>
                    <td>{o.customer.name}</td>
                    <td>{o.customer.city}</td>
                    <td className="adm-num">{dh(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="adm-muted">{when(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="adm-muted">Aucune commande pour le moment.</p>
        )}
      </section>
    </>
  );
}
