import type { Metadata, Viewport } from 'next';
import { site } from '@/config/site';
import { getDict, LANGS, localePath, OG_LOCALE, type Lang } from '@/i18n';

/** Absolute URL of a page in a language: abs('en', '/boutique/'). */
export const abs = (lang: Lang, path: string) => `${site.url}${localePath(lang, path)}`;

/**
 * The page in every language, for <link rel="alternate" hreflang>: Google
 * shows each searcher the version in their language. French is the default.
 */
export function languages(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LANGS.map((l) => [l, abs(l, path)])),
    'x-default': abs('fr', path),
  };
}

/**
 * Per-page metadata: title, description, canonical, hreflang and Open Graph in
 * one call. `path` is the page's own URL, unprefixed, with its trailing slash
 * (« /boutique/ »); the language adds /en or /ar.
 */
export function pageMeta({
  lang,
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = abs(lang, path);
  const images = [{ url: image || '/og.jpg', width: image ? 1000 : 1200, height: image ? 1000 : 630 }];
  return {
    // A title that already names the shop skips the layout's « | brand » suffix.
    title: title.includes(site.brand) ? { absolute: title } : title,
    description,
    alternates: { canonical: url, ...(noindex ? {} : { languages: languages(path) }) },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[lang],
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

/** What every shop layout (French, English, Arabic) declares. */
export function layoutMeta(lang: Lang): Metadata {
  const t = getDict(lang);
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.brand} — ${t.meta.defaultTitle}`,
      template: `%s | ${site.brand}`,
    },
    description: t.meta.defaultDescription,
    applicationName: site.brand,
    formatDetection: { telephone: false },
    // Both stay: removing a token un-verifies that Google property.
    verification: {
      google: ['mKZuNJG6ikfZleiFIorasUEXq4QDofMIho0fQgCw3lQ', '55X9rqHWmIendLX5OEd5RzIvpUfbrJHS-b7NNpW7JF4'],
    },
    // Listing icons here replaces the app/icon.png convention, so every size is explicit.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/brand/emblem.png', type: 'image/png', sizes: '256x256' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export const shopViewport: Viewport = {
  themeColor: '#c45ab3',
  width: 'device-width',
  initialScale: 1,
};

/** Trims to ~155 characters on a word boundary, for meta descriptions. */
export function excerpt(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '')}…`;
}
