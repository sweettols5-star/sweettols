import type { Lang } from '@/i18n';
import { FaqView, faqMeta } from '@/views/Info';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return faqMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <FaqView lang={(await params).lang as Lang} />;
}
