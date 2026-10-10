/**
 * Contact-page messages: validation and the stored shape.
 *
 * A message needs a way to answer it — a Moroccan phone number (WhatsApp or
 * call) or an e-mail address. Errors come back in the shopper's language (lib/i18n.js).
 */
import { clean, reference } from './text.js';
import { msg, shopLang } from './i18n.js';

export const SUBJECTS = ['Question sur un produit', 'Suivi de commande', 'Commande en gros / professionnel', 'Autre'];

const PHONE = /^(0[5-7]\d{8}|212[5-7]\d{8})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * @returns {{error: string} | {spam: true} | {message: object}}
 */
export function buildMessage(raw = {}) {
  const lang = shopLang(raw.lang);
  // Honeypot: a field hidden from people. Bots fill every input; pretend success.
  if (clean(raw.website, 200)) return { spam: true };

  const m = {
    name: clean(raw.name, 120),
    phone: clean(raw.phone, 30),
    email: clean(raw.email, 160).toLowerCase(),
    subject: SUBJECTS.includes(raw.subject) ? raw.subject : 'Autre',
    text: clean(raw.message, 3000),
  };
  if (m.name.length < 2) return { error: msg(lang, 'contactName') };
  if (!m.phone && !m.email) return { error: msg(lang, 'phoneOrEmail') };
  if (m.phone && !PHONE.test(m.phone.replace(/\D/g, ''))) return { error: msg(lang, 'phone') };
  if (m.email && !EMAIL.test(m.email)) return { error: msg(lang, 'contactEmail') };
  if (m.text.length < 10) return { error: msg(lang, 'shortMessage') };

  return {
    message: {
      id: reference('MSG'),
      ...m,
      lang,
      read: false,
      createdAt: new Date().toISOString(),
    },
  };
}
