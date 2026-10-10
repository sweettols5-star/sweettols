import ShopView, { shopMeta } from '@/views/Shop';

export const metadata = shopMeta('fr');

export default function Page() {
  return <ShopView lang="fr" />;
}
