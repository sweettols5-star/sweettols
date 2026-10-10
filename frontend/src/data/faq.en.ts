import type { FaqGroup } from './faq';

/** English FAQ: same groups and order as the French one (faq.ts). */
export const FAQ_EN: FaqGroup[] = [
  {
    id: 'commande',
    title: 'Ordering',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Add your items to the cart, then enter your name, phone number, city and address. No account to create, no bank card: your order is saved in a few seconds.',
      },
      {
        q: 'How is my order confirmed?',
        a: 'We call you on the number you gave to confirm the items and the delivery address. The parcel ships after this call.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'Yes, as long as it has not shipped: tell us during the confirmation call or contact us with your order reference (e.g. ST-AB12CD).',
      },
      {
        q: 'Is there a minimum order amount?',
        a: 'Yes: 200 DH minimum, delivery fees included. Your cart shows how much is missing, and the order button becomes active as soon as the minimum is reached.',
      },
      {
        q: 'Why do some products show “Price coming soon”?',
        a: 'These are new products whose price has not been published yet. They cannot be ordered online yet, but you can contact us to find out their price and availability.',
      },
    ],
  },
  {
    id: 'paiement-livraison',
    title: 'Payment & delivery',
    items: [
      {
        q: 'How does payment work?',
        a: 'You pay the courier in cash when the parcel arrives. Nothing is paid online.',
      },
      {
        q: 'Do you deliver anywhere in Morocco?',
        a: 'Yes. Fees and delivery times depend on your city: they are shown on the Delivery page and when you order, before anything is confirmed.',
      },
      {
        q: 'What if I am not there for the delivery?',
        a: 'The courier calls you before coming. If you are away, give them another time or another person to receive the parcel.',
      },
      {
        q: 'What if an item arrives damaged?',
        a: 'Check the parcel in front of the courier. If there is a problem, contact us within 48 hours with a photo: we will find a solution.',
      },
    ],
  },
  {
    id: 'produits',
    title: 'Products & use',
    items: [
      {
        q: 'Do I need to grease a silicone mould?',
        a: 'Usually not: silicone is naturally non-stick. For the very first uses, a thin layer of butter or oil helps unmould cakes. For chocolate and sugar paste, use the mould clean and dry.',
      },
      {
        q: 'Can my silicone moulds go in the oven and the freezer?',
        a: 'Silicone baking moulds can go in the oven and the freezer. The exact temperatures vary by model: check the product page. Always place the mould on a rigid tray to put it in the oven.',
      },
      {
        q: 'How do I clean my utensils?',
        a: 'In hot soapy water with a soft sponge, then dry completely. Avoid abrasive sponges and sharp objects on silicone, and do not leave stainless steel utensils soaking.',
      },
      {
        q: 'I am new to cake decorating, where should I start?',
        a: 'A rolling pin with thickness rings, a smoother, scrapers and an offset spatula are enough to cover and smooth your first cakes. Our beginner kit brings them together, and our tips explain how to use them.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    items: [
      {
        q: 'How can I contact you?',
        a: 'By WhatsApp, phone or e-mail: all our contact details are on the Contact page. For an order, give us its reference, it is faster.',
      },
      {
        q: 'Do you sell to professionals?',
        a: 'Yes. For a large quantity or a regular need (pastry shop, caterer, workshop), contact us: we will look at your request.',
      },
    ],
  },
];
