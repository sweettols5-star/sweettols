'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { OrderStatus } from './types';

export const STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  nouvelle: { label: 'Nouvelle', tone: 'new' },
  confirmee: { label: 'Confirmée', tone: 'info' },
  expediee: { label: 'Expédiée', tone: 'ship' },
  livree: { label: 'Livrée', tone: 'ok' },
  annulee: { label: 'Annulée', tone: 'off' },
};

export const STATUS_ORDER: OrderStatus[] = ['nouvelle', 'confirmee', 'expediee', 'livree', 'annulee'];

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status] ?? { label: status, tone: 'off' };
  return <span className={`adm-badge adm-badge--${s.tone}`}>{s.label}</span>;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d);
};

/** Success / error line that fades out by itself. */
export function useFlash() {
  const [flash, setFlash] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  useEffect(() => {
    if (!flash || flash.tone === 'err') return;
    const t = setTimeout(() => setFlash(null), 3500);
    return () => clearTimeout(t);
  }, [flash]);
  return {
    flash,
    ok: (text: string) => setFlash({ tone: 'ok', text }),
    err: (text: string) => setFlash({ tone: 'err', text }),
    clear: () => setFlash(null),
  };
}

export function Flash({ flash }: { flash: { tone: 'ok' | 'err'; text: string } | null }) {
  if (!flash) return null;
  return (
    <p className={`adm-alert adm-alert--${flash.tone}`} role={flash.tone === 'err' ? 'alert' : 'status'}>
      {flash.text}
    </p>
  );
}

export function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`adm-field${wide ? ' adm-field--wide' : ''}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Loading({ text = 'Chargement…' }: { text?: string }) {
  return <p className="adm-muted adm-loading">{text}</p>;
}

/** Whole dirhams typed by the owner: "1 250", "1250 DH" → 1250. Empty → ''. */
export const parseDh = (v: string) => {
  const d = v.replace(/[^\d]/g, '');
  return d ? Number(d) : '';
};
