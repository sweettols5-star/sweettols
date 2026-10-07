import CheckoutForm from '@/components/CheckoutForm';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Commande — livraison',
  description: 'Finalisez votre commande SweetTools, paiement à la livraison.',
  path: routes.checkout,
  noindex: true,
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
