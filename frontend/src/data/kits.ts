/**
 * Ready-made kits: a few products that go together, added to the cart in one
 * click. The price shown is the live sum of the products — no invented
 * discount. Unpriced or sold-out products are skipped, never added at 0 DH.
 */
export type Kit = { id: string; title: string; pitch: string; slugs: string[] };

export const KITS: Kit[] = [
  {
    id: 'debutant-cake-design',
    title: 'Kit débutant cake design',
    pitch: 'Étaler, couvrir et lisser vos premiers gâteaux en pâte à sucre.',
    slugs: [
      'rouleau-pate-a-sucre-anneaux-epaisseur',
      'double-lisseur-pate-a-sucre-2-en-1',
      'grattoirs-a-gateau-3-pieces',
      'spatule-coudee',
    ],
  },
  {
    id: 'decors-silicone',
    title: 'Kit décors en silicone',
    pitch: 'Fleurs, nœuds, couronnes et ornements en pâte à sucre ou en chocolat.',
    slugs: ['moule-silicone-fleurs', 'moule-silicone-noeuds-coeurs-couronnes', 'moule-silicone-ornements-venitiens'],
  },
];
