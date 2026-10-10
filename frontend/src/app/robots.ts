import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { routes } from '@/lib/routes';

// Static export: written once to out/robots.txt.
export const dynamic = 'force-static';

/**
 * The admin, cart and checkout are private or empty for a crawler. They also
 * carry a noindex tag; blocking them here just saves crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', routes.cart, routes.checkout] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
