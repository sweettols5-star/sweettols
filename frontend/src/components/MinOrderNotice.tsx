'use client';

import { dh } from '@/lib/format';
import { routes } from '@/lib/routes';
import Link from './Link';
import { useSettings } from './LiveCatalogue';

/** Minimum order amount from the settings (products only, delivery not counted). 0 = no minimum. */
export function useMinOrder(subtotal: number) {
  const min = useSettings().minOrder ?? 0;
  const missing = min > 0 ? Math.max(0, min - subtotal) : 0;
  return { min, missing, blocked: missing > 0 };
}

/**
 * Shown in the cart and at checkout while the products total is under the
 * minimum: what is missing, a progress bar, and a way back to the shop.
 */
export default function MinOrderNotice({ subtotal }: { subtotal: number }) {
  const { min, missing, blocked } = useMinOrder(subtotal);
  if (!blocked) return null;
  const pct = Math.min(100, Math.round((subtotal / min) * 100));
  return (
    <div className="minorder" role="status">
      <p>
        <strong>Minimum de commande : {dh(min)}</strong> (hors livraison). Ajoutez encore{' '}
        <strong>{dh(missing)}</strong> d’articles pour pouvoir commander.
      </p>
      <div className="minorder__bar" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
      <Link href={routes.shop} className="minorder__link">
        Continuer mes achats →
      </Link>
    </div>
  );
}
