import { Suspense } from 'react';
import ProductFallback from '@/components/ProductFallback';
import { pageMeta } from '@/lib/seo';

/** /produit/?slug=… — products added after the last build. Never indexed. */
export const metadata = pageMeta({
  title: 'Produit',
  description: 'Fiche produit SWEETTOOLS.',
  path: '/produit/',
  noindex: true,
});

export default function ProductFallbackPage() {
  return (
    <Suspense fallback={<div className="container section">Chargement…</div>}>
      <ProductFallback />
    </Suspense>
  );
}
