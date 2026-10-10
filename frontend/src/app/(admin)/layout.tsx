import type { ReactNode } from 'react';
import { fontClass } from '@/lib/fonts';
import '@/styles/globals.css';

/**
 * Root layout of the back office. The shop has its own roots ((fr) and
 * [lang]), so each side owns its <html>; the admin is French only.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={fontClass}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
