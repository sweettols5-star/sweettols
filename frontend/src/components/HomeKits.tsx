'use client';

import KitCard from './KitCard';
import { useT } from './LangProvider';
import { useSettings } from './LiveCatalogue';

/** « Kits prêts à l’emploi » — the kits come from the settings, so an edit in /admin/kits shows without a rebuild. */
export default function HomeKits() {
  const kits = useSettings().kits ?? [];
  const t = useT().kits;
  if (!kits.length) return null;

  return (
    <section className="section container">
      <div className="section__head">
        <div>
          <h2 className="section__title">{t.title}</h2>
          <p className="section__sub">{t.sub}</p>
        </div>
      </div>
      <div className="kits">
        {kits.map((k) => (
          <KitCard key={k.id} kit={k} />
        ))}
      </div>
    </section>
  );
}
