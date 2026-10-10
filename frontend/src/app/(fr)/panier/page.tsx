import { CartPageView, cartMeta } from '@/views/Order';

export const metadata = cartMeta('fr');

export default function Page() {
  return <CartPageView />;
}
