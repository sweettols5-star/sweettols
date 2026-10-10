/** The text pages: FAQ, delivery, contact. */
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import DeliveryInfo from '@/components/DeliveryInfo';
import FaqList, { faqJsonLd } from '@/components/FaqList';
import JsonLd from '@/components/JsonLd';
import Link from '@/components/Link';
import { faqFor } from '@/data/faq';
import { getDict, type Lang } from '@/i18n';
import { rich } from '@/i18n/rich';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export function faqMeta(lang: Lang) {
  const t = getDict(lang).pages.faq;
  return pageMeta({ lang, title: t.title, description: t.description, path: routes.faq });
}

export function FaqView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.faq;
  const faq = faqFor(lang);
  return (
    <div className="container section narrow">
      <Breadcrumbs lang={lang} items={[{ label: t.crumb }]} />
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p>{t.intro}</p>
      </header>

      <nav className="chips" aria-label={t.themes}>
        {faq.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="chip">
            {g.title}
          </a>
        ))}
      </nav>

      {faq.map((g) => (
        <section key={g.id} id={g.id} className="faq-group">
          <h2>{g.title}</h2>
          <FaqList items={g.items} />
        </section>
      ))}

      <div className="band band--soft">
        <div className="band__text">
          <h2>{t.notFoundTitle}</h2>
          <p>{t.notFoundText}</p>
        </div>
        <Link href={routes.contact} className="btn btn--primary">
          {t.contactUs}
        </Link>
      </div>

      <JsonLd data={faqJsonLd(faq.flatMap((g) => g.items))} />
    </div>
  );
}

export function deliveryMeta(lang: Lang) {
  const t = getDict(lang).pages.delivery;
  return pageMeta({ lang, title: t.title, description: t.description, path: routes.delivery });
}

export function DeliveryView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.delivery;
  return (
    <div className="container section narrow">
      <Breadcrumbs lang={lang} items={[{ label: t.crumb }]} />
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p>{t.intro}</p>
      </header>

      <section className="prose">
        <h2>{t.feesTitle}</h2>
        <DeliveryInfo />

        <h2>{t.howTitle}</h2>
        <ol className="howto">
          {t.steps.map((s) => (
            <li key={s.strong}>
              <strong>{s.strong}</strong>
              {s.text}
            </li>
          ))}
        </ol>

        <h2>{t.faqTitle}</h2>
        <FaqList items={faqFor(lang)[1].items} />

        <p>
          {rich(t.more, {
            faq: <Link href={routes.faq}>{t.moreFaq}</Link>,
            contact: <Link href={routes.contact}>{t.moreContact}</Link>,
          })}
        </p>
      </section>
    </div>
  );
}

export function contactMeta(lang: Lang) {
  const t = getDict(lang).pages.contact;
  return pageMeta({ lang, title: t.title, description: t.description, path: routes.contact });
}

export function ContactView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.contact;
  return (
    <div className="container section narrow">
      <Breadcrumbs lang={lang} items={[{ label: t.crumb }]} />
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p>{t.intro}</p>
      </header>
      <ContactInfo />
      <ContactForm />
      <p className="contact-foot">{rich(t.foot, { link: <Link href={routes.delivery}>{t.footLink}</Link> })}</p>
    </div>
  );
}
