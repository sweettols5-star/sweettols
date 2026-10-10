import CategoryView, { categoryMeta, categoryParams } from '@/views/Category';

export const dynamicParams = false;
export const generateStaticParams = categoryParams;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return categoryMeta('fr', (await params).id);
}

export default async function Page({ params }: Props) {
  return <CategoryView lang="fr" id={(await params).id} />;
}
