'use client';

import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import Brand from './Brand';
import Link from './Link';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconWhatsapp } from './Icons';
import { useT } from './LangProvider';
import { useShownCategories, useSettings } from './LiveCatalogue';

export default function Footer() {
  const s = useSettings();
  const categories = useShownCategories();
  const t = useT();
  const f = t.footer;
  const socials = [
    { href: s.instagram, label: 'Instagram', Icon: IconInstagram },
    { href: s.facebook, label: 'Facebook', Icon: IconFacebook },
    { href: s.tiktok, label: 'TikTok', Icon: IconTiktok },
  ].filter((x) => x.href);

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__about">
          <Brand light />
          <p>
            {s.baseline}. {f.cod}
          </p>
          {socials.length > 0 && (
            <div className="footer__socials">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="footer__title">{f.categories}</p>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={routes.category(c.id)}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href={routes.shop}>{f.allShop}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer__title">{f.help}</p>
          <ul>
            <li>
              <Link href={routes.delivery}>{f.deliveryPay}</Link>
            </li>
            <li>
              <Link href={routes.faq}>{f.faq}</Link>
            </li>
            <li>
              <Link href={routes.guides}>{f.guides}</Link>
            </li>
            <li>
              <Link href={routes.cart}>{f.myCart}</Link>
            </li>
            <li>
              <Link href={routes.contact}>{f.contact}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer__title">{f.reach}</p>
          <ul className="footer__contact">
            {s.whatsapp && (
              <li>
                <IconWhatsapp width={18} height={18} />
                <a href={whatsappUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer" dir="ltr">
                  {s.whatsapp}
                </a>
              </li>
            )}
            {s.phone && (
              <li>
                <IconPhone width={18} height={18} />
                <a href={`tel:${s.phone.replace(/\s/g, '')}`} dir="ltr">
                  {s.phone}
                </a>
              </li>
            )}
            {s.email && (
              <li>
                <IconMail width={18} height={18} />
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
            )}
            {s.city && (
              <li>
                <IconPin width={18} height={18} />
                <span>
                  {s.city}, {t.country}
                </span>
              </li>
            )}
            <li>
              <Link href={routes.contact}>{f.writeUs}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom container">
        <span>{f.rights(new Date().getFullYear())}</span>
        <span>{f.bottom}</span>
      </div>
    </footer>
  );
}
