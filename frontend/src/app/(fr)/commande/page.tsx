import { CheckoutPageView, checkoutMeta } from '@/views/Order';

export const metadata = checkoutMeta('fr');

export default function Page() {
  return <CheckoutPageView />;
}
