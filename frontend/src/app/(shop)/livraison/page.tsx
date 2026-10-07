import Breadcrumbs from '@/components/Breadcrumbs';
import DeliveryInfo from '@/components/DeliveryInfo';
import FaqList from '@/components/FaqList';
import { FAQ } from '@/data/faq';
import Link from '@/components/Link';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Livraison & paiement à la livraison',
  description:
    'Livraison partout au Maroc et paiement en espèces à la réception. Délais, frais par ville et déroulement d’une commande SweetTools.',
  path: routes.delivery,
});

export default function DeliveryPage() {
  return (
    <div className="container section narrow">
      <Breadcrumbs items={[{ label: 'Livraison & paiement' }]} />
      <header className="page-head">
        <h1 className="page-title">Livraison & paiement</h1>
        <p>Nous livrons partout au Maroc. Vous payez en espèces à la réception, sans avance.</p>
      </header>

      <section className="prose">
        <h2>Frais et délais</h2>
        <DeliveryInfo />

        <h2>Comment ça se passe</h2>
        <ol className="howto">
          <li>
            <strong>Vous commandez</strong> sur le site : panier, adresse, zone de livraison.
          </li>
          <li>
            <strong>Nous vous appelons</strong> pour confirmer la commande.
          </li>
          <li>
            <strong>Le colis part</strong> et arrive dans le délai de votre zone.
          </li>
          <li>
            <strong>Vous payez</strong> en espèces au livreur.
          </li>
        </ol>

        <h2>Questions fréquentes</h2>
        <FaqList items={FAQ[1].items} />

        <p>
          Toutes les réponses sont dans nos <Link href={routes.faq}>questions fréquentes</Link>. Une autre question ?{' '}
          <Link href={routes.contact}>Contactez-nous</Link>.
        </p>
      </section>

    </div>
  );
}
