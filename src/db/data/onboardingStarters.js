// ─── Onboarding Starter Lists ─────────────────────────────────────────────────
//
// Curated subsets of the full household goods and ingredients lists shown
// during onboarding so users can quickly select what applies to them.
//
// All IDs must match real entries in householdGoods.js and ingredients.js.

// ── Household Goods ───────────────────────────────────────────────────────────
// The most universally common items across cleaning, hygiene, kitchen, and home.
// Presented on onboarding Page 6 as a pre-checked checkbox list.

export const STARTER_HOUSEHOLD_GOODS = [
  // Cleaning
  { id: 'toilet-paper',        name: 'Toilet Paper' },
  { id: 'paper-towels',        name: 'Paper Towels' },
  { id: 'tissues',             name: 'Tissues' },
  { id: 'dish-soap',           name: 'Dish Soap' },
  { id: 'dish-detergent',      name: 'Dish Detergent' },
  { id: 'sponges',             name: 'Sponges' },
  { id: 'laundry-detergent',   name: 'Laundry Detergent' },
  { id: 'trash-bags',          name: 'Trash Bags' },
  { id: 'cleaning-wipes',      name: 'Cleaning Wipes' },
  { id: 'all-purpose-cleaner', name: 'All-Purpose Cleaner' },
  { id: 'toilet-bowl-cleaner', name: 'Toilet Bowl Cleaner' },
  // Kitchen & Food Storage
  { id: 'aluminum-foil',       name: 'Aluminum Foil' },
  { id: 'plastic-wrap',        name: 'Plastic Wrap' },
  { id: 'ziplock-bags',        name: 'Ziplock Bags' },
  { id: 'parchment-sheets',    name: 'Parchment Sheets' },
  { id: 'paper-napkins',       name: 'Paper Napkins' },
  { id: 'kitchen-towels',      name: 'Kitchen Towels' },
  // Hygiene & Health
  { id: 'hand-soap',           name: 'Hand Soap' },
  { id: 'shampoo',             name: 'Shampoo' },
  { id: 'conditioner',         name: 'Conditioner' },
  { id: 'body-wash',           name: 'Body Wash' },
  { id: 'toothpaste',          name: 'Toothpaste' },
  { id: 'toothbrushes',        name: 'Toothbrushes' },
  { id: 'deodorant',           name: 'Deodorant' },
  { id: 'band-aids',           name: 'Band-Aids' },
  // Home
  { id: 'batteries',           name: 'Batteries' },
  { id: 'light-bulbs',         name: 'Light Bulbs' },
]

// ── Pantry Staples ────────────────────────────────────────────────────────────
// Common ingredients most people keep on hand. Selecting these tells the app
// not to add them to the grocery list automatically (they're already stocked).
// Presented on onboarding Page 7 as a pre-checked checkbox list.

export const STARTER_PANTRY_INGREDIENTS = [
  // Oils, Fats & Dairy
  { id: 'olive-oil',          name: 'Olive Oil' },
  { id: 'vegetable-oil',      name: 'Vegetable Oil' },
  { id: 'salted-butter',      name: 'Butter' },
  { id: 'eggs',               name: 'Eggs' },
  { id: 'whole-milk',         name: 'Milk' },
  // Produce & Aromatics
  { id: 'garlic',             name: 'Garlic' },
  // Pantry Staples
  { id: 'all-purpose-flour',  name: 'All-Purpose Flour' },
  { id: 'granulated-sugar',   name: 'Granulated Sugar' },
  { id: 'brown-sugar',        name: 'Brown Sugar' },
  { id: 'baking-powder',      name: 'Baking Powder' },
  { id: 'baking-soda',        name: 'Baking Soda' },
  { id: 'vanilla-extract',    name: 'Vanilla Extract' },
  { id: 'rice',               name: 'Rice' },
  // Condiments & Liquids
  { id: 'soy-sauce',          name: 'Soy Sauce' },
  { id: 'white-vinegar',      name: 'White Vinegar' },
  { id: 'apple-cider-vinegar',name: 'Apple Cider Vinegar' },
  { id: 'honey',              name: 'Honey' },
  { id: 'tomato-paste',       name: 'Tomato Paste' },
  { id: 'chicken-stock',      name: 'Chicken Stock' },
  { id: 'vegetable-stock',    name: 'Vegetable Stock' },
  { id: 'mayonnaise',         name: 'Mayonnaise' },
  { id: 'ketchup',            name: 'Ketchup' },
  // Spices & Herbs
  { id: 'salt',               name: 'Salt' },
  { id: 'black-pepper',       name: 'Black Pepper' },
  { id: 'garlic-powder',      name: 'Garlic Powder' },
  { id: 'onion-powder',       name: 'Onion Powder' },
  { id: 'paprika',            name: 'Paprika' },
  { id: 'chili-powder',       name: 'Chili Powder' },
  { id: 'ground-cumin',       name: 'Ground Cumin' },
  { id: 'dried-oregano',      name: 'Dried Oregano' },
  { id: 'dried-thyme',        name: 'Dried Thyme' },
  { id: 'ground-cinnamon',    name: 'Ground Cinnamon' },
  { id: 'ground-ginger',      name: 'Ground Ginger' },
  { id: 'turmeric',           name: 'Turmeric' },
]
