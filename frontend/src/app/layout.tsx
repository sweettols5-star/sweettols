import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/config/site';
import { fontClass } from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — Matériel de pâtisserie & cake design au Maroc`,
    template: `%s | ${site.brand}`,
  },
  description:
    'Moules en silicone, tapis de cuisson, spatules, emporte-pièces et outils de cake design. Paiement à la livraison partout au Maroc.',
  applicationName: site.brand,
  formatDetection: { telephone: false },
  verification: { google: 'mKZuNJG6ikfZleiFIorasUEXq4QDofMIho0fQgCw3lQ' },
  // Listing icons here replaces the app/icon.png convention, so every size is explicit.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/brand/emblem.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#c45ab3',
  width: 'device-width',
  initialScale: 1,
};

/**
 * The single root layout. The shop chrome (header, cart…) lives in the
 * (shop) group so the admin can have its own shell under the same <html>.
 * Font variable classes sit on <html>: the tokens in globals.css are declared
 * on :root and resolve there.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={fontClass}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
