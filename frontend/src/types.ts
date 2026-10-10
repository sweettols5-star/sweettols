export type ProductImage = { url: string; thumb: string };

/**
 * English / Arabic versions of some text fields, edited in /admin. Every field
 * is optional: a missing one falls back to the French field (i18n/content.ts).
 */
export type Translations<T> = { en?: Partial<T>; ar?: Partial<T> };

export type Product = {
  slug: string;
  name: string;
  categoryId: string;
  /** Whole dirhams. 0 = « prix à venir » : shown, never orderable. */
  price: number;
  compareAtPrice: number;
  description: string;
  details: string[];
  i18n?: Translations<{ name: string; description: string; details: string[] }>;
  images: ProductImage[];
  featured: boolean;
  inStock: boolean;
  /** Units left when 1 to 3, else 0. */
  lowStock: number;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  i18n?: Translations<{ name: string; description: string }>;
  order: number;
  image: string;
};

export type Zone = {
  id: string;
  label: string;
  fee: number;
  delay: string;
  i18n?: Translations<{ label: string; delay: string }>;
};

export type Settings = {
  brand: string;
  baseline: string;
  url: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  announcement: string;
  freeShippingThreshold: number;
  /** Minimum order in DH, delivery included (invoice VAT not). 0 = none. */
  minOrder?: number;
  zones: Zone[];
  /** Home page bundles, edited in /admin/kits. Absent from snapshots built before kits moved to the API. */
  kits?: Kit[];
  i18n?: Translations<{ baseline: string; announcement: string }>;
};

/**
 * Ready-made kit: a few products that go together, added to the cart in one
 * click. The price shown is the live sum of the products — no invented
 * discount. Unpriced or sold-out products are skipped, never added at 0 DH.
 */
export type Kit = {
  id: string;
  title: string;
  pitch: string;
  slugs: string[];
  i18n?: Translations<{ title: string; pitch: string }>;
};

export type Catalogue = {
  products: Product[];
  categories: Category[];
  settings: Settings;
  generatedAt?: string;
};
