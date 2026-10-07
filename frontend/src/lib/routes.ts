export const routes = {
  home: '/',
  shop: '/boutique/',
  category: (id: string) => `/categorie/${id}/`,
  product: (slug: string) => `/produit/${slug}/`,
  /** Products created after the last build have no page yet. */
  productFallback: (slug: string) => `/produit/?slug=${encodeURIComponent(slug)}`,
  cart: '/panier/',
  checkout: '/commande/',
  delivery: '/livraison/',
  contact: '/contact/',
  faq: '/faq/',
  guides: '/conseils/',
  guide: (slug: string) => `/conseils/${slug}/`,
};
