'use client';

import { useT } from './LangProvider';
import { useSettings } from './LiveCatalogue';

/** Zones and fees as set in /admin, refreshed live. */
export default function DeliveryInfo() {
  const s = useSettings();
  const t = useT();
  const d = t.deliveryInfo;
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">{d.zone}</th>
              <th scope="col">{d.delay}</th>
              <th scope="col">{d.fee}</th>
            </tr>
          </thead>
          <tbody>
            {s.zones.map((z) => (
              <tr key={z.id}>
                <th scope="row">{z.label}</th>
                <td>{z.delay || '—'}</td>
                <td>{z.fee ? t.dh(z.fee) : d.free}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(s.minOrder ?? 0) > 0 && (
        <p className="notice">{d.minOrder(t.dh(s.minOrder ?? 0))}</p>
      )}
      {s.freeShippingThreshold > 0 && (
        <p className="notice">{d.freeFrom(t.dh(s.freeShippingThreshold))}</p>
      )}
    </>
  );
}
