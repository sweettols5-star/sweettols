import type { Metadata } from 'next';
import Link from '@/components/Link';
import ShopChrome from '@/components/ShopChrome';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
};

/** Exported as out/404.html. It sits under the root layout, so it brings the shop chrome itself. */
export default function NotFound() {
  return (
    <ShopChrome>
      <div className="container section">
        <div className="empty">
          <img src="/brand/logo-256.webp" alt="" width={128} height={128} className="empty__mark" />
          <h1 className="page-title">Page introuvable</h1>
          <p>Cette page n’existe pas ou a été déplacée.</p>
          <div className="confirm__actions">
            <Link href={routes.shop} className="btn btn--primary">
              Voir la boutique
            </Link>
            <Link href={routes.home} className="btn btn--ghost">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </ShopChrome>
  );
}
