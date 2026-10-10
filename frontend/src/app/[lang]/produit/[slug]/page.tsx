import type { Lang } from '@/i18n';
import ProductPageView, { productMeta, productParams } from '@/views/Product';

export const dynamicParams = false;
export const generateStaticParams = productParams;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await params;
  return productMeta(p.lang as Lang, p.slug);
}

export default async function Page({ params }: Props) {
  const p = await params;
  return <ProductPageView lang={p.lang as Lang} slug={p.slug} />;
}
