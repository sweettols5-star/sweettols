'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { getDict, type Dict, type Lang } from '@/i18n';

/**
 * The page's language, set once by its layout. Outside a provider (the admin)
 * the language is French, so shared components such as Link behave as before.
 */
const LangCtx = createContext<Lang>('fr');

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export const useLang = (): Lang => useContext(LangCtx);

/** Interface texts in the page's language. */
export const useT = (): Dict => getDict(useContext(LangCtx));
