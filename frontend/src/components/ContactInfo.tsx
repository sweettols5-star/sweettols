'use client';

import { whatsappUrl } from '@/lib/whatsapp';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconWhatsapp } from './Icons';
import { useT } from './LangProvider';
import { useSettings } from './LiveCatalogue';

/** Every contact the owner has filled in /admin; nothing is invented. */
export default function ContactInfo() {
  const s = useSettings();
  const t = useT().contact;
  const cards = [
    s.whatsapp && {
      Icon: IconWhatsapp,
      title: t.whatsapp,
      value: s.whatsapp,
      href: whatsappUrl(s.whatsapp, t.hello),
      external: true,
    },
    s.phone && { Icon: IconPhone, title: t.phoneCard, value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.email && { Icon: IconMail, title: t.emailCard, value: s.email, href: `mailto:${s.email}` },
    s.instagram && { Icon: IconInstagram, title: 'Instagram', value: handle(s.instagram), href: s.instagram, external: true },
    s.facebook && { Icon: IconFacebook, title: 'Facebook', value: t.ourPage, href: s.facebook, external: true },
    s.tiktok && { Icon: IconTiktok, title: 'TikTok', value: handle(s.tiktok), href: s.tiktok, external: true },
  ].filter(Boolean) as Array<{ Icon: typeof IconPhone; title: string; value: string; href: string; external?: boolean }>;

  return (
    <>
      {cards.length ? (
        <div className="contact-cards">
          {cards.map(({ Icon, title, value, href, external }) => (
            <a
              key={title}
              href={href}
              className="contact-card"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="contact-card__icon">
                <Icon />
              </span>
              <strong>{title}</strong>
              <span dir="ltr">{value}</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="notice">{t.soon}</p>
      )}
      {(s.city || s.hours) && (
        <ul className="contact-meta">
          {s.city && (
            <li>
              <IconPin width={18} height={18} /> {t.cityLine(s.city)}
            </li>
          )}
          {s.hours && <li>{s.hours}</li>}
        </ul>
      )}
    </>
  );
}

function handle(url: string) {
  const m = url.match(/(?:instagram|tiktok)\.com\/@?([^/?#]+)/i);
  return m ? `@${m[1]}` : url;
}
