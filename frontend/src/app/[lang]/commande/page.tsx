import type { Lang } from '@/i18n';
import { CheckoutPageView, checkoutMeta } from '@/views/Order';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return checkoutMeta((await params).lang as Lang);
}

export default function Page() {
  return <CheckoutPageView />;
}
