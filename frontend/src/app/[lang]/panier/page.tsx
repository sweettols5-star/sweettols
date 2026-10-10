import type { Lang } from '@/i18n';
import { CartPageView, cartMeta } from '@/views/Order';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return cartMeta((await params).lang as Lang);
}

export default function Page() {
  return <CartPageView />;
}
