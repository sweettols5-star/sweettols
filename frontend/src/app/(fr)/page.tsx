import HomeView, { homeMeta } from '@/views/Home';

export const metadata = homeMeta('fr');

export default function Page() {
  return <HomeView lang="fr" />;
}
