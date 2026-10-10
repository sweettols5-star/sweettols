'use client';

import { rich } from '@/i18n/rich';
import { routes } from '@/lib/routes';
import { useT } from './LangProvider';
import Link from './Link';
import { useSettings } from './LiveCatalogue';

/**
 * Minimum order amount from the settings, delivery included (same rule as the
 * API, backend/src/lib/order.js). 0 = no minimum. `delivery`: the chosen
 * zone's fee, or the cheapest one before the customer has picked a city.
 */
export function useMinOrder(subtotal: number, delivery: number) {
  const min = useSettings().minOrder ?? 0;
  const total = subtotal + delivery;
  const missing = min > 0 ? Math.max(0, min - total) : 0;
  return { min, total, missing, blocked: missing > 0 };
}

/**
 * Shown in the cart and at checkout while products + delivery are under the
 * minimum: what is missing, a progress bar, and a way back to the shop.
 */
export default function MinOrderNotice({ subtotal, delivery }: { subtotal: number; delivery: number }) {
  const { min, total, missing, blocked } = useMinOrder(subtotal, delivery);
  const t = useT();
  if (!blocked) return null;
  const pct = Math.min(100, Math.round((total / min) * 100));
  return (
    <div className="minorder" role="status">
      <p>{rich(t.minOrder.notice, { min: <strong>{t.dh(min)}</strong>, missing: <strong>{t.dh(missing)}</strong> })}</p>
      <div className="minorder__bar" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
      <Link href={routes.shop} className="minorder__link">
        {t.minOrder.continue}
      </Link>
    </div>
  );
}
