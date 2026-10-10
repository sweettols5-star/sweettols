import type { ReactNode } from 'react';
import { PREFIXED, type Lang } from '@/i18n';
import { layoutMeta, shopViewport } from '@/lib/seo';
import ShopRoot from '@/views/ShopRoot';

/** English and Arabic pages, under /en/ and /ar/. Nothing else is built here. */
export const dynamicParams = false;
export const generateStaticParams = () => PREFIXED.map((lang) => ({ lang }));
export const viewport = shopViewport;

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Omit<Props, 'children'>) {
  return layoutMeta((await params).lang as Lang);
}

export default async function LangLayout({ children, params }: Props) {
  return <ShopRoot lang={(await params).lang as Lang}>{children}</ShopRoot>;
}
