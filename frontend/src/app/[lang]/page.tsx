import type { Lang } from '@/i18n';
import HomeView, { homeMeta } from '@/views/Home';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return homeMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <HomeView lang={(await params).lang as Lang} />;
}
