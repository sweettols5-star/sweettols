import { FaqView, faqMeta } from '@/views/Info';

export const metadata = faqMeta('fr');

export default function Page() {
  return <FaqView lang="fr" />;
}
