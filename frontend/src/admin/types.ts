import type { ProductImage, Settings } from '@/types';

/** A product as /api/admin/products returns it — with stock and visibility. */
export type AdminProduct = {
  slug: string;
  name: string;
  categoryId: string;
  price: number;
  compareAtPrice: number;
  description: string;
  details: string[];
  images: ProductImage[];
  /** null = not tracked (always orderable). */
  stock: number | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  description: string;
  order: number;
  image: string;
  productCount: number;
};

export type OrderStatus = 'nouvelle' | 'confirmee' | 'expediee' | 'livree' | 'annulee';

export type Order = {
  reference: string;
  customer: { name: string; phone: string; city: string; address: string; notes: string };
  zone: { id: string; label: string };
  items: Array<{
    slug: string;
    name: string;
    image: string;
    qty: number;
    price: number;
    lineTotal: number;
    /** Price the customer's cart showed, when it differed from the database. */
    cartPrice?: number;
  }>;
  subtotal: number;
  shipping: number;
  /** Set when the customer asked for an invoice (+10 % of the products). */
  invoice?: { company: string; ice: string } | null;
  invoiceFee?: number;
  total: number;
  payment: 'cod';
  status: OrderStatus;
  history: Array<{ status: OrderStatus; at: string }>;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  text: string;
  read: boolean;
  createdAt: string;
};

export type Dashboard = {
  toProcess: number;
  unreadMessages: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  last30: { orders: number; revenue: number };
  products: { total: number; active: number; withoutPrice: number; outOfStock: number; withoutImage: number };
  latest: Order[];
};

export type { Settings };
