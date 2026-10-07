import CartView from '@/components/CartView';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Mon panier',
  description: 'Votre panier SweetTools.',
  path: routes.cart,
  noindex: true,
});

export default function CartPage() {
  return <CartView />;
}
