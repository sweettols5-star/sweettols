import BestSellers from '@/components/BestSellers';
import FaqList from '@/components/FaqList';
import GuideCards from '@/components/GuideCards';
import HomeCategories from '@/components/HomeCategories';
import HomeKits from '@/components/HomeKits';
import HowToOrder from '@/components/HowToOrder';
import { IconArrow, IconCash, IconChat, IconTruck, IconWhisk } from '@/components/Icons';
import JsonLd from '@/components/JsonLd';
import Link from '@/components/Link';
import { site } from '@/config/site';
import { homeFaq } from '@/data/faq';
import { guidesFor } from '@/data/guides';
import { getDict, type Lang } from '@/i18n';
import { rich } from '@/i18n/rich';
import { routes } from '@/lib/routes';
import { abs, pageMeta } from '@/lib/seo';

export function homeMeta(lang: Lang) {
  const t = getDict(lang).pages.home;
  return pageMeta({ lang, title: t.title, description: t.description, path: '/' });
}

const PROMISE_ICONS = [IconWhisk, IconCash, IconTruck, IconChat];

export default function HomeView({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const p = t.pages.home;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'OnlineStore',
          name: site.brand,
          url: abs(lang, '/'),
          logo: `${site.url}/brand/logo-512.png`,
          description: p.lead,
          inLanguage: lang,
          areaServed: { '@type': 'Country', name: t.country },
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
            alt={p.heroAlt}
            width={1600}
            height={656}
            fetchPriority="high"
          />
        </picture>
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="eyebrow">SWEETTOOLS</p>
            <h1>{rich(p.h1, { em: <em>{p.h1Em}</em> })}</h1>
            <p className="hero__lead">{p.lead}</p>
            <div className="hero__cta">
              <Link href={routes.shop} className="btn btn--primary btn--lg">
                {p.ctaShop} <IconArrow width={18} height={18} className="flip-rtl" />
              </Link>
              <Link href={routes.delivery} className="btn btn--ghost btn--lg">
                {p.ctaDelivery}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="promises">
        <div className="container promises__grid">
          {p.promises.map(({ title, text }, i) => {
            const Icon = PROMISE_ICONS[i];
            return (
              <div key={title} className="promise">
                <span className="promise__icon">
                  <Icon />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">{p.categoriesTitle}</h2>
            <p className="section__sub">{p.categoriesSub}</p>
          </div>
          <Link href={routes.shop} className="link-arrow">
            {p.allShop}
          </Link>
        </div>
        <HomeCategories />
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">{p.favTitle}</h2>
            <p className="section__sub">{p.favSub}</p>
          </div>
          <Link href={routes.shop} className="link-arrow">
            {p.seeAll}
          </Link>
        </div>
        <BestSellers />
      </section>

      <HomeKits />

      <section className="section section--tint">
        <div className="container">
          <div className="section__head section__head--center">
            <div>
              <h2 className="section__title">{p.howTitle}</h2>
              <p className="section__sub">{p.howSub}</p>
            </div>
          </div>
          <HowToOrder lang={lang} />
        </div>
      </section>

      <section className="section container">
        <div className="section__head">
          <div>
            <h2 className="section__title">{p.guidesTitle}</h2>
            <p className="section__sub">{p.guidesSub}</p>
          </div>
          <Link href={routes.guides} className="link-arrow">
            {p.allGuides}
          </Link>
        </div>
        <GuideCards guides={guidesFor(lang).slice(0, 3)} lang={lang} />
      </section>

      <section className="section container home-faq">
        <div className="home-faq__intro">
          <h2 className="section__title">{p.faqTitle}</h2>
          <p className="section__sub">{p.faqSub}</p>
          <Link href={routes.faq} className="btn btn--ghost">
            {p.allQuestions}
          </Link>
        </div>
        <FaqList items={homeFaq(lang)} />
      </section>

      <section className="section container">
        <div className="band">
          <img src="/brand/logo-256.webp" alt="" width={96} height={96} className="band__mark" />
          <div className="band__text">
            <h2>{p.bandTitle}</h2>
            <p>{p.bandText}</p>
          </div>
          <Link href={routes.contact} className="btn btn--light">
            {p.contactUs}
          </Link>
        </div>
      </section>
    </>
  );
}
