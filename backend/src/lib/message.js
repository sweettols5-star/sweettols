/**
 * Contact-page messages: validation and the stored shape.
 *
 * A message needs a way to answer it — a Moroccan phone number (WhatsApp or
 * call) or an e-mail address. Errors are French sentences shown as-is.
 */
import { clean, reference } from './text.js';

export const SUBJECTS = ['Question sur un produit', 'Suivi de commande', 'Commande en gros / professionnel', 'Autre'];

const PHONE = /^(0[5-7]\d{8}|212[5-7]\d{8})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * @returns {{error: string} | {spam: true} | {message: object}}
 */
export function buildMessage(raw = {}) {
  // Honeypot: a field hidden from people. Bots fill every input; pretend success.
  if (clean(raw.website, 200)) return { spam: true };

  const m = {
    name: clean(raw.name, 120),
    phone: clean(raw.phone, 30),
    email: clean(raw.email, 160).toLowerCase(),
    subject: SUBJECTS.includes(raw.subject) ? raw.subject : 'Autre',
    text: clean(raw.message, 3000),
  };
  if (m.name.length < 2) return { error: 'Indiquez votre nom.' };
  if (!m.phone && !m.email) return { error: 'Laissez un téléphone ou un e-mail pour que nous puissions vous répondre.' };
  if (m.phone && !PHONE.test(m.phone.replace(/\D/g, ''))) return { error: 'Numéro de téléphone invalide (ex. 06 12 34 56 78).' };
  if (m.email && !EMAIL.test(m.email)) return { error: 'Adresse e-mail invalide.' };
  if (m.text.length < 10) return { error: 'Votre message est trop court (10 caractères minimum).' };

  return {
    message: {
      id: reference('MSG'),
      ...m,
      read: false,
      createdAt: new Date().toISOString(),
    },
  };
}
