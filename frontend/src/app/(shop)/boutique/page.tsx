import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGrid from '@/components/ProductGrid';
import ShopBrowser from '@/components/ShopBrowser';
import { products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Boutique — tout le matériel de pâtisserie',
  description:
    'Tous nos outils de pâtisserie et de cake design : moules en silicone et en inox, tapis de cuisson, spatules, lisseurs, emporte-pièces. Paiement à la livraison au Maroc.',
  path: routes.shop,
});

export default function ShopPage() {
  return (
    <div className="container section">
      <Breadcrumbs items={[{ label: 'Boutique' }]} />
      <header className="page-head">
        <h1 className="page-title">La boutique</h1>
        <p>Moules, tapis, spatules et outils de décoration : tout le matériel pour réussir vos gâteaux.</p>
      </header>
      {/* useSearchParams needs a Suspense boundary in a static export; the
          fallback is the same grid without the search, so the HTML is complete. */}
      <Suspense fallback={<ProductGrid products={products} sortable />}>
        <ShopBrowser products={products} />
      </Suspense>
    </div>
  );
}
