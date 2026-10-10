'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from '@/components/Link';
import { IconClose, IconMenu } from '@/components/Icons';
import { API_URL } from '@/config/api';
import { api, ApiError, clearToken, getToken, onExpired, setToken } from './client';
import { BusyButton, SlowHint, Spinner } from './ui';

type Admin = { email: string; name: string };
type Phase = 'checking' | 'out' | 'in';

const NAV = [
  { href: '/admin/', label: 'Tableau de bord' },
  { href: '/admin/commandes/', label: 'Commandes', badge: 'orders' as const },
  { href: '/admin/messages/', label: 'Messages', badge: 'messages' as const },
  { href: '/admin/produits/', label: 'Produits' },
  { href: '/admin/categories/', label: 'Catégories' },
  { href: '/admin/reglages/', label: 'Réglages' },
];

/** Lets a page refresh the sidebar badges (new orders, unread messages) after a change. */
const BadgeCtx = createContext<() => void>(() => {});
export const useRefreshBadge = () => useContext(BadgeCtx);

/**
 * What every back-office page shares: the token check, the login form, the
 * navigation and sign-out. A page below it is only ever rendered for a
 * signed-in administrator.
 */
export default function AdminShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() || '';
  const [phase, setPhase] = useState<Phase>('checking');
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [newOrders, setNewOrders] = useState(0);
  const [unread, setUnread] = useState(0);
  const [menu, setMenu] = useState(false);

  const refreshBadge = useCallback(() => {
    api<{ toProcess: number; unreadMessages?: number }>('/api/admin/dashboard')
      .then((d) => {
        setNewOrders(d.toProcess);
        setUnread(d.unreadMessages || 0);
      })
      .catch(() => {});
  }, []);

  const check = useCallback(async () => {
    if (!getToken()) {
      setPhase('out');
      return;
    }
    try {
      const { admin: me } = await api<{ admin: Admin }>('/api/admin/me');
      setAdmin(me);
      setPhase('in');
      refreshBadge();
    } catch {
      setPhase('out');
    }
  }, [refreshBadge]);

  useEffect(() => {
    check();
    return onExpired(() => {
      setAdmin(null);
      setPhase('out');
    });
  }, [check]);

  useEffect(() => setMenu(false), [pathname]);

  function signOut() {
    clearToken();
    setAdmin(null);
    setPhase('out');
  }

  if (phase === 'checking') {
    return (
      <div className="adm-boot" role="status">
        <Spinner /> Vérification de la session…
      </div>
    );
  }
  if (phase === 'out') return <LoginScreen onDone={check} />;

  const isActive = (href: string) =>
    href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.replace(/\/$/, ''));

  return (
    <BadgeCtx.Provider value={refreshBadge}>
      <div className={`adm${menu ? ' adm--menu' : ''}`}>
        <aside className="adm-side">
          <div className="adm-side__brand">
            <img src="/brand/emblem.png" alt="" width={36} height={36} />
            <span>
              <strong>SWEETTOOLS</strong>
              <small>Administration</small>
            </span>
            <button type="button" className="adm-side__close" aria-label="Fermer le menu" onClick={() => setMenu(false)}>
              <IconClose />
            </button>
          </div>
          <nav className="adm-nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? 'is-active' : ''}>
                {item.label}
                {item.badge === 'orders' && newOrders > 0 && (
                  <span className="adm-nav__badge" aria-label={`${newOrders} nouvelles`}>
                    {newOrders}
                  </span>
                )}
                {item.badge === 'messages' && unread > 0 && (
                  <span className="adm-nav__badge" aria-label={`${unread} non lus`}>
                    {unread}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="adm-side__foot">
            <a href="/" target="_blank" rel="noopener noreferrer">
              Voir la boutique ↗
            </a>
            <span className="adm-who" title={admin?.email}>
              {admin?.email}
            </span>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={signOut}>
              Se déconnecter
            </button>
          </div>
        </aside>
        <div className="adm-backdrop" onClick={() => setMenu(false)} />

        <div className="adm-body">
          <header className="adm-head">
            <button type="button" className="adm-burger" aria-label="Ouvrir le menu" onClick={() => setMenu(true)}>
              <IconMenu />
              {newOrders + unread > 0 && <span className="adm-nav__badge">{newOrders + unread}</span>}
            </button>
            <h1 className="adm-h1">{title}</h1>
            {actions && <div className="adm-head__actions">{actions}</div>}
          </header>
          <main className="adm-main">{children}</main>
        </div>
      </div>
    </BadgeCtx.Provider>
  );
}

function LoginScreen({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: { email, password },
        anonymous: true,
      });
      setToken(token);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible.');
      setBusy(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-card adm-login__box" onSubmit={submit}>
        <img src="/brand/logo-256.webp" alt="SweetTools" width={120} height={120} className="adm-login__mark" />
        <h1 className="adm-login__title">SWEETTOOLS</h1>
        <p className="adm-muted">Espace d’administration</p>

        {error && <p className="adm-alert adm-alert--err">{error}</p>}

        <label className="adm-field">
          <span>E-mail</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <BusyButton type="submit" className="adm-btn adm-btn--primary" busy={busy} busyText="Connexion…">
          Se connecter
        </BusyButton>
        <SlowHint active={busy} />
        <p className="adm-login__api">Serveur : {API_URL}</p>
      </form>
    </div>
  );
}
