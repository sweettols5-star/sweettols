import Breadcrumbs from '@/components/Breadcrumbs';
import GuideCards from '@/components/GuideCards';
import { GUIDES } from '@/data/guides';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Conseils & astuces de pâtisserie',
  description:
    'Guides pratiques pour bien utiliser vos outils : moules en silicone, macarons, pâte à sucre, décors moulés. Les gestes simples pour réussir vos gâteaux.',
  path: routes.guides,
});

export default function GuidesPage() {
  return (
    <div className="container section">
      <Breadcrumbs items={[{ label: 'Conseils & astuces' }]} />
      <header className="page-head">
        <h1 className="page-title">Conseils & astuces</h1>
        <p>Les bons gestes pour tirer le meilleur de vos outils, expliqués simplement.</p>
      </header>
      <GuideCards guides={GUIDES} />
    </div>
  );
}
