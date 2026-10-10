'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';
import Brand from './Brand';
import Link from './Link';
import { IconBag, IconClose, IconMenu, IconSearch } from './Icons';
import { useCart } from './CartProvider';
import { useShownCategories, useSettings } from './LiveCatalogue';

const NAV = [
  { href: routes.home, label: 'Accueil' },
  { href: routes.shop, label: 'Boutique' },
  { href: routes.guides, label: 'Conseils' },
  { href: routes.delivery, label: 'Livraison' },
  { href: routes.contact, label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const cart = useCart();
  const categories = useShownCategories();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bump, setBump] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Categories dropdown: opens on hover (or keyboard focus), closes when the
  // pointer leaves — after a short grace period so moving down into the menu
  // does not flicker it shut — on click, on Escape and on navigation.
  const openDrop = () => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
    setDropOpen(true);
  };
  const closeDropSoon = () => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
    dropTimer.current = setTimeout(() => setDropOpen(false), 150);
  };
  const closeDrop = () => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
    setDropOpen(false);
    // drop focus too, so a keyboard/click focus does not keep it visually active
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };
  useEffect(() => () => {
    if (dropTimer.current) clearTimeout(dropTimer.current);
  }, []);
  // Escape closes it even when it was opened by the mouse (focus is elsewhere then).
  useEffect(() => {
    if (!dropOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDropOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropOpen]);

  // Close the panels on navigation.
  useEffect(() => {
    setOpen(false);
    setSearching(false);
    setDropOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!cart.lastAdd) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [cart.lastAdd]);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : !!pathname?.startsWith(href));

  return (
    <>
      {settings.announcement && <div className="announce">{settings.announcement}</div>}
      <header className="header">
        <div className="container header__bar">
          <button
            type="button"
            className="icon-btn header__burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <IconMenu />
          </button>

          <Brand />

          <nav className="header__nav" aria-label="Navigation principale">
            {NAV.slice(0, 2).map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'is-active' : ''}>
                {n.label}
              </Link>
            ))}
            <div
              className={dropOpen ? 'header__drop is-open' : 'header__drop'}
              onMouseEnter={openDrop}
              onMouseLeave={closeDropSoon}
              onFocus={openDrop}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeDropSoon();
              }}
              onKeyDown={(e) => e.key === 'Escape' && closeDrop()}
            >
              <Link
                href={routes.shop}
                className={pathname?.startsWith('/categorie') ? 'is-active' : ''}
                aria-haspopup="true"
                aria-expanded={dropOpen}
                onClick={closeDrop}
              >
                Catégories
                <svg className="header__caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                  <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Link>
              <div className="header__menu">
                {categories.map((c) => (
                  <Link key={c.id} href={routes.category(c.id)} onClick={closeDrop}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            {NAV.slice(2).map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'is-active' : ''}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Rechercher"
              aria-expanded={searching}
              onClick={() => setSearching((s) => !s)}
            >
              <IconSearch />
            </button>
            <Link
              href={routes.cart}
              className={`icon-btn cart-btn${bump ? ' is-bumped' : ''}`}
              aria-label={`Panier (${cart.count} article${cart.count > 1 ? 's' : ''})`}
            >
              <IconBag />
              {cart.ready && cart.count > 0 && <span className="cart-btn__count">{cart.count}</span>}
            </Link>
          </div>
        </div>

        {searching && (
          <div className="header__search">
            <form action={routes.shop} method="get" className="container" role="search">
              <IconSearch />
              <input
                ref={searchRef}
                name="q"
                type="search"
                placeholder="Moule, tapis, spatule…"
                aria-label="Rechercher un produit"
              />
              <button type="submit" className="btn btn--primary btn--sm">
                Rechercher
              </button>
            </form>
          </div>
        )}
      </header>

      <div className={`drawer${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="drawer__backdrop" onClick={() => setOpen(false)} />
        <div className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <Brand />
            <button type="button" className="icon-btn" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
              <IconClose />
            </button>
          </div>
          <nav className="drawer__nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={isActive(n.href) ? 'is-active' : ''}>
                {n.label}
              </Link>
            ))}
            <Link href={routes.faq} className={isActive(routes.faq) ? 'is-active' : ''}>
              Questions fréquentes
            </Link>
            <p className="drawer__label">Catégories</p>
            {categories.map((c) => (
              <Link key={c.id} href={routes.category(c.id)} className="drawer__sub">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
