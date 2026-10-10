'use client';

import { useT } from './LangProvider';

export default function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      {useT().nav.skip}
    </a>
  );
}
