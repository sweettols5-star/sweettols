/**
 * FAQ, grouped by theme (structure inspired by the big French pastry shops).
 * Only facts the shop actually guarantees: cash on delivery, the confirmation
 * call, zones and fees from the settings. Anything the client has not decided
 * yet (exact return policy, opening hours) is phrased as « contact us ».
 */
import type { Lang } from '@/i18n/config';
import { FAQ_AR } from './faq.ar';
import { FAQ_EN } from './faq.en';

export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const FAQ: FaqGroup[] = [
  {
    id: 'commande',
    title: 'Commande',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: 'Ajoutez vos articles au panier, puis indiquez votre nom, votre téléphone, votre ville et votre adresse. Aucun compte à créer, aucune carte bancaire : la commande est enregistrée en quelques secondes.',
      },
      {
        q: 'Comment ma commande est-elle confirmée ?',
        a: 'Nous vous appelons au numéro indiqué pour confirmer les articles et l’adresse de livraison. Le colis part après cet appel.',
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Oui, tant qu’elle n’est pas expédiée : dites-le-nous lors de l’appel de confirmation ou contactez-nous avec la référence de votre commande (ex. ST-AB12CD).',
      },
      {
        q: 'Y a-t-il un montant minimum de commande ?',
        a: 'Oui : 200 DH minimum, frais de livraison compris. Votre panier indique combien il vous manque, et le bouton de commande s’active dès que le minimum est atteint.',
      },
      {
        q: 'Pourquoi certains produits affichent « Prix à venir » ?',
        a: 'Ce sont des nouveautés dont le prix n’est pas encore publié. Elles ne peuvent pas encore être commandées en ligne, mais vous pouvez nous contacter pour connaître leur prix et leur disponibilité.',
      },
    ],
  },
  {
    id: 'paiement-livraison',
    title: 'Paiement & livraison',
    items: [
      {
        q: 'Comment se passe le paiement ?',
        a: 'Vous payez en espèces au livreur, à la réception du colis. Rien n’est payé en ligne.',
      },
      {
        q: 'Livrez-vous partout au Maroc ?',
        a: 'Oui. Les frais et les délais dépendent de votre ville : ils sont affichés sur la page Livraison et au moment de commander, avant toute validation.',
      },
      {
        q: 'Que faire si je ne suis pas là à la livraison ?',
        a: 'Le livreur vous appelle avant de passer. Si vous êtes absent, indiquez-lui un autre moment ou une autre personne pour réceptionner le colis.',
      },
      {
        q: 'Que faire si un article arrive abîmé ?',
        a: 'Vérifiez le colis devant le livreur. En cas de problème, contactez-nous dans les 48 heures avec une photo : nous trouvons une solution.',
      },
    ],
  },
  {
    id: 'produits',
    title: 'Produits & utilisation',
    items: [
      {
        q: 'Faut-il graisser un moule en silicone ?',
        a: 'En général non : le silicone est naturellement antiadhésif. Pour les toutes premières utilisations, un voile de beurre ou d’huile aide au démoulage des gâteaux. Pour le chocolat et la pâte à sucre, utilisez le moule bien propre et sec.',
      },
      {
        q: 'Mes moules en silicone vont-ils au four et au congélateur ?',
        a: 'Les moules de pâtisserie en silicone supportent le four et le congélateur. Les températures exactes varient selon le modèle : vérifiez la fiche du produit. Posez toujours le moule sur une plaque rigide pour l’enfourner.',
      },
      {
        q: 'Comment nettoyer mes ustensiles ?',
        a: 'À l’eau chaude savonneuse avec une éponge douce, puis séchage complet. Évitez les éponges abrasives et les objets coupants sur le silicone, et ne laissez pas tremper les ustensiles en inox.',
      },
      {
        q: 'Je débute en cake design, par quoi commencer ?',
        a: 'Un rouleau avec anneaux d’épaisseur, un lisseur, des grattoirs et une spatule coudée suffisent pour couvrir et lisser vos premiers gâteaux. Notre kit débutant les réunit, et nos conseils expliquent comment s’en servir.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    items: [
      {
        q: 'Comment vous contacter ?',
        a: 'Par WhatsApp, téléphone ou e-mail : toutes nos coordonnées sont sur la page Contact. Pour une commande, donnez-nous sa référence, c’est plus rapide.',
      },
      {
        q: 'Vendez-vous aux professionnels ?',
        a: 'Oui. Pour une grande quantité ou un besoin régulier (pâtisserie, traiteur, atelier), contactez-nous : nous étudions votre demande.',
      },
    ],
  },
];

const BY_LANG: Record<Lang, FaqGroup[]> = { fr: FAQ, en: FAQ_EN, ar: FAQ_AR };

/** The FAQ in a language (en and ar mirror the French groups, same order). */
export const faqFor = (lang: Lang): FaqGroup[] => BY_LANG[lang] ?? FAQ;

/** The questions shown on the home page. */
export function homeFaq(lang: Lang): Faq[] {
  const f = faqFor(lang);
  return [f[1].items[0], f[0].items[1], f[0].items[3], f[1].items[1], f[2].items[0], f[2].items[3]];
}
