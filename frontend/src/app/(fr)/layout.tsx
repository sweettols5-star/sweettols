import type { ReactNode } from 'react';
import { layoutMeta, shopViewport } from '@/lib/seo';
import ShopRoot from '@/views/ShopRoot';

/** French pages: the original, unprefixed addresses (/boutique/). */
export const metadata = layoutMeta('fr');
export const viewport = shopViewport;

export default function FrenchLayout({ children }: { children: ReactNode }) {
  return <ShopRoot lang="fr">{children}</ShopRoot>;
}
