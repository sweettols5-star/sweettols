import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import GuideCards from '@/components/GuideCards';
import { IconCheck } from '@/components/Icons';
import JsonLd from '@/components/JsonLd';
import ProductPicks from '@/components/ProductPicks';
import { site } from '@/config/site';
import { GUIDES, guideBySlug } from '@/data/guides';
import { products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return pageMeta({ title: g.title, description: g.summary, path: routes.guide(g.slug), image: g.cover.replace('-thumb', '') });
}

export default async function GuidePage({ params }: Props) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const picks = products.filter((p) => guide.products.includes(p.slug));

  return (
    <>
      <article className="container section narrow guide">
        <Breadcrumbs items={[{ label: 'Conseils & astuces', href: routes.guides }, { label: guide.title }]} />
        <header className="page-head">
          <span className="eyebrow">Conseil · {guide.minutes} min de lecture</span>
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
          <h2 className="section__title">Le matériel utilisé</h2>
        </div>
        <ProductPicks slugs={guide.products} fallback={picks} />
      </section>

      {others.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <h2 className="section__title">D’autres conseils</h2>
          </div>
          <GuideCards guides={others} />
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.summary,
          image: `${site.url}${guide.cover.replace('-thumb', '')}`,
          inLanguage: 'fr',
          author: { '@type': 'Organization', name: site.brand },
          publisher: { '@type': 'Organization', name: site.brand, logo: { '@type': 'ImageObject', url: `${site.url}/brand/emblem.png` } },
          mainEntityOfPage: `${site.url}${routes.guide(guide.slug)}`,
        }}
      />
    </>
  );
}
