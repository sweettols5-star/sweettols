/** Fixed identity of the shop. Contacts and delivery zones come from the API settings. */
export const site = {
  brand: 'SWEETTOOLS',
  baseline: 'Outils et matériel de pâtisserie & cake design',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://sweettools.ma').replace(/\/+$/, ''),
  locale: 'fr_MA',
};
