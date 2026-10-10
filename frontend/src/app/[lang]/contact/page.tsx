import type { Lang } from '@/i18n';
import { ContactView, contactMeta } from '@/views/Info';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  return contactMeta((await params).lang as Lang);
}

export default async function Page({ params }: Props) {
  return <ContactView lang={(await params).lang as Lang} />;
}
