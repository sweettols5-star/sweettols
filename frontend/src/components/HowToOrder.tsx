import { IconBag, IconCash, IconPhone, IconTruck } from './Icons';

const STEPS = [
  { Icon: IconBag, title: 'Vous choisissez', text: 'Ajoutez vos outils au panier, sans créer de compte.' },
  { Icon: IconPhone, title: 'On vous appelle', text: 'Nous confirmons la commande et l’adresse par téléphone.' },
  { Icon: IconTruck, title: 'On livre', text: 'Votre colis part partout au Maroc.' },
  { Icon: IconCash, title: 'Vous payez à la réception', text: 'En espèces au livreur. Rien à payer en ligne.' },
];

/** The cash-on-delivery flow in four steps — reassures first-time online buyers. */
export default function HowToOrder() {
  return (
    <ol className="howorder">
      {STEPS.map(({ Icon, title, text }, i) => (
        <li key={title}>
          <span className="howorder__icon">
            <Icon />
            <span className="howorder__n">{i + 1}</span>
          </span>
          <strong>{title}</strong>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}
