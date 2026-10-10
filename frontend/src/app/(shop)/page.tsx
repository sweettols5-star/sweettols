import BestSellers from '@/components/BestSellers';
import FaqList from '@/components/FaqList';
import GuideCards from '@/components/GuideCards';
import HowToOrder from '@/components/HowToOrder';
import KitCard from '@/components/KitCard';
import { HOME_FAQ } from '@/data/faq';
import { GUIDES } from '@/data/guides';
import { KITS } from '@/data/kits';
import HomeCategories from '@/components/HomeCategories';
import { IconArrow, IconCash, IconChat, IconTruck, IconWhisk } from '@/components/Icons';
import JsonLd from '@/components/JsonLd';
import Link from '@/components/Link';
import { site } from '@/config/site';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: `${site.brand} — Matériel de pâtisserie & cake design au Maroc`,
  description:
    'Moules en silicone, tapis de cuisson et à macarons, spatules, emporte-pièces et outils de cake design. Paiement à la livraison partout au Maroc.',
  path: '/',
});

const PROMISES = [
  { Icon: IconWhisk, title: 'Sélection pâtissière', text: 'Des outils choisis pour le cake design et la pâtisserie maison.' },
  { Icon: IconCash, title: 'Paiement à la livraison', text: 'Vous payez en espèces à la réception du colis.' },
  { Icon: IconTruck, title: 'Livraison partout au Maroc', text: 'Casablanca en 24 à 48 h, les autres villes en quelques jours.' },
  { Icon: IconChat, title: 'Conseil avant achat', text: 'Une question sur un moule ou une taille ? On vous répond.' },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'OnlineStore',
          name: site.brand,
          url: site.url,
          logo: `${site.url}/brand/logo-512.png`,
          description: site.baseline,
          areaServed: { '@type': 'Country', name: 'Maroc' },
          paymentAccepted: 'Cash',
          currenciesAccepted: 'MAD',
        }}
      />

      <section className="hero">
        {/* Full-width photo like the mockup: the cake on the right, the headline on the
            plain left side. Phones get a tighter crop above the text.
            Source + licence: public/hero/CREDITS.md, rebuilt by scripts/prepare-hero.mjs. */}
        <picture className="hero__photo">
          <source media="(max-width: 900px)" srcSet="/hero/hero-mobile.webp" width={900} height={750} />
          <img
            src="/hero/hero-1600.webp"
            srcSet="/hero/hero-1600.webp 1600w, /hero/hero-2400.webp 2400w"
            sizes="100vw"
            alt="Gâteau crème décoré de fleurs en sucre violettes, macarons, moule en silicone cœur et fouets sur un plan en marbre"
            width={1600}
            height={656}
            fetchPriority="high"
          />
        </picture>
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="eyebrow">SweetTools</p>
            <h1>
              Tout pour créer <em>avec élégance.</em>
            </h1>
            <p className="hero__lead">
              Outils et matériel de pâtisserie & cake design, sélectionnés pour les passionnés comme pour les pros.
            </p>
            <div className="hero__cta">
              <Link href={routes.shop} className="btn btn--primary btn--lg">
                Découvrir la boutique <IconArrow width={18} height={18} />
              </Link>
              <Link href={routes.delivery} className="btn btn--ghost btn--lg">
                Livraison & paiement
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="promises">
        <div className="container promises__grid">
          {PROMISES.map(({ Icon, title, text }) => (
            <div key={title} className="promise">
              <span className="promise__icon">
                <Icon />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">Nos catégories</h2>
            <p className="section__sub">Tout ce qu’il vous faut, au même endroit.</p>
          </div>
          <Link href={routes.shop} className="link-arrow">
            Toute la boutique →
          </Link>
        </div>
        <HomeCategories />
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">Nos coups de cœur</h2>
            <p className="section__sub">Les indispensables de l’atelier, prêts à être livrés.</p>
          </div>
          <Link href={routes.shop} className="link-arrow">
            Voir tout →
          </Link>
        </div>
        <BestSellers />
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">Kits prêts à l’emploi</h2>
            <p className="section__sub">Les outils qui vont ensemble, ajoutés au panier en un clic.</p>
          </div>
        </div>
        <div className="kits">
          {KITS.map((k) => (
            <KitCard key={k.id} kit={k} />
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section__head section__head--center">
            <div>
              <h2 className="section__title">Comment commander ?</h2>
              <p className="section__sub">Simple, sans compte et sans carte bancaire.</p>
            </div>
          </div>
          <HowToOrder />
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">Conseils & astuces</h2>
            <p className="section__sub">Les bons gestes pour réussir avec vos outils.</p>
          </div>
          <Link href={routes.guides} className="link-arrow">
            Tous les conseils →
          </Link>
        </div>
        <GuideCards guides={GUIDES.slice(0, 3)} />
      </section>

      <section className="section container home-faq">
        <div className="home-faq__intro">
          <h2 className="section__title">Questions fréquentes</h2>
          <p className="section__sub">Paiement, livraison, utilisation : l’essentiel avant de commander.</p>
          <Link href={routes.faq} className="btn btn--ghost">
            Toutes les questions
          </Link>
        </div>
        <FaqList items={HOME_FAQ} />
      </section>

      <section className="section container">
        <div className="band">
          <img src="/brand/logo-256.webp" alt="" width={96} height={96} className="band__mark" />
          <div className="band__text">
            <h2>Une question avant de commander ?</h2>
            <p>Taille d’un moule, nombre d’empreintes, délai de livraison : écrivez-nous, on vous répond rapidement.</p>
          </div>
          <Link href={routes.contact} className="btn btn--light">
            Nous contacter
          </Link>
        </div>
      </section>
    </>
  );
}
