/**
 * The shop's languages. French is the base: its pages keep the original
 * addresses (/boutique/), English and Arabic live under /en/ and /ar/. The
 * admin is French only and never goes through any of this.
 */
export const LANGS = ['fr', 'en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

/** The prefixed languages: the values of the app/[lang] segment. */
export const PREFIXED: Exclude<Lang, 'fr'>[] = ['en', 'ar'];

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');

/** Name of each language in itself, for the switcher. */
export const LANG_NAMES: Record<Lang, string> = { fr: 'Français', en: 'English', ar: 'العربية' };
/** Short label in the header. */
export const LANG_SHORT: Record<Lang, string> = { fr: 'FR', en: 'EN', ar: 'ع' };

export const OG_LOCALE: Record<Lang, string> = { fr: 'fr_MA', en: 'en_US', ar: 'ar_MA' };

/** '/boutique/' in `lang`: '/boutique/', '/en/boutique/', '/ar/boutique/'. */
export function localePath(lang: Lang, path: string): string {
  if (lang === 'fr' || !path.startsWith('/') || path.startsWith('//')) return path;
  return `/${lang}${path}`;
}

/** The language of a pathname, and the pathname without its prefix. */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  const m = pathname.match(/^\/(en|ar)(\/.*|$)/);
  return m ? { lang: m[1] as Lang, path: m[2] || '/' } : { lang: 'fr', path: pathname || '/' };
}
