'use client';

import { dh } from '@/lib/format';
import { useSettings } from './LiveCatalogue';

/** Zones and fees as set in /admin, refreshed live. */
export default function DeliveryInfo() {
  const s = useSettings();
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Zone</th>
              <th scope="col">Délai</th>
              <th scope="col">Frais</th>
            </tr>
          </thead>
          <tbody>
            {s.zones.map((z) => (
              <tr key={z.id}>
                <th scope="row">{z.label}</th>
                <td>{z.delay || '—'}</td>
                <td>{z.fee ? dh(z.fee) : 'Offerte'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(s.minOrder ?? 0) > 0 && (
        <p className="notice">Minimum de commande : {dh(s.minOrder ?? 0)} d’articles (hors livraison).</p>
      )}
      {s.freeShippingThreshold > 0 && (
        <p className="notice">Livraison offerte dès {dh(s.freeShippingThreshold)} d’achat.</p>
      )}
    </>
  );
}
