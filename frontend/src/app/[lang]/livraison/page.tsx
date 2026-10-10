import type { Lang } from '@/i18n';
import { DeliveryView, deliveryMeta } from '@/views/Info';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return deliveryMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <DeliveryView lang={(await params).lang as Lang} />;
}
