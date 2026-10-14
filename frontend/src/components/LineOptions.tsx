'use client';

import { colorName } from '@/i18n/content';
import type { Product } from '@/types';
import { useLang, useT } from './LangProvider';

/** "Rose · 20 cm" — the options of a cart or order line, in the shopper's language. */
export function useOptionsLabel() {
  const lang = useLang();
  const t = useT();
  return (product: Product | undefined, color?: string, size?: string) =>
    [color && (product ? colorName(product, color, lang) : color), size && t.product.cm(size)].filter(Boolean).join(' · ');
}
