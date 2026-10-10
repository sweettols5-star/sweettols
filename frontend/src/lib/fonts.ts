import { Cairo, Montserrat, Playfair_Display } from 'next/font/google';

/** The mockup's pair: Playfair Display for titles, Montserrat for everything else. */
export const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display-face',
  display: 'swap',
});

export const body = Montserrat({
  subsets: ['latin'],
  variable: '--font-body-face',
  display: 'swap',
});

/** Arabic pages: neither face above has Arabic letters. Cairo covers both scripts. */
export const arabic = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic-face',
  display: 'swap',
});

export const fontClass = `${display.variable} ${body.variable}`;
export const fontClassAr = `${fontClass} ${arabic.variable}`;
