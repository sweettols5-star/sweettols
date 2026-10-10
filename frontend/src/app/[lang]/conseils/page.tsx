import type { Lang } from '@/i18n';
import GuidesView, { guidesMeta } from '@/views/Guides';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return guidesMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <GuidesView lang={(await params).lang as Lang} />;
}
