import GuidesView, { guidesMeta } from '@/views/Guides';

export const metadata = guidesMeta('fr');

export default function Page() {
  return <GuidesView lang="fr" />;
}
