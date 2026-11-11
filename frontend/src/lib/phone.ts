/**
 * A Moroccan number as typed by a shopper, back to its local form
 * `0612345678` — or '' when it isn't one. Accepts spaces, dots, dashes,
 * `+212`, `00212`, `+212 06…` (the 0 kept by habit), the 9 digits without
 * the 0, and Arabic digits (٠-٩ / ۰-۹) from an Arabic phone keyboard.
 * Same rule as the API: backend/src/lib/text.js (moroccanPhone).
 */
export function moroccanPhone(raw: string): string {
  let d = String(raw ?? '')
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x6f0))
    .replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('212')) d = d.slice(3);
  if (/^[5-7]\d{8}$/.test(d)) d = `0${d}`;
  return /^0[5-7]\d{8}$/.test(d) ? d : '';
}
