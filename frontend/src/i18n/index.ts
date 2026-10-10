import type { Lang } from './config';
import ar from './ar';
import en from './en';
import fr, { type Dict } from './fr';

const DICTS: Record<Lang, Dict> = { fr, en, ar };

/** Interface texts of a language (server components; client ones use useT()). */
export const getDict = (lang: Lang): Dict => DICTS[lang] ?? fr;

export type { Dict };
export * from './config';
