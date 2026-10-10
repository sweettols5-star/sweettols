/** Cart and checkout: client-only screens, never indexed. */
import CartView from '@/components/CartView';
import CheckoutForm from '@/components/CheckoutForm';
import { site } from '@/config/site';
import { getDict, type Lang } from '@/i18n';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export function cartMeta(lang: Lang) {
  const t = getDict(lang);
  return pageMeta({
    lang,
    title: t.pages.cart.title,
    description: t.checkout.cartMetaDescription.replace('SWEETTOOLS', site.brand),
    path: routes.cart,
    noindex: true,
  });
}

export const CartPageView = () => <CartView />;

export function checkoutMeta(lang: Lang) {
  const t = getDict(lang).checkout;
  return pageMeta({ lang, title: t.metaTitle, description: t.metaDescription, path: routes.checkout, noindex: true });
}

export const CheckoutPageView = () => <CheckoutForm />;
