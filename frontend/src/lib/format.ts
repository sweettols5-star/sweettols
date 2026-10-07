const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 1250 -> « 1 250 DH » (narrow no-break space so it never wraps). */
export const dh = (n: number) => `${nf.format(n).replace(/\s/g, '\u202f')}\u00a0DH`;

export const pluralize = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;
