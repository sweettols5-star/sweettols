import Breadcrumbs from '@/components/Breadcrumbs';
import FaqList, { faqJsonLd } from '@/components/FaqList';
import JsonLd from '@/components/JsonLd';
import Link from '@/components/Link';
import { FAQ } from '@/data/faq';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Questions fréquentes (FAQ)',
  description:
    'Commande, paiement à la livraison, frais et délais, entretien des moules en silicone : toutes les réponses aux questions fréquentes sur SweetTools.',
  path: routes.faq,
});

export default function FaqPage() {
  return (
    <div className="container section narrow">
      <Breadcrumbs items={[{ label: 'Questions fréquentes' }]} />
      <header className="page-head">
        <h1 className="page-title">Questions fréquentes</h1>
        <p>Commande, livraison, paiement et utilisation de vos outils : les réponses aux questions qu’on nous pose le plus.</p>
      </header>

      <nav className="chips" aria-label="Thèmes">
        {FAQ.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="chip">
            {g.title}
          </a>
        ))}
      </nav>

      {FAQ.map((g) => (
        <section key={g.id} id={g.id} className="faq-group">
          <h2>{g.title}</h2>
          <FaqList items={g.items} />
        </section>
      ))}

      <div className="band band--soft">
        <div className="band__text">
          <h2>Vous ne trouvez pas votre réponse ?</h2>
          <p>Écrivez-nous : on vous répond rapidement.</p>
        </div>
        <Link href={routes.contact} className="btn btn--primary">
          Nous contacter
        </Link>
      </div>

      <JsonLd data={faqJsonLd(FAQ.flatMap((g) => g.items))} />
    </div>
  );
}
