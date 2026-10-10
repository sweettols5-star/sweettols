import { DeliveryView, deliveryMeta } from '@/views/Info';

export const metadata = deliveryMeta('fr');

export default function Page() {
  return <DeliveryView lang="fr" />;
}
