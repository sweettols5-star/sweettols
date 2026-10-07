import type { ReactNode } from 'react';
import { CartProvider } from './CartProvider';
import { LiveCatalogueProvider } from './LiveCatalogue';
import Header from './Header';
import Footer from './Footer';
import ContactFloats from './ContactFloats';

/** Providers + header/footer of the shop. Shared by the (shop) layout and the 404. */
export default function ShopChrome({ children }: { children: ReactNode }) {
  return (
    <LiveCatalogueProvider>
      <CartProvider>
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ContactFloats />
      </CartProvider>
    </LiveCatalogueProvider>
  );
}
