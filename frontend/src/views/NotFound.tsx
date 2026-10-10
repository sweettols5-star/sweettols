import Link from '@/components/Link';
import { getDict, type Lang } from '@/i18n';
import { routes } from '@/lib/routes';

/** Body of the 404 page; the chrome around it comes from whoever renders it. */
export default function NotFoundView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pages.notFound;
  return (
    <div className="container section">
      <div className="empty">
        <img src="/brand/logo-256.webp" alt="" width={128} height={128} className="empty__mark" />
        <h1 className="page-title">{t.title}</h1>
        <p>{t.text}</p>
        <div className="confirm__actions">
          <Link href={routes.shop} className="btn btn--primary">
            {t.seeShop}
          </Link>
          <Link href={routes.home} className="btn btn--ghost">
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
