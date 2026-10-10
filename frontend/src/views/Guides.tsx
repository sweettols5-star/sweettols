import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import GuideCards from '@/components/GuideCards';
import { IconCheck } from '@/components/Icons';
import JsonLd from '@/components/JsonLd';
import ProductPicks from '@/components/ProductPicks';
import { site } from '@/config/site';
import { GUIDES, guideBySlug, guidesFor } from '@/data/guides';
import { getDict, type Lang } from '@/i18n';
import { locProduct } from '@/i18n/content';
import { products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { abs, pageMeta } from '@/lib/seo';

export function guidesMeta(lang: Lang) {
  const t = getDict(lang).pages.guides;
  return pageMeta({ lang, title: t.title, description: t.description, path: routes.guides });
}

export default function GuidesView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.guides;
  return (
    <div className="container section">
      <Breadcrumbs lang={lang} items={[{ label: t.crumb }]} />
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p>{t.intro}</p>
      </header>
      <GuideCards guides={guidesFor(lang)} lang={lang} />
    </div>
  );
}

export const guideParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export function guideMeta(lang: Lang, slug: string) {
  const g = guideBySlug(lang, slug);
  if (!g) return {};
  return pageMeta({ lang, title: g.title, description: g.summary, path: routes.guide(g.slug), image: g.cover.replace('-thumb', '') });
}

export function GuideView({ lang, slug }: { lang: Lang; slug: string }) {
  const guide = guideBySlug(lang, slug);
  if (!guide) notFound();
  const t = getDict(lang);
  const others = guidesFor(lang)
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);
  const picks = products.filter((p) => guide.products.includes(p.slug)).map((p) => locProduct(p, lang));

  return (
    <>
      <article className="container section narrow guide">
        <Breadcrumbs lang={lang} items={[{ label: t.pages.guides.crumb, href: routes.guides }, { label: guide.title }]} />
        <header className="page-head">
          <span className="eyebrow">{t.guides.meta(guide.minutes)}</span>
          <h1 className="page-title">{guide.title}</h1>
          <p className="guide__lead">{guide.summary}</p>
        </header>

        <div className="prose">
          {guide.body.map((b, i) => {
            if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>;
            if (b.type === 'p') return <p key={i}>{b.text}</p>;
            if (b.type === 'steps')
              return (
                <ol key={i} className="guide__steps">
                  {b.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              );
            return (
              <ul key={i} className="checks guide__tips">
                {b.items.map((s) => (
                  <li key={s}>
                    <IconCheck width={16} height={16} />
                    {s}
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </article>

      <section className="section container">
        <div className="section__head">
          <h2 className="section__title">{t.guides.materials}</h2>
        </div>
        <ProductPicks slugs={guide.products} fallback={picks} />
      </section>

      {others.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <h2 className="section__title">{t.guides.others}</h2>
          </div>
          <GuideCards guides={others} lang={lang} />
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.summary,
          image: `${site.url}${guide.cover.replace('-thumb', '')}`,
          inLanguage: lang,
          author: { '@type': 'Organization', name: site.brand },
          publisher: { '@type': 'Organization', name: site.brand, logo: { '@type': 'ImageObject', url: `${site.url}/brand/logo-512.png` } },
          mainEntityOfPage: abs(lang, routes.guide(guide.slug)),
        }}
      />
    </>
  );
}
