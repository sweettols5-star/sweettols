import type { Lang } from '@/i18n';
import ShopView, { shopMeta } from '@/views/Shop';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return shopMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <ShopView lang={(await params).lang as Lang} />;
}
