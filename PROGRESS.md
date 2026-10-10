# SweetTools — journal de construction

Boutique en ligne de matériel de pâtisserie (Maroc). Décisions client (2026-10-06) :
nom **SweetTools**, **Next.js + Express/Mongo + admin**, **paiement à la livraison (COD)**.
Architecture copiée sur `../omar` : vitrine Next en export statique + API Express (Render) +
admin client (jeton Bearer en localStorage) + rafraîchissement du catalogue dans le navigateur.

## Fait

### Backend (`backend/`) — fonctionne, testé à la main
- `npm run dev` → http://localhost:4500 (store fichier `.data/db.json` tant que `MONGODB_URI` est vide)
- `npm run seed` charge `data/catalogue.json` (10 catégories, 23 produits) + admin
  `admin@sweettools.ma` / `sweettools-demo-2026` (dans `.env.local`, à changer)
- Routes : `GET /api/catalogue`, `POST /api/orders` (prix relus en base, zone de livraison,
  stock décrémenté), admin : login/me/password, products CRUD, categories CRUD,
  orders (liste + statut, annulation = remise en stock), settings, dashboard, uploads (sharp → Cloudinary ou ./uploads)
- Vérifié : panier à 55 DH corrigé à 60 DH ; produit sans prix refusé.

### Frontend (`frontend/`) — boutique faite et testée (2026-10-06)
- Next 16.3.8 + React 19, export statique (`npm run build` → `out/`, 42 pages), `npm run serve` → :4330
- `npm run images` : photos → `public/products/*.webp` ; `node scripts/make-og.mjs` → `public/og.jpg` (image de partage)
- Un seul layout racine (`app/layout.tsx` : polices, CSS) ; la boutique est dans le groupe `(shop)` via
  `components/ShopChrome.tsx` (catalogue live + panier + header/footer), réutilisé par `app/not-found.tsx`.
  L'admin aura son propre layout dans le groupe `(admin)`.
- Pages : accueil, /boutique/ (tri + recherche ?q=), /categorie/[id]/, /produit/[slug]/ + repli /produit/?slug=,
  /panier/, /commande/ (formulaire COD → confirmation avec référence ST-XXXXXX), /livraison/ (zones live + FAQ), /contact/, 404
- SEO déjà posé : métadonnées + canonical + OG par page, JSON-LD OnlineStore / Product (Offer seulement si prix) /
  BreadcrumbList / CollectionPage / FAQPage ; panier, commande, repli produit en noindex
