/**
 * « Conseils & astuces » — practical guides, each tied to products from the
 * catalogue (every competitor runs a recipes/tips hub; it is also the main
 * source of search traffic for a small shop). General technique only: no
 * product-specific claim that is not on the product sheet.
 */
import type { Lang } from '@/i18n/config';
import { GUIDES_AR } from './guides.ar';
import { GUIDES_EN } from './guides.en';

export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'tips'; items: string[] };

export type Guide = {
  slug: string;
  title: string;
  /** Card + meta description. */
  summary: string;
  /** Product photo used on the card. */
  cover: string;
  minutes: number;
  products: string[];
  body: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: 'moules-silicone-utilisation-entretien',
    title: 'Moules en silicone : bien les utiliser et les entretenir',
    summary:
      'Premier lavage, graissage, cuisson, congélation, démoulage et nettoyage : tout ce qu’il faut savoir pour que vos moules en silicone durent longtemps.',
    cover: '/products/moule-silicone-fleurs-1-thumb.webp',
    minutes: 4,
    products: ['moule-silicone-fleurs', 'moule-silicone-noeuds-coeurs-couronnes', 'moule-madeleines-silicone'],
    body: [
      {
        type: 'p',
        text: 'Le silicone alimentaire est souple, antiadhésif et passe du congélateur au four : c’est la matière idéale pour les décors en pâte à sucre, le chocolat et les petits gâteaux. Quelques bons réflexes suffisent pour obtenir des démoulages nets à chaque fois.',
      },
      { type: 'h2', text: 'Avant la première utilisation' },
      {
        type: 'steps',
        items: [
          'Lavez le moule à l’eau chaude savonneuse, rincez-le et séchez-le complètement.',
          'Pour un moule de cuisson, passez un voile de beurre ou d’huile lors des premières utilisations : le démoulage sera plus facile. Ensuite, ce n’est généralement plus nécessaire.',
          'Pour la pâte à sucre et le chocolat, utilisez le moule propre et parfaitement sec, sans matière grasse.',
        ],
      },
      { type: 'h2', text: 'Au four et au congélateur' },
      {
        type: 'tips',
        items: [
          'Posez toujours le moule sur une plaque ou une grille avant de le remplir : il est souple et se déforme quand on le déplace plein.',
          'Respectez les températures indiquées sur la fiche du produit.',
          'Pour les mousses, les inserts et le chocolat, un passage de 10 à 20 minutes au congélateur rend le démoulage beaucoup plus net.',
        ],
      },
      { type: 'h2', text: 'Démouler sans casser' },
      {
        type: 'p',
        text: 'Laissez tiédir les gâteaux avant de démouler. Retournez le moule et poussez doucement le fond avec les pouces en décollant les bords : le silicone se retourne comme un gant. Pour les décors fins, pliez légèrement le moule plutôt que de tirer sur la pâte.',
      },
      { type: 'h2', text: 'Nettoyage et rangement' },
      {
        type: 'tips',
        items: [
          'Eau chaude savonneuse et éponge douce ; jamais d’éponge abrasive ni d’objet coupant.',
          'Séchez bien avant de ranger, surtout les moules à motifs fins.',
          'Rangez-les à plat ou roulés sans les écraser, à l’abri de la poussière.',
        ],
      },
    ],
  },
  {
    slug: 'reussir-macarons-tapis',
    title: 'Réussir ses macarons avec un tapis à macarons',
    summary:
      'Des coques de la même taille, bien rondes et faciles à décoller : la méthode pas à pas avec un tapis à cercles imprimés.',
    cover: '/products/tapis-macaron-petite-taille-30x40-1-thumb.webp',
    minutes: 5,
    products: ['tapis-macaron-petite-taille-30x40', 'tapis-macaron-grande-taille-60x40', 'maryse-silicone'],
    body: [
      {
        type: 'p',
        text: 'Le tapis à macarons porte des cercles de repère : il suffit de les remplir pour obtenir des coques identiques, qui se décollent sans papier sulfurisé. Le secret tient surtout dans le dressage et le repos.',
      },
      { type: 'h2', text: 'Pas à pas' },
      {
        type: 'steps',
        items: [
          'Posez le tapis bien à plat sur une plaque froide, face imprimée vers le haut.',
          'Préparez votre appareil et mélangez-le à la maryse jusqu’à ce qu’il forme un ruban souple et brillant (le macaronnage).',
          'Tenez la poche verticale, à quelques millimètres du tapis, au centre de chaque cercle. Pressez sans bouger jusqu’à atteindre le bord du cercle, puis arrêtez de presser et donnez un petit coup de poignet.',
          'Tapotez la plaque sur le plan de travail pour chasser les bulles d’air.',
          'Laissez croûter à température ambiante jusqu’à ce que la surface ne colle plus au doigt.',
          'Enfournez selon votre recette, puis laissez refroidir complètement avant de décoller les coques.',
        ],
      },
      { type: 'h2', text: 'Les erreurs fréquentes' },
      {
        type: 'tips',
        items: [
          'Coques qui s’étalent : appareil trop macaronné, ou poche tenue trop haut.',
          'Coques qui collent : elles ont été décollées trop tôt. Attendez qu’elles soient froides.',
          'Pas de collerette : le croûtage était trop court.',
          'Lavez le tapis à l’eau chaude sans frotter les cercles imprimés, et rangez-le roulé.',
        ],
      },
    ],
  },
  {
    slug: 'lisser-pate-a-sucre',
    title: 'Couvrir et lisser un gâteau en pâte à sucre',
    summary:
      'Étaler à la bonne épaisseur, couvrir sans plis et obtenir des bords nets : les gestes de base du cake design avec rouleau, lisseur et grattoir.',
    cover: '/products/double-lisseur-pate-a-sucre-2-en-1-1-thumb.webp',
    minutes: 6,
    products: [
      'rouleau-pate-a-sucre-anneaux-epaisseur',
      'double-lisseur-pate-a-sucre-2-en-1',
      'grattoirs-a-gateau-3-pieces',
      'spatule-coudee',
      'plateau-tournant-acier-inoxydable',
    ],
    body: [
      {
        type: 'p',
        text: 'Une belle couverture en pâte à sucre se prépare avant même de sortir le rouleau : tout se joue sur un gâteau bien droit et bien froid.',
      },
      { type: 'h2', text: 'Préparer le gâteau' },
      {
        type: 'steps',
        items: [
          'Posez le gâteau sur un plateau tournant : vous travaillerez tout le tour sans le toucher.',
          'Masquez-le d’une fine couche de ganache ou de crème au beurre à la spatule coudée.',
          'Lissez les côtés au grattoir à bord droit en faisant tourner le plateau, puis mettez au frais jusqu’à ce que la couche soit ferme.',
        ],
      },
      { type: 'h2', text: 'Étaler et couvrir' },
      {
        type: 'steps',
        items: [
          'Pétrissez la pâte à sucre pour l’assouplir et saupoudrez le plan de travail d’un peu de sucre glace ou de fécule.',
          'Glissez les anneaux d’épaisseur sur le rouleau : la pâte sera régulière partout, sans zones trop fines qui se déchirent.',
          'Étalez un disque assez grand pour couvrir le dessus et les côtés, enroulez-le autour du rouleau et déroulez-le sur le gâteau.',
          'Lissez d’abord le dessus, puis ouvrez les plis des côtés en descendant, sans tirer sur la pâte.',
        ],
      },
      { type: 'h2', text: 'La finition' },
      {
        type: 'tips',
        items: [
          'Passez le lisseur en petits cercles sur le dessus, puis à plat contre les côtés en tournant le plateau.',
          'Coupez l’excédent à la base avec une lame, puis repassez le lisseur pour un bord net.',
          'Une bulle d’air ? Piquez-la avec une épingle propre et lissez par-dessus.',
        ],
      },
    ],
  },
  {
    slug: 'decors-pate-a-sucre-chocolat-moules',
    title: 'Faire des décors en pâte à sucre ou en chocolat avec un moule',
    summary:
      'Fleurs, nœuds, couronnes, ornements : la technique pour des décors moulés nets et détaillés, et comment les mettre en couleur.',
    cover: '/products/moule-silicone-ornements-venitiens-1-thumb.webp',
    minutes: 4,
    products: [
      'moule-silicone-ornements-venitiens',
      'moule-silicone-noeuds-coeurs-couronnes',
      'moule-silicone-petites-fleurs',
      'moule-silicone-tablette-chocolat-arc-en-ciel',
    ],
    body: [
      {
        type: 'p',
        text: 'Les moules à décors en silicone reproduisent des détails qu’il serait très long de sculpter à la main. Avec la bonne pâte et un peu de froid, le résultat est net du premier coup.',
      },
      { type: 'h2', text: 'En pâte à sucre' },
      {
        type: 'steps',
        items: [
          'Pétrissez une petite boule de pâte à sucre (ou de pâte à modeler alimentaire, plus ferme) jusqu’à ce qu’elle soit lisse.',
          'Si la pâte colle, saupoudrez très légèrement le moule de fécule et tapotez pour retirer l’excédent.',
          'Pressez la pâte dans l’empreinte avec le pouce, du centre vers les bords, et arasez le surplus avec une lame à plat.',
          'Placez le moule 5 à 10 minutes au congélateur, puis pliez-le doucement pour libérer le décor.',
        ],
      },
      { type: 'h2', text: 'En chocolat' },
      {
        type: 'steps',
        items: [
          'Remplissez le moule propre et sec de chocolat fondu, ou de chocolat tempéré pour un décor brillant.',
          'Tapotez pour chasser les bulles, raclez le dessus, puis laissez durcir au frais.',
          'Démoulez en pliant le moule, sans toucher le décor avec les doigts chauds.',
        ],
      },
      { type: 'h2', text: 'Mettre en couleur' },
      {
        type: 'tips',
        items: [
          'Teintez la pâte avant de mouler pour un décor uni.',
          'Pour un effet doré ou nacré, appliquez une poudre alimentaire au pinceau sec une fois le décor démoulé.',
          'Laissez sécher les décors en pâte à sucre à l’air quelques heures avant de les poser sur un gâteau à la crème.',
        ],
      },
    ],
  },
];

/** What a translation replaces; slug, cover, minutes and products are shared. */
export type GuideText = Pick<Guide, 'title' | 'summary' | 'body'>;

const TEXTS: Partial<Record<Lang, Record<string, GuideText>>> = { en: GUIDES_EN, ar: GUIDES_AR };

/** The guides in a language; an untranslated one stays in French. */
export function guidesFor(lang: Lang): Guide[] {
  const texts = TEXTS[lang];
  return texts ? GUIDES.map((g) => ({ ...g, ...texts[g.slug] })) : GUIDES;
}

export const guideBySlug = (lang: Lang, slug: string) => guidesFor(lang).find((g) => g.slug === slug);
