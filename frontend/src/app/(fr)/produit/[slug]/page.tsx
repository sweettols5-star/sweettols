import ProductPageView, { productMeta, productParams } from '@/views/Product';

export const dynamicParams = false;
export const generateStaticParams = productParams;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return productMeta('fr', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <ProductPageView lang="fr" slug={(await params).slug} />;
}
