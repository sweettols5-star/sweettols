import type { Lang } from '@/i18n';
import CategoryView, { categoryMeta, categoryParams } from '@/views/Category';

export const dynamicParams = false;
export const generateStaticParams = categoryParams;

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await params;
  return categoryMeta(p.lang as Lang, p.id);
}

export default async function Page({ params }: Props) {
  const p = await params;
  return <CategoryView lang={p.lang as Lang} id={p.id} />;
}
