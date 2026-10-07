/**
 * Where the API lives. Inlined at build time: a change only takes effect on
 * the next `npm run build`. The local default matches `npm run dev` in ../backend.
 */
const RAW = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export const API_URL = RAW.trim().replace(/\/+$/, '');

/** Absolute URL for an API path: apiUrl('/api/orders'). */
export const apiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
