const STEPS = ['Panier', 'Livraison', 'Confirmation'];

export default function OrderSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="steps" aria-label="Étapes de la commande">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const state = n < current ? 'is-done' : n === current ? 'is-current' : '';
        return (
          <li key={s} className={state} aria-current={n === current ? 'step' : undefined}>
            <span className="steps__n">{n}</span>
            <span className="steps__label">{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
