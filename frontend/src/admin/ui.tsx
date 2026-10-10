'use client';

import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
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

const CARRY = 'sweettools.admin.flash';

/**
 * Keeps a success message across a remount — e.g. « Produit créé » while the
 * editor reopens on the new product's address. The next useFlash shows it.
 */
export function carryFlash(text: string) {
  try {
    window.sessionStorage.setItem(CARRY, text);
  } catch {
    /* storage blocked: the message is simply lost */
  }
}

/** Success / error line that fades out by itself. */
export function useFlash() {
  const [flash, setFlash] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  useEffect(() => {
    try {
      const text = window.sessionStorage.getItem(CARRY);
      if (text) {
        window.sessionStorage.removeItem(CARRY);
        setFlash({ tone: 'ok', text });
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    if (!flash || flash.tone === 'err') return;
    const t = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(t);
  }, [flash]);
  return {
    flash,
    ok: (text: string) => setFlash({ tone: 'ok', text }),
    err: (text: string) => setFlash({ tone: 'err', text }),
    clear: () => setFlash(null),
  };
}

/**
 * Toast pinned to the top of the screen, so it is seen wherever the page is
 * scrolled and whichever button caused it. Success fades (useFlash); an error
 * stays until closed.
 */
export function Flash({ flash }: { flash: { tone: 'ok' | 'err'; text: string } | null }) {
  const [closed, setClosed] = useState<typeof flash>(null);
  if (!flash || closed === flash) return null;
  return (
    <div className={`adm-toast adm-toast--${flash.tone}`} role={flash.tone === 'err' ? 'alert' : 'status'}>
      <span className="adm-toast__icon" aria-hidden>
        {flash.tone === 'ok' ? '✓' : '!'}
      </span>
      <p>{flash.text}</p>
      <button type="button" className="adm-toast__close" onClick={() => setClosed(flash)} aria-label="Fermer le message">
        ×
      </button>
    </div>
  );
}

/** True once `active` has lasted `ms` — the API on Render's free plan sleeps and takes ~50 s to wake. */
export function useSlow(active: boolean, ms = 6000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!active) return;
    const t = setTimeout(() => setSlow(true), ms);
    return () => clearTimeout(t);
  }, [active, ms]);
  return slow;
}

export function Spinner() {
  return <span className="adm-spin" aria-hidden />;
}

/** A button that shows a spinner and what it is doing while its request runs. */
export function BusyButton({
  busy,
  busyText,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy: boolean; busyText: string }) {
  return (
    <button {...rest} className={`${className}${busy ? ' is-busy' : ''}`} disabled={busy || disabled} aria-busy={busy || undefined}>
      {busy ? (
        <>
          <Spinner />
          {busyText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Line under a long-running action, once it has been pending for a while. */
export function SlowHint({ active }: { active: boolean }) {
  const slow = useSlow(active);
  if (!slow) return null;
  return (
    <p className="adm-slow" role="status">
      Le serveur met du temps à répondre (il se réveille après une période d’inactivité, jusqu’à une minute). Ne fermez pas
      la page…
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
  return (
    <div className="adm-loading" role="status">
      <p>
        <Spinner />
        {text}
      </p>
      <SlowHint active />
    </div>
  );
}

/** Whole dirhams typed by the owner: "1 250", "1250 DH" → 1250. Empty → ''. */
export const parseDh = (v: string) => {
  const d = v.replace(/[^\d]/g, '');
  return d ? Number(d) : '';
};
