import { ProductFallbackView, productFallbackMeta } from '@/views/Product';

export const metadata = productFallbackMeta('fr');

export default function Page() {
  return <ProductFallbackView lang="fr" />;
}
