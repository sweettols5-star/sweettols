'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LANG_NAMES, LANG_SHORT, LANGS, localePath, splitPath } from '@/i18n/config';
import { useLang, useT } from './LangProvider';

/**
 * Language menu: the current language as a button; a click lists the two
 * others. Plain links, not next/link: each language has its own root layout,
 * so switching is a full page load anyway. The search string (?q=, ?slug=)
 * follows along.
 */
export default function LangSwitch() {
  const lang = useLang();
  const { path } = splitPath(usePathname() || '/');
  const label = useT().nav.language;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Closes on a click outside and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`langs${open ? ' is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="langs__current"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label} : ${LANG_NAMES[lang]}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span lang={lang}>{LANG_SHORT[lang]}</span>
        <svg className="langs__caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className="langs__menu" aria-label={label}>
          {LANGS.filter((l) => l !== lang).map((l) => {
            const href = localePath(l, path);
            return (
              <li key={l}>
                <a
                  href={href}
                  hrefLang={l}
                  lang={l}
                  onClick={(e) => {
                    if (window.location.search) {
                      e.preventDefault();
                      window.location.href = href + window.location.search;
                    }
                  }}
                >
                  <span className="langs__code">{LANG_SHORT[l]}</span>
                  {LANG_NAMES[l]}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
