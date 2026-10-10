import type { ReactNode } from 'react';
import { LangProvider } from '@/components/LangProvider';
import ShopChrome from '@/components/ShopChrome';
import { dirOf, type Lang } from '@/i18n';
import { fontClass, fontClassAr } from '@/lib/fonts';
import '@/styles/globals.css';

/**
 * The <html> of a shop page. Each language has its own root layout — (fr) for
 * the unprefixed French pages, [lang] for /en/ and /ar/ — so lang and dir are
 * right in the static HTML, before any script runs. Font variable classes sit
 * on <html>: the tokens in globals.css are declared on :root and resolve there.
 */
export default function ShopRoot({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} dir={dirOf(lang)} className={lang === 'ar' ? fontClassAr : fontClass}>
      <body suppressHydrationWarning>
        <LangProvider lang={lang}>
          <ShopChrome>{children}</ShopChrome>
        </LangProvider>
      </body>
    </html>
  );
}
