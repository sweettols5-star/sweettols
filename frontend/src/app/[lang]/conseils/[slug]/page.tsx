import type { Lang } from '@/i18n';
import { GuideView, guideMeta, guideParams } from '@/views/Guides';

export const dynamicParams = false;
export const generateStaticParams = guideParams;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await params;
  return guideMeta(p.lang as Lang, p.slug);
}

export default async function Page({ params }: Props) {
  const p = await params;
  return <GuideView lang={p.lang as Lang} slug={p.slug} />;
}
