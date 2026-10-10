/**
 * The few API errors a shopper can see (checkout, contact form), in the shop's
 * three languages. The shop sends `lang`; anything else falls back to French.
 * Admin-facing errors stay in French: the back office is French only.
 */
const MESSAGES = {
  fr: {
    name: 'Indiquez votre nom complet.',
    contactName: 'Indiquez votre nom.',
    phone: 'Numéro de téléphone invalide (ex. 06 12 34 56 78).',
    email: 'Adresse e-mail invalide (ex. nom@gmail.com), ou laissez le champ vide.',
    contactEmail: 'Adresse e-mail invalide.',
    phoneOrEmail: 'Laissez un téléphone ou un e-mail pour que nous puissions vous répondre.',
    shortMessage: 'Votre message est trop court (10 caractères minimum).',
    city: 'Indiquez votre ville.',
    address: 'Indiquez votre adresse de livraison.',
    emptyCart: 'Le panier est vide.',
    zone: 'Choisissez une zone de livraison.',
    stock: ({ name, available }) => `Stock insuffisant pour « ${name} » (${available} disponible${available > 1 ? 's' : ''}).`,
    unavailable: ({ name }) => `« ${name} » n'est plus disponible. Retirez-le du panier pour continuer.`,
    minOrder: ({ min, missing }) => `Le montant minimum de commande est de ${min} DH (livraison comprise). Il manque ${missing} DH à votre panier.`,
  },
  en: {
    name: 'Please enter your full name.',
    contactName: 'Please enter your name.',
    phone: 'Invalid phone number (e.g. 06 12 34 56 78).',
    email: 'Invalid e-mail address (e.g. name@gmail.com), or leave the field empty.',
    contactEmail: 'Invalid e-mail address.',
    phoneOrEmail: 'Leave a phone number or an e-mail so we can reply.',
    shortMessage: 'Your message is too short (10 characters minimum).',
    city: 'Please enter your city.',
    address: 'Please enter your delivery address.',
    emptyCart: 'Your cart is empty.',
    zone: 'Please choose a delivery zone.',
    stock: ({ name, available }) => `Not enough stock for “${name}” (${available} available).`,
    unavailable: ({ name }) => `“${name}” is no longer available. Remove it from your cart to continue.`,
    minOrder: ({ min, missing }) => `The minimum order is ${min} DH (delivery included). Add ${missing} DH more to your cart.`,
  },
  ar: {
    name: 'يرجى إدخال اسمك الكامل.',
    contactName: 'يرجى إدخال اسمك.',
    phone: 'رقم الهاتف غير صحيح (مثال: 06 12 34 56 78).',
    email: 'البريد الإلكتروني غير صحيح (مثال: name@gmail.com)، أو اترك الخانة فارغة.',
    contactEmail: 'البريد الإلكتروني غير صحيح.',
    phoneOrEmail: 'اترك رقم هاتف أو بريدًا إلكترونيًا لنتمكن من الرد عليك.',
    shortMessage: 'رسالتك قصيرة جدًا (10 أحرف على الأقل).',
    city: 'يرجى إدخال مدينتك.',
    address: 'يرجى إدخال عنوان التوصيل.',
    emptyCart: 'السلة فارغة.',
    zone: 'يرجى اختيار منطقة التوصيل.',
    stock: ({ name, available }) => `المخزون غير كافٍ لـ «${name}» (المتوفر: ${available}).`,
    unavailable: ({ name }) => `«${name}» لم يعد متوفرًا. احذفه من السلة للمتابعة.`,
    minOrder: ({ min, missing }) => `الحد الأدنى للطلب هو ${min} درهم (شاملًا التوصيل). أضف ${missing} درهم إلى سلتك.`,
  },
};

export const shopLang = (v) => (v === 'en' || v === 'ar' ? v : 'fr');

/** Message `key` in `lang`; `params` fills the ones that are functions. */
export function msg(lang, key, params = {}) {
  const m = (MESSAGES[shopLang(lang)] || MESSAGES.fr)[key] ?? MESSAGES.fr[key];
  return typeof m === 'function' ? m(params) : m;
}

/** A product's name in the shopper's language, for the messages above. */
export const nameIn = (product, lang) => product?.i18n?.[shopLang(lang)]?.name || product?.name || '';
