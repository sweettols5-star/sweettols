'use client';

import Link from './Link';
import { useT } from './LangProvider';

/** The client's logo as sent: white drawing + « SWEETTOLS » on its violet square. */
export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand${light ? ' brand--light' : ''}`} aria-label={useT().nav.brandHome}>
      <img src="/brand/logo-256.webp" alt="SWEETTOOLS" width={256} height={256} className="brand__logo" />
    </Link>
  );
}
