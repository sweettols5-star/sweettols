import { GuideView, guideMeta, guideParams } from '@/views/Guides';

export const dynamicParams = false;
export const generateStaticParams = guideParams;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return guideMeta('fr', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <GuideView lang="fr" slug={(await params).slug} />;
}
