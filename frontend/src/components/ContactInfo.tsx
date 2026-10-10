'use client';

import { whatsappUrl } from '@/lib/whatsapp';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconWhatsapp } from './Icons';
import { useSettings } from './LiveCatalogue';

/** Every contact the owner has filled in /admin; nothing is invented. */
export default function ContactInfo() {
  const s = useSettings();
  const cards = [
    s.whatsapp && {
      Icon: IconWhatsapp,
      title: 'WhatsApp',
      value: s.whatsapp,
      href: whatsappUrl(s.whatsapp, 'Bonjour SWEETTOOLS, '),
      external: true,
    },
    s.phone && { Icon: IconPhone, title: 'Téléphone', value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.email && { Icon: IconMail, title: 'E-mail', value: s.email, href: `mailto:${s.email}` },
    s.instagram && { Icon: IconInstagram, title: 'Instagram', value: handle(s.instagram), href: s.instagram, external: true },
    s.facebook && { Icon: IconFacebook, title: 'Facebook', value: 'Notre page', href: s.facebook, external: true },
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
              <span>{value}</span>
            </a>
          ))}
        </div>
      ) : (
        <p className="notice">Nos coordonnées seront publiées très prochainement.</p>
      )}
      {(s.city || s.hours) && (
        <ul className="contact-meta">
          {s.city && (
            <li>
              <IconPin width={18} height={18} /> {s.city}, Maroc — livraison dans tout le pays
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