- Prix 0 = « Prix à venir », bouton désactivé (+ « Demander le prix » WhatsApp dès qu'un numéro est saisi)
- Catégories vides : pages construites mais absentes des menus et de l'accueil
- Contacts (WhatsApp, tél., e-mail, réseaux) : affichés seulement s'ils sont remplis dans les réglages — rien d'inventé
- Tests : `node scripts/e2e-checkout.mjs` (Edge headless sur :9333, API :4500, site :4330) — 28 vérifications vertes :
  ajout panier, persistance, validation, total 155 DH recalculé par l'API, commande dans l'admin (puis annulée), recherche,
  kit, FAQ, conseils, repli, 404, zéro erreur console. Balayage responsive 320→1440 px : aucun débordement.
- Hero de l'accueil, comme le mockup : photo pleine largeur d'un gâteau aux roses en crème au beurre sur présentoir à pois
  (Pixabay 1202271, licence Pixabay/CC0), gâteau à droite, titre à gauche. **Fichiers PROVISOIRES** tirés de la copie
  1024 px de rawpixel : télécharger l'original sur https://pixabay.com/photos/id-1202271/ (Pixabay bloque les scripts)
  puis `node scripts/prepare-hero.mjs <fichier>` et rebuild. Licence : `public/hero/CREDITS.md`.
  Choix du client : **pas de photo avec des mains** ; macarons/tulipes écartés aussi (« comme le mockup »).

### Finitions (2026-10-06)
- Cartes produit toutes de la même hauteur : nom sur 2 lignes exactement (« … » au-delà, nom complet en infobulle),
  ligne de prix à hauteur fixe ; libellés courts (« Ajouter », « Bientôt ») sous 400 px. Vérifié de 320 à 1440 px.
- Menu « Catégories » : ouvert au survol (ou au clavier), fermé quand la souris s'en va (150 ms de grâce), au clic sur
  un lien, à la navigation et sur Échap — piloté en JS (`Header.tsx`), plus par `:focus-within` qui le laissait ouvert.
  Test souris réel : `node scripts/e2e-nav.mjs` (8 vérifications).
- 2 boutons flottants en bas à droite (`ContactFloats.tsx`) : Appeler + WhatsApp.
- **Numéro de la boutique : +212 678 77 99 83** (WhatsApp + téléphone), mis en valeur par défaut dans
  `backend/src/lib/settings.js` → boutons flottants, pied de page, page contact. Modifiable dans Admin → Réglages.
- **Suppression** depuis l'admin : bouton « Supprimer » sur chaque ligne de produit ; « Supprimer la commande » dans une commande
  ouverte (`DELETE /api/admin/orders/:ref`) — remet le stock si la commande n'était ni annulée ni livrée.
- **Formulaire de contact** (page Contact) → `POST /api/messages` (validation FR, téléphone ou e-mail requis, champ piège
  anti-robots, 5 envois / 10 min par IP) → Admin → **Messages** (badge non lus, ouverture = lu, répondre WhatsApp / appel /
  e-mail, marquer non lu, supprimer). Collection `messages` dans les deux stores (JSON + Mongo).
- **Frais de livraison (client, 2026-10-09) : Casablanca 30 DH, autres villes 45 DH** — valeurs par défaut dans
  `backend/src/lib/settings.js` ; en production, à saisir aussi dans Admin → Réglages si des réglages y sont déjà enregistrés.
- **Minimum de commande 200 DH** (consigne client, articles hors livraison) : refusé par l'API (`lib/order.js`), bouton
  de commande désactivé + message « il manque X DH » avec barre de progression dans le panier et à la commande
  (`MinOrderNotice.tsx`), réglable dans Admin → Réglages (0 = pas de minimum), rappelé dans la FAQ et sur la page Livraison.
  Tests e2e mis à jour (commande de 135 DH bloquée, 255 DH acceptée ; 200 DH pile acceptée côté admin).

### Sections ajoutées après étude des concurrents (2026-10-06)
Étudiés : Planète Gâteau et ScrapCooking (FR), Yammy.ma (concurrent direct au Maroc), Jumia, Intervalle Déco.
- FAQ : `src/data/faq.ts` (4 thèmes, 14 questions) → section accueil (5 questions) + page `/faq/` (seule à porter le
  JSON-LD FAQPage) ; la page Livraison réutilise le thème « Paiement & livraison »
- Kits : `src/data/kits.ts` (débutant cake design 125 DH, décors silicone 115 DH), prix = somme live, un clic = tout au panier
- « Comment commander ? » en 4 étapes (paiement à la livraison) sur l'accueil
- Conseils & astuces : `src/data/guides.ts`, 4 guides (`/conseils/`, `/conseils/<slug>/`, JSON-LD Article), chacun relié
  à ses produits ; lien « Conseils » dans le menu, FAQ + Conseils dans le pied de page

### Idées relevées chez les concurrents, en attente du client
- Livraison offerte dès un montant (Yammy : 499 DH) — le réglage existe déjà dans l'admin, il suffit d'un montant
- Avis clients vérifiés (après les premières commandes ; jamais d'avis inventés), fil Instagram quand le compte existe
- Newsletter avec code de bienvenue (Yammy : -50 DH dès 250 DH) ; programme de fidélité (ScrapCooking : 1 DH = 1 point)
- Rayon « gâteaux marocains » (emporte-pièces maamoul, chebakia, sablés) et sélections saisonnières (Ramadan, Aïd, mariages)
- Version arabe (Yammy est bilingue FR/AR) ; offre professionnels (pâtisseries, traiteurs)
- Le catalogue live est demandé en `cache: 'no-cache'` : sinon le `max-age=20` de l'API masquait pendant 20 s
  une modification faite dans l'admin (trouvé par le test admin).

### Admin (`/admin/`) — fait et testé (2026-10-06)
- Code : `src/admin/` (client API + jeton, `AdminShell` = connexion + barre latérale + pastille « nouvelles commandes »,
  `ProductEditor`, `ui.tsx`) et `src/app/(admin)/admin/*` ; styles `src/styles/admin.css`. Pages en noindex, sans header boutique.
- Tableau de bord : à traiter, commandes et ventes 30 j, catalogue, liste « à compléter » (sans prix / rupture / sans photo)
- Commandes : onglets par statut, recherche, fiche dépliable (client, articles, total à encaisser, Appeler / WhatsApp),
  bouton d'étape suivante (Confirmer → Expédiée → Livrée), statut libre, note interne, historique
- Produits : filtres (en vente, sans prix, rupture, sans photo, masqués), prix modifiable directement dans la liste,
  masquer/mettre en ligne ; éditeur : infos, adresse auto, caractéristiques, photos (upload, ordre, principale), prix barré,
  stock (vide = non suivi), visibilité, coup de cœur, suppression. Un seul écran statique : `?modifier=<slug>` / `?nouveau=1`.
- Catégories : liste, ajout, modification (photo facultative), suppression si vide
- Réglages : coordonnées, bandeau, slogan, zones de livraison (ajout/retrait), livraison offerte dès, mot de passe
- Test : `node scripts/e2e-admin.mjs` — 32 vérifications vertes (connexion, refus mauvais mot de passe, cycle d'une commande,
  prix saisi dans la liste visible aussitôt sur la boutique, création avec photo + suppression, réglages → bouton WhatsApp
  et bandeau sur la boutique, catégories, déconnexion, zéro erreur console). **Il écrit dans l'API visée** : sauvegarder
  `backend/.data/db.json` avant, le restaurer après (API arrêtée), et vider `backend/uploads/` des fichiers de test.

## Reste à faire (dans l'ordre)
1. SEO restant : sitemap (sans catégories vides, sans pages noindex), robots (Disallow /admin/), .htaccess (404 + cache)
2. Tests API node:test, puis `.env.production.local` pour tester le build en local
3. Déploiement : Atlas + Render (+ Cloudinary pour les photos, le disque Render est effacé à chaque déploiement)
   + hébergement statique (attendre le domaine) ; changer le mot de passe admin et AUTH_SECRET
4. Plus tard : un bouton « Publier » (reconstruire le site) pour que Google voie les nouveaux produits et prix

## En attente du client
- Prix de 11 produits (affichés « prix à venir », non commandables)
- `product.jpeg` : nom + prix (enregistré comme « Moule en silicone – 24 palets ronds », **masqué**)
- « Silicone alimentaire… » = moule vêtements de bébé : confirmer le nom
- Rouleau : 22 ou 23 cm ? (la photo dit 23)
- WhatsApp, téléphone, e-mail, Instagram, domaine ; langues AR/EN (FR seulement pour l'instant)
- Logo du client utilisé tel quel (fond violet #9f34a1 + « SWEETTOLS ») : public/brand/logo-256.webp / logo-512.png. Le violet du site est aligné sur ce logo. L’emblème rond reste pour les petites tailles (sidebar admin, placeholders produits)

## Pièges
- Dossier dans le gros dépôt git de Bureau : ne rien committer en masse.
- Ne pas lancer `next build` pendant un `next dev` sur le même projet.
- Le test e2e crée une vraie commande dans le store de l'API visée (puis l'annule) : jamais contre la base de production.
