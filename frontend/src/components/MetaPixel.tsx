'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PIXEL_ID = '1430716852354633';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Sends a standard event (AddToCart, Purchase…); a no-op when the pixel is blocked. Prices are in dirhams. */
export function trackPixel(event: string, data: Record<string, unknown>, eventID?: string) {
  window.fbq?.('track', event, { currency: 'MAD', ...data }, eventID ? { eventID } : undefined);
}

/**
 * Meta (Facebook) Pixel. The snippet counts the first page view; client-side
 * navigations don't reload the page, so each later pathname change sends its
 * own PageView. Shop pages only — the admin layout doesn't render this.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(pathname);

  useEffect(() => {
    if (pathname === first.current) return;
    first.current = pathname;
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
