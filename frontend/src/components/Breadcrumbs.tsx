import { getDict, type Lang } from '@/i18n';
import { abs } from '@/lib/seo';
import Link from './Link';

export type Crumb = { label: string; href?: string };

/** Visible trail + BreadcrumbList JSON-LD. The last crumb is the current page. */
export default function Breadcrumbs({ lang, items }: { lang: Lang; items: Crumb[] }) {
  const t = getDict(lang).crumbs;
  const all: Crumb[] = [{ label: t.home, href: '/' }, ...items];
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: abs(lang, c.href) } : {}),
    })),
  };
  return (
    <nav className="crumbs" aria-label={t.label}>
      <ol>
        {all.map((c, i) => (
          <li key={i}>
            {c.href && i < all.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
