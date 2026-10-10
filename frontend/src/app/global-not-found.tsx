import type { Metadata } from 'next';
import { LangProvider } from '@/components/LangProvider';
import ShopChrome from '@/components/ShopChrome';
import { fontClass } from '@/lib/fonts';
import NotFoundView from '@/views/NotFound';
import '@/styles/globals.css';

/**
 * Exported as out/404.html, served by Nginx for any unknown address. With
 * several root layouts there is no single one to wrap a 404, so this page
 * brings its own <html> (Next's global-not-found, enabled in next.config).
 */
export const metadata: Metadata = {
  title: 'Page introuvable | SWEETTOOLS',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontClass}>
      <body suppressHydrationWarning>
        <LangProvider lang="fr">
          <ShopChrome>
            <NotFoundView lang="fr" />
          </ShopChrome>
        </LangProvider>
      </body>
    </html>
  );
}
