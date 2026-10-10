import type { GuideText } from './guides';

/** English text of the guides (guides.ts), by slug. */
export const GUIDES_EN: Record<string, GuideText> = {
  'moules-silicone-utilisation-entretien': {
    title: 'Silicone moulds: how to use and care for them',
    summary:
      'First wash, greasing, baking, freezing, unmoulding and cleaning: everything you need to know to make your silicone moulds last.',
    body: [
      {
        type: 'p',
        text: 'Food-grade silicone is flexible, non-stick and goes from the freezer to the oven: it is the ideal material for sugar paste decorations, chocolate and small cakes. A few good habits are enough to get clean results every time.',
      },
      { type: 'h2', text: 'Before the first use' },
      {
        type: 'steps',
        items: [
          'Wash the mould in hot soapy water, rinse it and dry it completely.',
          'For a baking mould, apply a thin layer of butter or oil the first few times: unmoulding will be easier. After that, it is usually no longer needed.',
          'For sugar paste and chocolate, use the mould clean and perfectly dry, without any fat.',
        ],
      },
      { type: 'h2', text: 'In the oven and the freezer' },
      {
        type: 'tips',
        items: [
          'Always place the mould on a tray or rack before filling it: it is flexible and bends when moved full.',
          'Follow the temperatures given on the product page.',
          'For mousses, inserts and chocolate, 10 to 20 minutes in the freezer makes unmoulding much cleaner.',
        ],
      },
      { type: 'h2', text: 'Unmoulding without breaking' },
      {
        type: 'p',
        text: 'Let cakes cool slightly before unmoulding. Turn the mould over and gently push the bottom with your thumbs while loosening the edges: the silicone turns inside out like a glove. For fine decorations, bend the mould slightly rather than pulling on the paste.',
      },
      { type: 'h2', text: 'Cleaning and storage' },
      {
        type: 'tips',
        items: [
          'Hot soapy water and a soft sponge; never an abrasive sponge or a sharp object.',
          'Dry well before storing, especially moulds with fine patterns.',
          'Store them flat or rolled without crushing them, away from dust.',
        ],
      },
    ],
  },
  'reussir-macarons-tapis': {
    title: 'Perfect macarons with a macaron mat',
    summary: 'Shells of the same size, nicely round and easy to peel off: the step-by-step method with a printed-circle mat.',
    body: [
      {
        type: 'p',
        text: 'A macaron mat has guide circles: just fill them to get identical shells that peel off without baking paper. The secret lies mostly in the piping and the resting time.',
      },
      { type: 'h2', text: 'Step by step' },
      {
        type: 'steps',
        items: [
          'Lay the mat flat on a cold tray, printed side up.',
          'Prepare your batter and fold it with the spatula until it forms a smooth, glossy ribbon (the macaronage).',
          'Hold the piping bag upright, a few millimetres above the mat, in the centre of each circle. Squeeze without moving until you reach the edge of the circle, then stop squeezing and flick your wrist.',
          'Tap the tray on the worktop to remove air bubbles.',
          'Let a skin form at room temperature until the surface no longer sticks to your finger.',
          'Bake according to your recipe, then let cool completely before peeling off the shells.',
        ],
      },
      { type: 'h2', text: 'Common mistakes' },
      {
        type: 'tips',
        items: [
          'Shells that spread: the batter was over-mixed, or the bag was held too high.',
          'Shells that stick: they were peeled off too early. Wait until they are cold.',
          'No “feet”: the resting time was too short.',
          'Wash the mat in hot water without scrubbing the printed circles, and store it rolled.',
        ],
      },
    ],
  },
  'lisser-pate-a-sucre': {
    title: 'Covering and smoothing a cake with sugar paste',
    summary:
      'Rolling to the right thickness, covering without folds and getting sharp edges: the cake decorating basics with a rolling pin, smoother and scraper.',
    body: [
      {
        type: 'p',
        text: 'A beautiful sugar paste covering is prepared before you even take out the rolling pin: it all depends on a straight, well-chilled cake.',
      },
      { type: 'h2', text: 'Preparing the cake' },
      {
        type: 'steps',
        items: [
          'Place the cake on a turntable: you can work all around it without touching it.',
          'Coat it with a thin layer of ganache or buttercream using the offset spatula.',
          'Smooth the sides with the straight-edged scraper while turning the table, then chill until the layer is firm.',
        ],
      },
      { type: 'h2', text: 'Rolling and covering' },
      {
        type: 'steps',
        items: [
          'Knead the sugar paste to soften it and dust the worktop with a little icing sugar or cornflour.',
          'Slide the thickness rings onto the rolling pin: the paste will be even everywhere, with no thin areas that tear.',
          'Roll out a disc large enough to cover the top and sides, roll it around the pin and unroll it over the cake.',
          'Smooth the top first, then open the folds on the sides working downwards, without pulling the paste.',
        ],
      },
      { type: 'h2', text: 'The finish' },
      {
        type: 'tips',
        items: [
          'Move the smoother in small circles on the top, then flat against the sides while turning the table.',
          'Trim the excess at the base with a blade, then smooth again for a sharp edge.',
          'An air bubble? Prick it with a clean pin and smooth over it.',
        ],
      },
    ],
  },
  'decors-pate-a-sucre-chocolat-moules': {
    title: 'Making sugar paste or chocolate decorations with a mould',
    summary:
      'Flowers, bows, crowns, ornaments: the technique for sharp, detailed moulded decorations, and how to colour them.',
    body: [
      {
        type: 'p',
        text: 'Silicone decoration moulds reproduce details that would take a very long time to sculpt by hand. With the right paste and a little cold, the result is sharp on the first try.',
      },
      { type: 'h2', text: 'With sugar paste' },
      {
        type: 'steps',
        items: [
          'Knead a small ball of sugar paste (or firmer edible modelling paste) until smooth.',
          'If the paste sticks, dust the mould very lightly with cornflour and tap to remove the excess.',
          'Press the paste into the cavity with your thumb, from the centre to the edges, and level off the excess with a flat blade.',
          'Put the mould in the freezer for 5 to 10 minutes, then bend it gently to release the decoration.',
        ],
      },
      { type: 'h2', text: 'With chocolate' },
      {
        type: 'steps',
        items: [
          'Fill the clean, dry mould with melted chocolate, or tempered chocolate for a glossy decoration.',
          'Tap to remove bubbles, scrape the top, then let it set in the fridge.',
          'Unmould by bending the mould, without touching the decoration with warm fingers.',
        ],
      },
      { type: 'h2', text: 'Adding colour' },
      {
        type: 'tips',
        items: [
          'Colour the paste before moulding for a plain decoration.',
          'For a golden or pearly effect, apply an edible powder with a dry brush once the decoration is unmoulded.',
          'Let sugar paste decorations dry in the air for a few hours before placing them on a cream cake.',
        ],
      },
    ],
  },
};
