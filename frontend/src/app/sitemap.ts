import type { MetadataRoute } from 'next';
import { GUIDES } from '@/data/guides';
import { LANGS } from '@/i18n';
import { categories, products, productsIn } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { abs, languages } from '@/lib/seo';

// Static export: written once to out/sitemap.xml from the build snapshot.
export const dynamic = 'force-static';

type Freq = 'weekly' | 'monthly' | 'yearly';

/**
 * Every indexable page, in French, English and Arabic, each entry listing its
 * two translations (hreflang) so Google treats them as one page in three
 * languages. Left out: cart, checkout and the product fallback (noindex), the
 * admin, and empty categories — a page that only says « bientôt » is not worth
 * Google's time until it holds products.
 * No lastModified: the catalogue has no reliable edit date, and a made-up one
 * teaches Google to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<[string, Freq, number]> = [
    [routes.home, 'weekly', 1],
    [routes.shop, 'weekly', 0.9],
    ...categories
      .filter((c) => productsIn(c.id).length)
      .map((c): [string, Freq, number] => [routes.category(c.id), 'weekly', 0.8]),
    ...products.map((p): [string, Freq, number] => [routes.product(p.slug), 'weekly', 0.7]),
    [routes.guides, 'monthly', 0.5],
    ...GUIDES.map((g): [string, Freq, number] => [routes.guide(g.slug), 'monthly', 0.5]),
    [routes.delivery, 'monthly', 0.4],
    [routes.faq, 'monthly', 0.4],
    [routes.contact, 'yearly', 0.3],
  ];

  return pages.flatMap(([path, changeFrequency, priority]) =>
    LANGS.map((lang) => ({
      url: abs(lang, path),
      changeFrequency,
      priority,
      alternates: { languages: languages(path) },
    })),
  );
}
