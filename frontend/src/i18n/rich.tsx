import { Fragment, type ReactNode } from 'react';

/**
 * Fills `{key}` placeholders of a translated sentence with elements, so a
 * bold word or a link can sit anywhere the language puts it:
 *   rich('Votre commande {ref} est enregistrée.', { ref: <strong>ST-…</strong> })
 */
export function rich(template: string, parts: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/).map((chunk, i) => {
    const m = chunk.match(/^\{(\w+)\}$/);
    return <Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : chunk}</Fragment>;
  });
}
