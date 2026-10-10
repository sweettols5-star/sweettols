'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { localePath } from '@/i18n/config';
import { useLang } from './LangProvider';

type Props = ComponentProps<typeof NextLink>;

/**
 * next/link with two shop defaults:
 *
 * - Prefetch OFF. In a static export there is no RSC payload to prefetch, so
 *   every prefetch fires a request for `/…/__next.<hash>.txt?_rsc=…` that
 *   404s, floods the console and counts against Lighthouse. A static site
 *   navigates instantly anyway.
 * - Internal paths follow the page's language: callers write routes.shop
 *   (« /boutique/ ») and get « /en/boutique/ » on an English page.
 */
export default function Link({ prefetch = false, href, ...rest }: Props) {
  const lang = useLang();
  const to = typeof href === 'string' ? localePath(lang, href) : href;
  return <NextLink prefetch={prefetch} href={to} {...rest} />;
}
