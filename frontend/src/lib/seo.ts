import type { Metadata } from 'next';
import { site } from '@/config/site';

/**
 * Per-page metadata: title, description, canonical and Open Graph in one call.
 * `path` is the page's own URL with its trailing slash (« /boutique/ »).
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${site.url}${path}`;
  const images = [{ url: image || '/og.jpg', width: image ? 1000 : 1200, height: image ? 1000 : 630 }];
  return {
    // A title that already names the shop skips the layout's « | brand » suffix.
    title: title.includes(site.brand) ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: site.brand,
      url,
      title,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Trims to ~155 characters on a word boundary, for meta descriptions. */
export function excerpt(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '')}…`;
}
