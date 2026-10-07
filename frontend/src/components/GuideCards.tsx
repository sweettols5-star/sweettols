import type { Guide } from '@/data/guides';
import { routes } from '@/lib/routes';
import Link from './Link';

export default function GuideCards({ guides }: { guides: Guide[] }) {
  return (
    <div className="guides">
      {guides.map((g) => (
        <article key={g.slug} className="guide-card">
          <Link href={routes.guide(g.slug)} className="guide-card__img" tabIndex={-1} aria-hidden>
            <img src={g.cover} alt="" width={500} height={500} loading="lazy" />
          </Link>
          <div className="guide-card__body">
            <span className="guide-card__meta">Conseil · {g.minutes} min de lecture</span>
            <h3>
              <Link href={routes.guide(g.slug)}>{g.title}</Link>
            </h3>
            <p>{g.summary}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
