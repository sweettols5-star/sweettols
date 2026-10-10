export type ProductImage = { url: string; thumb: string };

export type Product = {
  slug: string;
  name: string;
  categoryId: string;
  /** Whole dirhams. 0 = « prix à venir » : shown, never orderable. */
  price: number;
  compareAtPrice: number;
  description: string;
  details: string[];
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
  order: number;
  image: string;
};

export type Zone = { id: string; label: string; fee: number; delay: string };

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
  /** Minimum products total to order, in DH (delivery not counted). 0 = none. */
  minOrder?: number;
  zones: Zone[];
  /** Home page bundles, edited in /admin/kits. Absent from snapshots built before kits moved to the API. */
  kits?: Kit[];
};

/**
 * Ready-made kit: a few products that go together, added to the cart in one
 * click. The price shown is the live sum of the products — no invented
 * discount. Unpriced or sold-out products are skipped, never added at 0 DH.
 */
export type Kit = { id: string; title: string; pitch: string; slugs: string[] };

export type Catalogue = {
  products: Product[];
  categories: Category[];
  settings: Settings;
  generatedAt?: string;
};
