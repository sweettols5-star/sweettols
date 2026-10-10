import type { Lang } from '@/i18n';
import { ProductFallbackView, productFallbackMeta } from '@/views/Product';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return productFallbackMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <ProductFallbackView lang={(await params).lang as Lang} />;
}
