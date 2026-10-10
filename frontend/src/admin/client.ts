/**
 * Talking to the API from the back office.
 *
 * The token lives in localStorage because the shop and the API sit on two
 * different domains, where a cookie set by the API would never come back.
 * It expires after 12 h server-side; here we only decide when to show the
 * login screen again.
 */
import { apiUrl } from '@/config/api';

const KEY = 'sweettools.admin.token';
const EXPIRED = 'sweettools:admin-expired';

export const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export const setToken = (token: string) => {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    /* storage blocked: the session lasts this page view */
  }
};

export const clearToken = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export const onExpired = (handler: () => void) => {
  window.addEventListener(EXPIRED, handler);
  return () => window.removeEventListener(EXPIRED, handler);
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** FormData for /uploads: sent as-is so the browser sets the boundary. */
  form?: FormData;
  /** Login: no token, and a 401 means « wrong password », not « session expired ». */
  anonymous?: boolean;
  /** Password change: the API answers a wrong current password with 401 — not a reason to sign out. */
  keepSession?: boolean;
};

/**
 * Shortest time an action (anything but GET) shows its spinner. A local API
 * answers in ~70 ms: without this the owner never sees that anything happened.
 */
const MIN_ACTION_MS = 600;

const settle = async (method: string, started: number) => {
  const left = MIN_ACTION_MS - (Date.now() - started);
  if (method !== 'GET' && left > 0) await new Promise((r) => setTimeout(r, left));
};

/**
 * One request against the API. Throws an ApiError carrying the French message
 * the API sent — those are written for the shop owner and shown verbatim.
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body, form, anonymous = false, keepSession = false } = options;
  const token = anonymous ? '' : getToken();
  const started = Date.now();

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(form ? {} : { 'Content-Type': 'application/json' }),
      },
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch {
    await settle(method, started);
    throw new ApiError('Serveur injoignable. Vérifiez votre connexion (le serveur peut mettre une minute à se réveiller).', 0);
  }

  if (res.status === 401 && !anonymous && !keepSession) {
    clearToken();
    window.dispatchEvent(new Event(EXPIRED));
    throw new ApiError('Session expirée, reconnectez-vous.', 401);
  }
  if (res.status === 429) throw new ApiError('Trop de tentatives. Patientez une minute.', 429);

  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  await settle(method, started);
  if (!res.ok) throw new ApiError(data?.error || `Erreur ${res.status}`, res.status);
  return data as T;
}

/** Sends a photo to /api/admin/uploads; returns the full image and its thumbnail. */
export async function uploadPhoto(file: File, name = ''): Promise<{ url: string; thumb: string }> {
  const form = new FormData();
  form.append('file', file);
  if (name) form.append('name', name);
  const r = await api<{ url: string; thumbnail: string }>('/api/admin/uploads', { method: 'POST', form });
  return { url: r.url, thumb: r.thumbnail || r.url };
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Erreur inattendue.');
