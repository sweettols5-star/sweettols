'use client';

import { whatsappUrl } from '@/lib/whatsapp';
import { IconPhone, IconWhatsapp } from './Icons';
import { useSettings } from './LiveCatalogue';

/**
 * The two floating contact buttons, stacked bottom-right: call above,
 * WhatsApp under the thumb. Each appears as soon as its number is entered in
 * /admin → Réglages (default: the shop number set in backend/src/lib/settings.js).
 * With only a WhatsApp number, the call button dials that same number.
 */
export default function ContactFloats() {
  const { whatsapp, phone } = useSettings();
  const callNumber = (phone || whatsapp).replace(/[^\d+]/g, '');
  if (!whatsapp && !callNumber) return null;

  return (
    <div className="floats">
      {callNumber && (
        <a className="float-btn float-btn--phone" href={`tel:${callNumber}`} aria-label="Nous appeler">
          <IconPhone width={24} height={24} />
          <span className="float-btn__tip">Appeler</span>
        </a>
      )}
      {whatsapp && (
        <a
          className="float-btn float-btn--wa"
          href={whatsappUrl(whatsapp, 'Bonjour SWEETTOOLS, j’ai une question :')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nous écrire sur WhatsApp"
        >
          <IconWhatsapp width={28} height={28} />
          <span className="float-btn__tip">WhatsApp</span>
        </a>
      )}
    </div>
  );
}
