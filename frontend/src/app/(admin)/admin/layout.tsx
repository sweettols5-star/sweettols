import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/admin.css';

/**
 * The back office sits outside the (shop) group: no shop header, footer, cart
 * or WhatsApp button. Its pages are client-only and read everything from the
 * API once the owner has signed in, so their static HTML holds no data.
 */
export const metadata: Metadata = {
  title: { absolute: 'Administration — SweetTools' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
