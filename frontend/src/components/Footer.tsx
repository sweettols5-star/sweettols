'use client';

import { routes } from '@/lib/routes';
import { whatsappUrl } from '@/lib/whatsapp';
import Brand from './Brand';
import Link from './Link';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconWhatsapp } from './Icons';
import { useFilledCategories, useSettings } from './LiveCatalogue';

export default function Footer() {
  const s = useSettings();
  const categories = useFilledCategories();
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
          <p>{s.baseline}. Paiement à la livraison partout au Maroc.</p>
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
          <p className="footer__title">Catégories</p>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={routes.category(c.id)}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href={routes.shop}>Toute la boutique</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer__title">Aide</p>
          <ul>
            <li>
              <Link href={routes.delivery}>Livraison & paiement</Link>
            </li>
            <li>
              <Link href={routes.faq}>Questions fréquentes</Link>
            </li>
            <li>
              <Link href={routes.guides}>Conseils & astuces</Link>
            </li>
            <li>
              <Link href={routes.cart}>Mon panier</Link>
            </li>
            <li>
              <Link href={routes.contact}>Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="footer__title">Nous joindre</p>
          <ul className="footer__contact">
            {s.whatsapp && (
              <li>
                <IconWhatsapp width={18} height={18} />
                <a href={whatsappUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer">
                  {s.whatsapp}
                </a>
              </li>
            )}
            {s.phone && (
              <li>
                <IconPhone width={18} height={18} />
                <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
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
                <span>{s.city}, Maroc</span>
              </li>
            )}
            <li>
              <Link href={routes.contact}>Écrivez-nous →</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom container">
        <span>© {new Date().getFullYear()} SweetTools. Tous droits réservés.</span>
        <span>Paiement à la livraison · Prix en dirhams</span>
      </div>
    </footer>
  );
}
