import { getDict, type Lang } from '@/i18n';
import { IconBag, IconCash, IconPhone, IconTruck } from './Icons';

const ICONS = [IconBag, IconPhone, IconTruck, IconCash];

/** The cash-on-delivery flow in four steps — reassures first-time online buyers. */
export default function HowToOrder({ lang }: { lang: Lang }) {
  const steps = getDict(lang).howToOrder.map((s, i) => ({ ...s, Icon: ICONS[i] }));
  return (
    <ol className="howorder">
      {steps.map(({ Icon, title, text }, i) => (
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
