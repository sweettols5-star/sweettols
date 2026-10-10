import { site } from '@/config/site';
import { categoryById, products } from '@/lib/catalogue';
import { routes } from '@/lib/routes';
import { abs } from '@/lib/seo';

// Static export: written once to out/merchant-feed.xml from the build snapshot.
export const dynamic = 'force-static';

/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace), fetched by
 * Google on a schedule — « Add products from a file → Scheduled fetch ».
 * Target: Morocco, French. Only priced products: Google rejects a price of 0.
 * Delivery fees are set in Merchant Center (they depend on the city), not here.
 */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const absUrl = (u: string) => (u.startsWith('http') ? u : `${site.url}${u}`);

export function GET() {
  const items = products
    .filter((p) => p.price > 0)
    .map((p) => {
      const [main, ...more] = p.images;
      const category = categoryById(p.categoryId);
      const sale = p.compareAtPrice > p.price;
      const description = [p.description, ...p.details].filter(Boolean).join(' — ') || p.name;
      return [
        '<item>',
        `<g:id>${esc(p.slug)}</g:id>`,
        `<g:title>${esc(p.name)}</g:title>`,
        `<g:description>${esc(description.slice(0, 5000))}</g:description>`,
        `<g:link>${esc(abs('fr', routes.product(p.slug)))}</g:link>`,
        main ? `<g:image_link>${esc(absUrl(main.url))}</g:image_link>` : '',
        ...more.slice(0, 10).map((i) => `<g:additional_image_link>${esc(absUrl(i.url))}</g:additional_image_link>`),
        `<g:availability>${p.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>`,
        // A struck-through price is the regular one; the current price is the sale price.
        `<g:price>${(sale ? p.compareAtPrice : p.price).toFixed(2)} MAD</g:price>`,
        sale ? `<g:sale_price>${p.price.toFixed(2)} MAD</g:sale_price>` : '',
        '<g:condition>new</g:condition>',
        `<g:brand>${esc(site.brand)}</g:brand>`,
        // Shop-made listings: no GTIN / manufacturer part number.
        '<g:identifier_exists>no</g:identifier_exists>',
        category ? `<g:product_type>${esc(category.name)}</g:product_type>` : '',
        '</item>',
      ]
        .filter(Boolean)
        .join('\n');
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(site.brand)}</title>
<link>${site.url}/</link>
<description>${esc(site.baseline)}</description>
${items.join('\n')}
</channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
