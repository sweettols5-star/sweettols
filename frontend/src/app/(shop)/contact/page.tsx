import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import Link from '@/components/Link';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Contact',
  description:
    'Une question sur un moule, une taille ou une commande ? Contactez SweetTools, matériel de pâtisserie livré partout au Maroc.',
  path: routes.contact,
});

export default function ContactPage() {
  return (
    <div className="container section narrow">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <header className="page-head">
        <h1 className="page-title">Contactez-nous</h1>
        <p>
          Une question sur un produit, une dimension ou votre commande ? Nous vous répondons rapidement. Pour suivre une
          commande, donnez-nous sa référence (ex. ST-…).
        </p>
      </header>
      <ContactInfo />
      <ContactForm />
      <p className="contact-foot">
        Vous cherchez les frais et délais ? Consultez la page <Link href={routes.delivery}>livraison & paiement</Link>.
      </p>
    </div>
  );
}
