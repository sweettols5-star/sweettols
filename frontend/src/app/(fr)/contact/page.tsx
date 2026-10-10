import { ContactView, contactMeta } from '@/views/Info';

export const metadata = contactMeta('fr');

export default function Page() {
  return <ContactView lang="fr" />;
}
