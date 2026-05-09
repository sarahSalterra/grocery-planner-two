// ─── Recipe Data ─────────────────────────────────────────────────────────────
//
// Fields:
//   id, name, cuisine, dishType, difficulty, priceLevel, timeRequirement,
//   multiTasking, mealprepIdeal, shortcutReplaces, servings, batchSize,
//   timeToComplete, ingredients, steps, recommendedSides, suggestedExtras
//
// mealprepIdeal: "yes" | "no"
//   Whether this recipe is well-suited for batch cooking (scales well and
//   reheats well). Used for the "frequency" priority badge and filter.
//
// servings: number
//   Base serving count at "single" (couple-chef) scale.
//   Scaled at display time by scaleRecipe() in recipeUtils.js.
//
// batchSize: number (optional, baked goods only)
//   How many units fit in one oven batch (e.g. cookies per sheet).
//   When present, bake time scales by batch count rather than linearly.
//
// timeToComplete: [{ phase, minutes }]
//   All time phases in order. Numeric minutes enables math (totals,
//   notifications, scaling). Formatted for display via formatMinutes().
//   phase: "prep" | "cook" | "bake" | "rise" | "rest" | "chill" | "marinate"
//   Passive phases (rise, chill, marinate, rest) do not scale with servings.
//   Recipes with a rise phase ≥ 15 min trigger advance-start notifications.
//
// suggestedExtras: [{ itemId, quantity, unit }] (optional)
//   Store-bought items (ingredients or household goods) that pair well with
//   this recipe but are not part of the recipe itself. These are not recipes
//   in the library — they are individual grocery items.

const DEFAULT_RECIPES = [

  // ════════════════════════════════════════════════════════════════════════════
  // MEXICAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Green Enchiladas ──────────────────────────────────────────────────────
  {
    id: "green-enchiladas",
    name: "Green Enchiladas",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken; homemade green sauce → store-bought tomatillo salsa",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "green-tomatillos",   quantity: "10",  unit: "whole",  shortcutSubstitute: "tomatillo-salsa" },
      { ingredientId: "monterey-jack-cheese",quantity: "2",  unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "poblano-peppers",    quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "anaheim-chilies",    quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "cream-cheese",       quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",               quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper. Cook for about 5 minutes per side and remove from heat. Allow it to cool while making the green sauce, and shred the meat once cooled.", shortcutText: "Shred the meat from a store-bought rotisserie chicken and set aside." },
      { name: "Make green sauce",  text: "Salt and either roast the onion, tomatillos, poblano, jalapeño, and Anaheim chilies in the oven until lighly charred, or boil in a pot filled about 1/4-full of water until soft (and tomatillos have popped open). Spoon the vegetables into a blender and add chopped cilantro and a pinch of salt until smooth (if using oven-roasted vegetables, you may need to add a few tablespoons of water or oil until the blender works).", shortcutText: "" },
      { name: "Mix filling",       text: "Combine shredded chicken with softened cream cheese, cumin, and salt and pepper to taste.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Fill each tortilla with a couple tablespoons of the chicken mixture (be careful not to overfill or they will be difficult to roll), roll tightly, and place seam-side down in a lightly greased baking dish. Pour the green tomatillo sauce over the top and cover with cheese if using.", shortcutText: "no-shortcut" },
      { name: "Bake & serve",      text: "Bake at 375°F for 20–25 minutes until bubbly and golden. Serve with sour cream and any extra cilantro if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Red Enchiladas ────────────────────────────────────────────────────────
  {
    id: "red-enchiladas",
    name: "Red Enchiladas",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken; homemade red sauce → store-bought red enchilada sauce",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "colby-jack-cheese",  quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",       quantity: "4",   unit: "tbsp",   shortcutSubstitute: "red-enchilada-sauce" },
      { ingredientId: "ground-cumin",              quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "omit" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "dried-oregano",            quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "chicken-stock",      quantity: "1",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper. Cook for about 5 minutes per side and remove from heat. Allow it to cool while making the red sauce, and shred and season the meat with salt and pepper once cooled.", shortcutText: "Shred the meat from a store-bought rotisserie chicken and set aside." },
      { name: "Make red sauce",    text: "Sauté garlic in olive oil on medium heat. Whisk in the flour and cook 1 minute or until bubbly and lightly browned. Add chili powder, cumin, oregano, el pato sauce, and chicken stock. Simmer until thickened (this should take 10 minutes or less).", shortcutText: "" },
      { name: "Assemble",          text: "Fill the tortillas with shredded chicken and cheese if using (be careful not to overfill or they will be difficult to roll), roll tightly, and place seam-side down in a lightly greased baking dish. Pour the red enchilada sauce over top and add the remaining cheese.", shortcutText: "no-shortcut" },
      { name: "Bake & serve",      text: "Bake at 375°F for 20–25 minutes until bubbly. Top with sour cream, cilantro, and lime if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote", "guacamole-snack"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── White Enchiladas ──────────────────────────────────────────────────────
  {
    id: "white-enchiladas",
    name: "White Enchiladas",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "cream-cheese",       quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "505-green-chili-sauce",quantity: "3", unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",              quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper. Cook for about 5 minutes per side and remove from heat. Allow it to cool while making the white sauce, and shred the meat once cooled.", shortcutText: "Shred the meat from a store-bought rotisserie chicken and set aside." },
      { name: "Make white sauce",  text: "Sauté diced onion in butter until soft. Whisk in flour and cook 1 minute or until bubbly and lightly browned. Add chicken broth or stock whisked into 1/4 cup water, sour cream, and green chili. Simmer until creamy (this should take 10 minutes or less).", shortcutText: "no-shortcut" },
      { name: "Mix filling",       text: "Combine shredded chicken with softened cream cheese, cumin, and salt and pepper to taste.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Fill warm tortillas with the chicken mixture (be careful not to overfill or they will be difficult to roll), roll tightly, and place seam-side down in a lightly greased baking dish. Pour white sauce over the top.", shortcutText: "no-shortcut" },
      { name: "Bake & serve",      text: "Bake at 375°F for 20–25 minutes until bubbly. Top with cilantro and a squeeze of lime.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote", "guacamole-snack"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Chicken Fajitas ───────────────────────────────────────────────────────
  {
    id: "fajitas",
    name: "Chicken Fajitas",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "cook", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "3",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "red-bell-pepper",    quantity: "1.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "green-bell-pepper",  quantity: "1.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",              quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "fajita-seasoning-packet" },
      { ingredientId: "chili-powder",       quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "omit" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Marinate chicken",  text: "Trim excess fat and slice chicken breast into strips. Toss with olive oil, cumin, chili powder, garlic, and a pinch of salt. Let sit 10–15 minutes.", shortcutText: "Trim excess fat and slice chicken breast into strips." },
      { name: "Cook chicken",      text: "Cook chicken over high heat in a skillet until golden and cooked through. Set aside.", shortcutText: "Cook the chicken in a skillet over medium-high heat until just starting to brown." },
      { name: "Cook vegetables",   text: "In the same pan, sauté sliced bell peppers, mushrooms, and onion until softened and lightly charred.", shortcutText: "In the same pan, sauté sliced bell peppers, mushrooms, and onion with the chicken until slightly softened. Add the fajita seasoning and 1/4 cup of water to the skillet, reduce heat to medium, and continue to cook until chicken is cooked through and sauce has thickened (about 5-7 minutes)." },
      { name: "Serve",             text: "Serve chicken and veggies in warm tortillas with sour cream, cilantro, and lime if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Machaca Tacos ─────────────────────────────────────────────────────────
  {
    id: "machaca-tacos",
    name: "Machaca Tacos",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "expensive",
    timeRequirement: "long",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 8,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "cook", minutes: 360 },
    ],

    ingredients: [
      { ingredientId: "beef-chuck-roast",   quantity: "6",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "chipotle-peppers",   quantity: "3",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "queso-fresco",       quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cabbage",            quantity: "0.25",unit: "head",  shortcutSubstitute: "none" },
      { ingredientId: "cucumber",           quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "2",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "2", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Season & sear",     text: "Season the chuck roast generously with salt and pepper.", shortcutText: "no-shortcut" },
      { name: "Slow cook",         text: "Place roast in a slow cooker or covered Dutch oven with chipotle peppers, garlic, and a splash of water. Cook on low 6–8 hours (or 300°F for 4–5 hours) until fall-apart tender.", shortcutText: "no-shortcut" },
      { name: "Shred",             text: "Remove beef and shred with two forks. Return to the cooking juices and toss to coat, then sear in a skillet until slightly crispy.", shortcutText: "no-shortcut" },
      { name: "Assemble tacos",    text: "Serve shredded beef in warm tortillas topped with cilantro, chopped red onion, shredded cabbage, chopped cucumber, queso fresco, lime, and sour cream if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Ranch Chicken Tacos ───────────────────────────────────────────────────
  {
    id: "ranch-tacos",
    name: "Ranch Chicken Tacos",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep",     minutes: 15 },
      { phase: "marinate", minutes: 30 },
      { phase: "cook",     minutes: 30 },
    ],

    ingredients: [
      { ingredientId: "chicken-tenderloins",quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "ranch-dip-mix",      quantity: "0.5",   unit: "packet",  shortcutSubstitute: "ranch-dressing" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "buttermilk",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "all-purpose-flour",               quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "taco-seasoning-packet" },
      { ingredientId: "ground-cumin",              quantity: "1.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",            quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ranch-tortilla-chips",quantity: "1.5",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "avocado",            quantity: "1",   unit: "whole",  shortcutSubstitute: "guacamole-storebought" },
      { ingredientId: "queso-fresco",       quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "romaine-lettuce",            quantity: "0.25",unit: "head",   shortcutSubstitute: "none" },
      { ingredientId: "roma-tomato",             quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas", quantity: "10",  unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "pomegranate-seeds",  quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Crush chips",       text: "Crush ranch tortilla chips into medium-sized crumbs in a bag, transfer to a bowl, and stir in 1/4 cup of flour. In another bowl, whisk together the remaining 1/4 cup of flour, chili powder, cumin, salt, and pepper. In a third bowl, beat the eggs with 2 tbsp of the buttermilk. Coat each tenderloin first in the spiced flour, then the eggs, then in the chip crumbs.", shortcutText: "no-shortcut" },
      { name: "Fry chicken",       text: "Heat vegetable oil in a skillet over medium-high heat. Fry coated tenderloins 3–4 minutes per side until golden and cooked through.", shortcutText: "no-shortcut" },
      { name: "Prep toppings",     text: "Mash avocado and mix with chopped cilantro, chopped jalapeño, chopped red onion, chopped tomato, minced garlic, pomegranate seeds, lime juice and salt to make guacamole. Mix 1/4 cup of sour cream, 1/4 cup of buttermilk, and 1/4-1/2 of the ranch dip mix packet into a bowl to make the ranch sauce (add the seasoning little by little, tasting as you go until reaching desired flavor).", shortcutText: "Mix the pomegranate seeds (if using) into the guacamole and add salt or lime juice to taste if desired." },
      { name: "Assemble",          text: "Fill warm tortillas with fried chicken, lettuce, guacamole, queso fresco, ranch sauce or dressing, and more lime if desired, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spanish-rice", "elote"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Beef Tacos ────────────────────────────────────────────────────────────
  {
    id: "beef-tacos",
    name: "Beef Tacos",
    cuisine: "Mexican",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "homemade taco spice blend → taco seasoning packet",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 5 },
      { phase: "cook", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas",        quantity: "1",   unit: "pkg",    shortcutSubstitute: "taco-shells" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "taco-seasoning-packet" },
      { ingredientId: "ground-cumin",              quantity: "1.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "paprika",            quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "garlic-powder",      quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "onion-powder",       quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "dried-oregano",            quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "cayenne",            quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "romaine-lettuce",            quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "roma-tomato",             quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cheddar-cheese",     quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Brown beef",        text: "Brown ground beef in a skillet over medium heat, breaking it apart. Drain fat if there is excess.", shortcutText: "no-shortcut" },
      { name: "Season",            text: "Mix chili powder, cumin, paprika, garlic powder, onion powder, oregano, cayenne, and salt. Add to the beef with a splash of water. Stir and simmer 2–3 minutes.", shortcutText: "Add taco seasoning packet and water per package directions, cooking beef until sauce thickens (about 2-3 minutes)." },
      { name: "Serve",             text: "Fill warm or lightly toasted tortillas (or taco shells if using) with seasoned beef. Top with lettuce, tomato, cheese, sour cream, cilantro, and lime if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["elote", "spanish-rice", "guacamole-snack", "red-salsa"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "1", unit: "cup" },
    ],
  },

  // ── Spanish Rice ──────────────────────────────────────────────────────────
  {
    id: "spanish-rice",
    name: "Spanish Rice",
    cuisine: "Mexican",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "ideal",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 5 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "rice",               quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "beef-stock",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Toast rice",        text: "Toast dry rice in a dry skillet over medium heat until lightly golden and fragrant, 3–4 minutes.", shortcutText: "" },
      { name: "Cook rice",              text: "Add el pato sauce, beef stock, and lastly enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Fluff & serve",     text: "Fluff with a fork and season with salt if needed.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Elote ─────────────────────────────────────────────────────────────────
  {
    id: "elote",
    name: "Elote off the Cobb",
    cuisine: "Mexican",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 10 },
    ],

    ingredients: [
      { ingredientId: "fresh-corn",               quantity: "4",   unit: "cob",  shortcutSubstitute: "frozen-corn" },
      { ingredientId: "salted-butter",             quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "tajin-mayo",         quantity: "0.5",unit: "tbsp",    shortcutSubstitute: "none" },
      { ingredientId: "queso-fresco",       quantity: "3", unit: "tbsp",    shortcutSubstitute: "none" },
      { ingredientId: "lime",               quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.25", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "0.5",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",unit: "tbsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook corn",         text: "If using a pan: Chop the jalapeno and red onion. Cut the corn from the cobbs, combine it with the onion and jalapeno, coat in softened or melted butter and pan-fry on medium-high heat until tender and slightly charred, about 8-10 minutes. If using a grill: Skewer the jalapeno and onion. Coat the corn, onion, and jalapeno with butter and grill on medium-high heat until tender and slightly charred, about 8-10 minutes, removing the corn from the cobbs afterwards and dicing the jalapeno and onion.", shortcutText: "Chop the jalapeno and red onion, adding them with the corn to a skillet along with the butter to coat. Cook on medium-high heat until tender and slightly charred, about 10 minutes." },
      { name: "Dress & serve",     text: "Chop the cilantro, adding it to the corn, and toss with tajin mayo, crumbled queso fresco, sour cream, and lime juice.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Guacamole ─────────────────────────────────────────────────────────────
  {
    id: "guacamole-snack",
    name: "Guacamole",
    cuisine: "Mexican",
    dishType: "snack",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
    ],

    ingredients: [
      { ingredientId: "avocado",            quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "pomegranate-seeds",  quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "1",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.25",unit: "bunch",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mash avocado",      text: "Halve and pit avocados. Scoop into a bowl and mash with lime juice, garlic, and salt to your preferred consistency.", shortcutText: "no-shortcut" },
      { name: "Mix in toppings",   text: "Fold in diced red onion, jalapeño, pomegranate seeds, and cilantro, and serve with tortilla chips or as a topping if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Red Salsa ─────────────────────────────────────────────────────────────
  {
    id: "red-salsa",
    name: "Red Salsa",
    cuisine: "Mexican",
    dishType: "snack",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 6,
    timeToComplete: [
      { phase: "prep",  minutes: 10 },
      { phase: "chill", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "diced-tomatoes",     quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "0.25",unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "1",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Blend",             text: "Combine 3/4 of the can of diced tomatoes with the el pato tomato sauce, onion, jalapeño, cilantro, garlic, and lime juice in a blender. Pulse to desired consistency, and add the remaining 1/4 of the can of diced tomatoes afterwards if a chunkier texture is desired.", shortcutText: "no-shortcut" },
      { name: "Season & chill",    text: "Season with salt, stir, and taste, adding more lime juice and/or salt until desired flavor is reached. Refrigerate for at least 15 minutes before serving.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Huevos Rancheros ──────────────────────────────────────────────────────
  {
    id: "huevos-rancheros",
    name: "Huevos Rancheros",
    cuisine: "Mexican",
    dishType: "breakfast",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "eggs",              quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "505-green-chili",quantity: "3",unit: "oz",    shortcutSubstitute: "505-green-chili-cooking-sauce" },
      { ingredientId: "diced-tomatoes",     quantity: "1.5",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "heavy-whipping-cream",quantity: "1", unit: "tbsp",    shortcutSubstitute: "omit" },
      { ingredientId: "cheddar-cheese",    quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "hashbrowns",        quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "guerrero-tortillas",quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook hashbrowns",   text: "Cook frozen or dehydrated hashbrowns in a skillet with oil or butter until crispy. Set aside.", shortcutText: "no-shortcut" },
      { name: "Warm sauce",        text: "Heat green chili and tomatoes in a small saucepan or skillet over medium heat and add the cheddar cheese and cream, heating until melted.", shortcutText: "Heat the green chili cooking sauce and cheese in a small skillet over medium heat until cheese is melted." },
      { name: "Fry eggs",          text: "Fry eggs in the same skillet to desired doneness.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Layer warm tortillas with hashbrowns, eggs, and the cheesy green chili sauce, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ITALIAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Spaghetti Bolognese ───────────────────────────────────────────────────
  {
    id: "spaghetti-bolognese",
    name: "Spaghetti Bolognese",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "homemade tomato sauce with herbs → jarred spaghetti sauce",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "spaghetti",          quantity: "16",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "tomato-sauce",       quantity: "8",   unit: "oz",     shortcutSubstitute: "spaghetti-sauce" },
      { ingredientId: "tomato-paste",       quantity: "3",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "dried-basil",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "dried-oregano",            quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "dried-thyme",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Boil pasta",        text: "Fill a pot half to 3/4 full of water and bring to a boil. Add pasta and cook while the meat is prepared, stirring occasionally.", shortcutText: "no-shortcut" },
      { name: "Cook beef",         text: "Sauté diced onion and garlic in oil. Add ground beef and mushrooms, browning over medium heat. Season with salt.", shortcutText: "no-shortcut" },
      { name: "Make sauce",        text: "Add tomato sauce, tomato paste, diced tomatoes, basil, oregano, and thyme to the meat. Simmer on medium heat until fragrant and thoroughly heated.", shortcutText: "Add spaghetti sauce to the meat, mix, and heat thoroughly." },
      { name: "Drain & serve",     text: "Once pasta is cooked to desired consistency, drain and serve topped with the meat sauce.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["yeast-rolls", "caesar-salad"],
    suggestedExtras: [
      { itemId: "garlic-bread-frozen",  quantity: "1",   unit: "pkg" },
      { itemId: "french-bread",         quantity: "0.5", unit: "loaf" },
      { itemId: "bread-sticks-frozen",  quantity: "1",   unit: "pkg" },
    ],
  },

  // ── Beef Stroganoff ───────────────────────────────────────────────────────
  {
    id: "beef-stroganoff",
    name: "Beef Stroganoff",
    cuisine: "Slavic",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "expensive",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "beef-tenderloin",    quantity: "1",   unit: "lb",     shortcutSubstitute: "ground-beef" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "beef-stock",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "extra-wide-egg-noodles",quantity: "1",unit: "pkg",   shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook noodles",      text: "Fill a pot 1/2 full of water and bring to a boil. Cook the egg noodles until al dente (just softened, not very soft). Drain and set aside.", shortcutText: "no-shortcut" },
      { name: "Sear beef",         text: "Slice beef tenderloin into thin strips. Sear quickly in butter over high heat until browned but not overcooked. Set aside.", shortcutText: "Cook the ground beef in a skillet over medium heat, breaking it apart, and add the diced onion, minced garlic, and sliced mushrooms, cooking until the beef is browned and the vegetables are softened. Drain fat if there is excess." },
      { name: "Cook vegetables",   text: "In the same pan, sauté onion, garlic, and mushrooms in butter until softened.", shortcutText: "" },
      { name: "Make sauce",        text: "Add beef stock and sour cream, and simmer 2–3 minutes.", shortcutText: "no-shortcut" },
      { name: "Combine & serve",   text: "Return beef to the pan and gently stir to coat. Serve over egg noodles.", shortcutText: "Add the egg noodles to the pan and stir to coat, then serve." },
    ],

    recommendedSides: ["seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "french-bread", quantity: "0.5", unit: "loaf" },
    ],
  },

  // ── Chipotle Pasta ────────────────────────────────────────────────────────
  {
    id: "chipotle-pasta",
    name: "Chipotle Pasta",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "rigatoni-pasta",     quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "chicken-breast",     quantity: "0.5", unit: "lb",     shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "pickled-red-peppers",quantity: "3",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "chipotle-peppers",   quantity: "3",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "tomato-paste",       quantity: "1.5",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "gouda-cheese",       quantity: "0.5",   unit: "wedge",  shortcutSubstitute: "none" },
      { ingredientId: "dried-oregano",            quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Boil pasta",        text: "Fill a pot half to 3/4 full of water and bring to a boil. Add pasta and cook while the meat is prepared, stirring occasionally.", shortcutText: "no-shortcut" },
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Make sauce",        text: "Sauté onion and garlic in oil. Add chipotle peppers, pickled red peppers, diced tomatoes, and tomato paste. Simmer 5 minutes, transfer to a blender, and blend until smooth. Return the sauce to the pan and stir in heavy cream and shredded gouda until melted.", shortcutText: "no-shortcut" },
      { name: "Combine & serve",   text: "Toss pasta and chicken in the sauce and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "garlic-bread-frozen",  quantity: "1",   unit: "pkg" },
      { itemId: "french-bread",         quantity: "0.5", unit: "loaf" },
      { itemId: "bread-sticks-frozen",  quantity: "1",   unit: "pkg" },
    ],
  },

  // ── Lasagna ───────────────────────────────────────────────────────────────
  {
    id: "lasagna",
    name: "Lasagna",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 8,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "bake", minutes: 35 },
    ],

    ingredients: [
      { ingredientId: "lasagna-noodles",    quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "hot-italian-sausage",quantity: "2",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "tomato-paste",       quantity: "3",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "ricotta-cheese",     quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",    quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "mozzarella-cheese",  quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "dried-basil",              quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "dried-oregano",            quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook noodles",      text: "Fill a pot half to 3/4 full of water and bring to a boil. Boil lasagna noodles until just al dente, gently stirring to separate them once softened. Drain and lay flat.", shortcutText: "no-shortcut" },
      { name: "Make meat sauce",   text: "Brown the sausage with chopped onion and minced garlic. Add tomato paste, diced tomatoes, basil, oregano, and salt. Simmer up to 10 minutes stirring occasionally until sauce is heated through and well incorporated.", shortcutText: "no-shortcut" },
      { name: "Make ricotta mix",  text: "Combine ricotta, egg, half the parmesan, salt, and a pinch of basil.", shortcutText: "no-shortcut" },
      { name: "Layer",             text: "In a greased 9x13 baking dish, layer: noodles, ricotta mix, meat sauce, mozzarella. Repeat layers, ending with sparse chunks from the meat sauce for texture and mozzarella on top.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Cover with foil and bake at 375°F for 20 minutes. Uncover and bake 15 more minutes until bubbly and golden.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "garlic-bread-frozen",  quantity: "1",   unit: "pkg" },
      { itemId: "french-bread",         quantity: "0.5", unit: "loaf" },
      { itemId: "bread-sticks-frozen",  quantity: "1",   unit: "pkg" },
    ],
  },

  // ── Fettuccine Alfredo ────────────────────────────────────────────────────
  {
    id: "fettuccine-alfredo",
    name: "Fettuccine Alfredo",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken; homemade Alfredo sauce → jarred Alfredo sauce",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "fettuccine-pasta",   quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "chicken-breast",     quantity: "1", unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",    shortcutSubstitute: "jarred-alfredo-sauce" },
      { ingredientId: "salted-butter",             quantity: "8",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "all-purpose-flour",              quantity: "0.25",unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "parmesan-cheese",    quantity: "2",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "omit" },
      { ingredientId: "nutmeg",             quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Boil pasta",        text: "Fill a pot half to 3/4 full of water and bring to a boil. Add pasta and cook while the meat is prepared, stirring occasionally until the pasta is al dente. Reserve 1 cup pasta water before draining.", shortcutText: "no-shortcut" },
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Make Alfredo sauce",text: "Melt butter in a saucepan over medium heat. Sauté minced garlic briefly in the butter, then whisk in the flour. Slowly add cream and parmesan cheese and simmer until thickened, stirring frequently until melted. To finish, add salt and a pinch of nutmeg if desired.", shortcutText: "Heat jarred Alfredo sauce in the pan over medium-low heat until warmed through, stirring occasionally. Add salt to taste and a pinch of nutmeg if desired." },
      { name: "Combine & serve",   text: "Toss fettuccine and chicken in the Alfredo sauce, thinning with pasta water as needed until desired consistency is reached, and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "garlic-bread-frozen",  quantity: "1",   unit: "pkg" },
      { itemId: "french-bread",         quantity: "0.5", unit: "loaf" },
      { itemId: "bread-sticks-frozen",  quantity: "1",   unit: "pkg" },
    ],
  },

  // ── Green Chili Mac and Cheese ────────────────────────────────────────────
  {
    id: "mac-and-cheese",
    name: "Green Chili Mac and Cheese",
    cuisine: "American",
    dishType: "side",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 20 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "macaroni",           quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "505-green-chili",    quantity: "3",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cheddar-cheese",     quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "monterey-jack-cheese",quantity: "1",  unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "gouda-cheese",       quantity: "0.5",   unit: "wedge",  shortcutSubstitute: "none" },
      { ingredientId: "panko-crumbs",       quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",    quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook pasta",        text: "Fill a pot half to 3/4 cups with water, bring to a boil, and add the macaron. Boil macaroni until al dente, reserve 1 cup of the macaroni water, drain, and set aside.", shortcutText: "no-shortcut" },
      { name: "Make cheese sauce", text: "Melt butter in a saucepan (or transfer the cooked pasta to a baking dish and re-use the pot for the sauce). Whisk in flour and cook 1 minute until bubbly and lightly browned. Add the milk and cream gradually, whisking until thickened. Stir in all the grated cheeses (except for the parmesan), salt, and pepper, and continue to mix until melted and smooth.", shortcutText: "no-shortcut" },
      { name: "Make topping", text: "In a small bowl, mix the panko crumbs and grated parmesan cheese until combined.", shortcutText: "no-shortcut" },
      { name: "Assemble",   text: "Add the pasta to the sauce and toss or stir to coat as evenly as possible. If the sauce is too thick, thin it sparingly with some of the reserved macaroni water until reaching desired consistency. In a lightly greased baking dish, add 1/3 of the macaroni, then spread half of the green chili across the layer of macaroni evenly. Add another 1/3 of the macaroni, then the remaining green chili and spread again. Finally add the remaining third layer of macaroni. Sprinkle the parmesan panko topping over the top.", shortcutText: "Add the pasta to the sauce and toss or stir to coat as evenly as possible. If the sauce is too thick, thin it sparingly with some of the reserved macaroni water until reaching desired consistency. Add the pasta to a lightly greased baking dish and sprinkle the parmesan panko topping over the top." },
      { name: "Bake",        text: "Bake at 375°F for 20–25 minutes until bubbly and golden, cool briefly, then serve.", shortcutText: "no-shortcut" }
    ],

    recommendedSides: [],
  },

  // ── Chicken Cordon Bleu Pasta ─────────────────────────────────────────────
  {
    id: "chicken-cordon-bleu-pasta",
    name: "Shrimp & Chicken Cordon Bleu Pasta",
    cuisine: "American",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "cook", minutes: 30 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1", unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "bacon",              quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "monterey-jack-cheese",quantity: "1",  unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "bowtie-pasta",       quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "large-shrimp",       quantity: "1",   unit: "cup",    shortcutSubstitute: "frozen-panko-shrimp" },
      { ingredientId: "panko-crumbs",       quantity: "0.5",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "6",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Boil pasta",        text: "Fill a pot half to 3/4 full of water and bring to a boil. Add pasta and cook while the meat is prepared, stirring occasionally until the pasta is al dente. Reserve 1 cup pasta water before draining.", shortcutText: "no-shortcut" },
      { name: "Cook bacon",        text: "Cook bacon until crispy (you may use a skillet on medium-high heat or bake in the oven at 400°F for 15–20 minutes). Chop and set aside, reserving the grease for the chicken.", shortcutText: "no-shortcut" },
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Prepare panko shrimp", text: "Combine 4 tbsp of the flour, 0.5 tsp salt, and 0.25 tsp pepper. Beat the egg in another bowl. Peel the shrimp and coat in the flour mixture, then dip in the egg, and finally coat in the panko crumbs. Fry in the reserved bacon grease (if you don't have enough, you can use a little oil or butter). Cook until golden and crispy (about 2 min per side). Set aside to cool and drain excess oil.", shortcutText: "Cook frozen panko shrimp per package instructions." },
      { name: "Make sauce",        text: "Sauté onion and garlic in butter, then whisk in 2 tbsp of the flour, cooking until bubbly and lightly browned, then add the cream. Melt in Monterey Jack, adding 0.5 tsp of the salt and 0.25 tsp of the pepper, stirring frequently until smooth.", shortcutText: "no-shortcut" },
      { name: "Combine & serve",   text: "Toss pasta and chicken in the sauce, thinning with pasta water if needed until desired consistency is reached. Gently fold in the bacon and panko shrimp, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "garlic-bread-frozen", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Chicken Minestrone ────────────────────────────────────────────────────
  {
    id: "minestrone",
    name: "Chicken Minestrone",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",            quantity: "0.5", unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "zucchini",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "celery",             quantity: "3",   unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "kidney-beans",       quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "3",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "ditalini",         quantity: "7",   unit: "oz",     shortcutSubstitute: "tortellini" },
      { ingredientId: "spinach",            quantity: "0.5", unit: "bag",    shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",    quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Sauté vegetables",  text: "Sauté diced onion, carrots, and celery in olive oil in a large pot until softened.", shortcutText: "no-shortcut" },
      { name: "Add liquids",       text: "Add chicken stock, diced tomatoes, kidney beans, zucchini, salt, and pepper. Bring to a boil.", shortcutText: "no-shortcut" },
      { name: "Add chicken",       text: "Add shredded chicken and ditalini. Cook until the ditalini is al dente. Top with fresh spinach and parmesan cheese if desired, then serve.", shortcutText: "Add shredded rotisserie chicken and tortellini, cooking until the tortellini is soft (up to 8 minutes). Top with fresh spinach and parmesan cheese if desired, then serve." },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "yeast-rolls-frozen", quantity: "0.25", unit: "pkg" },
    ],
  },

  // ── Italian Sausage Soup ──────────────────────────────────────────────────
  {
    id: "italian-sausage-soup",
    name: "Italian Sausage Soup",
    cuisine: "Italian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "hot-italian-sausage",quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "kale",              quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "russet-potatoes",          quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "3",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.75",unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "dried-oregano",            quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "dried-thyme",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Brown sausage",     text: "Brown and break apart the sausage in a large pot. Add the chopped onion and minced garlic, and sauté until soft.", shortcutText: "no-shortcut" },
      { name: "Add base",          text: "Add chicken stock, herbs, and peeled, diced potatoes. Bring to a boil and cook until potatoes are tender, about 15 minutes (in the second half of cooking, add the kale so it has time to soften).", shortcutText: "no-shortcut" },
      { name: "Finish",            text: "Stir in the cream, milk, salt, and pepper. Simmer briefly, about 3 minutes, until heated thoroughly, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "french-bread",         quantity: "0.5", unit: "loaf" },
      { itemId: "bread-sticks-frozen",  quantity: "1",   unit: "pkg" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // AMERICAN — MAINS
  // ════════════════════════════════════════════════════════════════════════════

  // ── Meatloaf ──────────────────────────────────────────────────────────────
  {
    id: "meatloaf",
    name: "Meatloaf",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 8,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 55 },
    ],

    ingredients: [
      { ingredientId: "ground-beef",        quantity: "1.5",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "crackers",           quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "quick-oats",         quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",    quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "worcestershire-sauce",quantity: "0.5",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "2",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "diced-tomatoes",     quantity: "3.5",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "seasoned-salt",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ketchup",            quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "poupon-mustard",     quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix loaf",          text: "Combine ground beef, crushed crackers, oats, diced onion, garlic, egg, grated parmesan, worcestershire, diced tomatoes, and seasoned salt. Mix until combined (you may use your hands to save time, otherwise a baking spatula works well).", shortcutText: "no-shortcut" },
      { name: "Shape & top",       text: "Form into a loaf in a greased baking dish or sheet. Bake at 375°F for 40-45 minutes until internal temp reaches 160°F, making the sauce while you wait (and any desired sides).", shortcutText: "no-shortcut" },
      { name: "Mix & add sauce",        text: "Combine ketchup, poupon mustard, and brown sugar in a small bowl. Mix until combined, spread over the top of the loaf, and return to the oven for 10-15 minutes until the sauce is bubbly and slightly darkened. Let rest up to 10 minutes before slicing.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["mashed-potatoes", "seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "canned-green-beans", quantity: "14", unit: "oz" },
      { itemId: "stuffing-mix",       quantity: "1",  unit: "pkg" },
    ],
  },

  // ── Pot Roast ─────────────────────────────────────────────────────────────
  {
    id: "pot-roast",
    name: "Pot Roast",
    cuisine: "American",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "long",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "cook", minutes: 150 },
    ],

    ingredients: [
      { ingredientId: "beef-chuck-roast",         quantity: "2",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "russet-potatoes",           quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "beef-stock",         quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "dried-thyme",              quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "bay-leaves",         quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "gravy-mix",          quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "2",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "2", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Sear roast",        text: "Season roast with salt and pepper. Sear on all sides in a hot Dutch oven or skillet until browned.", shortcutText: "no-shortcut" },
      { name: "Add vegetables",    text: "Add chopped potatoes, carrots, onion, garlic, thyme, bay leaf, and beef stock to the pot.", shortcutText: "no-shortcut" },
      { name: "Slow cook",         text: "Cover tightly and cook in a 325°F oven for 2–3 hours, or in a slow cooker on low for 8 hours, until beef is fork-tender.", shortcutText: "no-shortcut" },
      { name: "Make gravy",        text: "Prepare gravy mix per package instructions or using the drippings from the pot if desired. Serve over the roast and vegetables.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "stuffing-mix", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Stuffed Pepper Slices ─────────────────────────────────────────────────
  {
    id: "stuffed-peppers",
    name: "Crispy Stuffed Pepper Slices",
    cuisine: "American",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "homemade taco spice blend → taco seasoning packet",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 25 },
      { phase: "bake", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "orange-bell-pepper",  quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "colby-jack-cheese",  quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "omit" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "taco-seasoning-packet" },
      { ingredientId: "ground-cumin",              quantity: "1.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "paprika",            quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "dried-oregano",            quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "cayenne",            quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Toast rice",        text: "Toast dry rice in a dry skillet over medium heat until lightly golden and fragrant, 3–4 minutes.", shortcutText: "" },
      { name: "Cook rice",              text: "Add half the can of el pato sauce, beef stock, and lastly enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Cook filling",      text: "While rice is cooking, brown ground beef with chopped onion and minced garlic. Add chili powder, cumin, paprika, oregano, cayenne, and salt along with the remaining el pato sauce and cooked rice. Stir to combine and heat through (about 2-3 minutes).", shortcutText: "Brown beef, breaking apart, and add taco seasoning packet per package directions, then stir in remaining el pato sauce and cooked rice, heating through (about 2-3 minutes)." },
      { name: "Prepare peppers",   text: "Core the bell peppers carefully and wash out the seeds. Slice each pepper widthwise into rings (about 3-4 per pepper). Arrange the rings flat in a baking dish or sheet, and lightly salt the pepper rings.", shortcutText: "no-shortcut" },
      { name: "Fill & bake",       text: "Sprinkle a small layer of cheese in the bottom of each pepper ring. Spoon the meat filling into each pepper ring, then top with more cheese. Bake at 375°F for 18-22 minutes until peppers are tender and cheese is melted.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["elote"],
    suggestedExtras: [
      { itemId: "refried-beans", quantity: "7", unit: "oz" },
    ],
  },

  // ── Sloppy Joses ──────────────────────────────────────────────────────────
  {
    id: "sloppy-joses",
    name: "Sloppy Joses",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 5 },
      { phase: "cook", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "manwich-sauce",      quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "pickled-jalapenos",  quantity: "1.5", unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "spicy-pickles",      quantity: "0.25",unit: "jar",    shortcutSubstitute: "none" },
      { ingredientId: "hamburger-buns",     quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Brown beef",        text: "Brown ground beef in a skillet over medium heat. Drain excess fat.", shortcutText: "no-shortcut" },
      { name: "Add sauce",         text: "Stir in Manwich sauce and pickled jalapeños. Simmer 5 minutes.", shortcutText: "no-shortcut" },
      { name: "Serve",             text: "Serve on toasted hamburger buns topped with chopped spicy pickles.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bbq-beans", "seasonal-berry-salad", "mac-and-cheese", "deviled-eggs"],
    suggestedExtras: [
      { itemId: "fries",        quantity: "1", unit: "pkg" },
      { itemId: "tots",         quantity: "1", unit: "pkg" },
      { itemId: "onion-rings",  quantity: "1", unit: "pkg" },
      { itemId: "baked-beans",  quantity: "7", unit: "oz" },
    ],
  },

  // ── Salmon BLTs ───────────────────────────────────────────────────────────
  {
    id: "salmon-blts",
    name: "Salmon BLTs",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "salmon-fillet",              quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "romaine-lettuce",            quantity: "0.5", unit: "head",   shortcutSubstitute: "none" },
      { ingredientId: "steak-tomato",        quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "avocado",            quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "bacon",              quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "mayonnaise",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "hamburger-buns",     quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook bacon",        text: "Cook bacon until crispy (you may use a skillet on medium-high heat or bake in the oven at 400°F for 15–20 minutes). Remove the bacon from the grease to drain, reserving the grease for cooking the salmon.", shortcutText: "no-shortcut" },
      { name: "Cook salmon",       text: "Season salmon fillets with salt and pepper. Pan-sear in the bacon grease or bake at 400°F until cooked through, about 4–5 minutes per side.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Toast the buns or sandwich bread. Spread mayo on each bun. Layer lettuce, sliced tomato, avocado, salmon, and bacon.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bbq-beans", "deviled-eggs"],
    suggestedExtras: [
      { itemId: "fries", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Chicago Hot Dog ───────────────────────────────────────────────────────
  {
    id: "chicago-hot-dog",
    name: "Chicago Hot Dog",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 10 },
    ],

    ingredients: [
      { ingredientId: "hot-dogs",           quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "spicy-pickles",      quantity: "0.5",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "peperoncino-peppers",quantity: "0.25",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "roma-tomato",             quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "poupon-mustard",     quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "celery-salt",        quantity: "0.25",unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "poppy-seeds",        quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "hot-dog-buns",       quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook hot dogs",     text: "Steam or boil hot dogs until heated through, 3–5 minutes.", shortcutText: "no-shortcut" },
      { name: "Prep toppings",     text: "Slice tomato into wedges, dice onion, and slice (or chop) pickles. Coat the buns in a thin layer of oil or butter and sprinkle with poppy seeds, then toast in the oven at 350°F for 2-3 minutes.", shortcutText: "Slice tomato into wedges, dice onion, and slice pickles." },
      { name: "Assemble",          text: "Place each hot dog in a bun. Top with mustard, tomato, onion, spicy pickles, peperoncino pepper, and a sprinkle of celery salt, plus more poppy seeds if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bbq-beans"],
    suggestedExtras: [
      { itemId: "baked-beans",  quantity: "7", unit: "oz" },
      { itemId: "onion-rings",  quantity: "1", unit: "pkg" },
      { itemId: "fries",        quantity: "1", unit: "pkg" },
      { itemId: "tots",         quantity: "1", unit: "pkg" },
    ],
  },

  // ── Southwest Chili ───────────────────────────────────────────────────────
  {
    id: "southwest-chili",
    name: "Southwest Chili",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "ranch-style-beans",  quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "black-beans",        quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "frozen-corn",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "green-bell-pepper",   quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "seasoned-salt",      quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "v8-spicy-vegetable-juice",quantity: "12",unit: "oz",  shortcutSubstitute: "none" },
      { ingredientId: "cheddar-cheese",     quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Brown beef",        text: "Brown ground beef and break apart with chopped onion, minced garlic, and chopped bell pepper. Drain excess fat.", shortcutText: "no-shortcut" },
      { name: "Add everything",    text: "Add all beans, corn, diced tomatoes, V8, chili powder, and seasoned salt. Stir to combine.", shortcutText: "no-shortcut" },
      { name: "Simmer & serve",    text: "Simmer on medium heat 15–20 minutes. Serve topped with cheddar cheese and sour cream if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["cornbread-cake"],
    suggestedExtras: [
      { itemId: "corn-chips", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Chicken Pot Pie ───────────────────────────────────────────────────────
  {
    id: "chicken-pot-pie",
    name: "Chicken Pot Pie",
    cuisine: "American",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 40 },
      { phase: "bake", minutes: 35 },
    ],

    ingredients: [
      { ingredientId: "chicken-thighs",      quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "carrots",            quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "russet-potatoes",           quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "celery",             quantity: "6",   unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "frozen-peas",        quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "dried-thyme",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "pie-crust",          quantity: "2",   unit: "crusts",  shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with butter and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Make filling",      text: "Sauté onion, celery, carrots, and potato in butter. Whisk in flour, cook until bubbly and lightly browned, then whisk in milk and cream until smooth. Add the thyme, salt, and pepper, and simmer until thickened to desired consistency.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Press one pie crust into a pie dish. Fill with the chicken mixture, and distribute the peas evenly on top. Cover with the second crust, crimp edges, and brush with egg wash. You may cut a few vents in the top.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Bake at 425°F for 30–35 minutes until crust is golden and filling is bubbling.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["seasonal-berry-salad"],
  },

  // ── French Dips ───────────────────────────────────────────────────────────
  {
    id: "french-dips",
    name: "French Dips",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "expensive",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "roast-beef",         quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "sliced-provolone-cheese",quantity: "1",unit: "pkg",   shortcutSubstitute: "none" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "bread-rolls",        quantity: "6",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "beef-stock",         quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",       quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Make au jus",       text: "Bring beef stock to a simmer in a small saucepan. Season with a pinch of black pepper. Keep warm.", shortcutText: "no-shortcut" },
      { name: "Sauté toppings",    text: "Caramelize sliced onion and mushrooms if using in butter until golden, about 10 minutes.", shortcutText: "no-shortcut" },
      { name: "Warm beef",         text: "Briefly warm deli roast beef in the au jus pot while the bread rolls are being toasted.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Toast bread rolls under a broiler, and quickly layer roast beef and provolone cheese on each roll. Place back under the broiler 1–2 minutes to melt cheese, watching them continuously to avoid burning. Top with caramelized onions and mushrooms if using. Serve with au jus for dipping.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "fries", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Gumbo ─────────────────────────────────────────────────────────────────
  {
    id: "gumbo",
    name: "Gumbo",
    cuisine: "American",
    dishType: "main",
    difficulty: "difficult",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 20 },
      { phase: "cook", minutes: 45 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",            quantity: "0.5", unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "large-shrimp",             quantity: "0.5",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "andouille-sausage",  quantity: "0.5",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "okra",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "green-bell-pepper",  quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "beef-stock",         quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "tapatio",            quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "cajun-seasoning",    quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "curry-leaves",       quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "crab",              quantity: "3.5", unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "bacon-grease",       quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "tomato-sauce",       quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "worcestershire-sauce",quantity: "1",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "apple-cider-vinegar",quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a skillet with butter and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips (or shred it) and set it aside." },
      { name: "Make roux",         text: "Melt bacon grease in a large soup pot or Dutch oven (heavy-bottomed is best). Whisk in flour and cook over medium heat, stirring constantly, until dark brown (about 15 minutes).", shortcutText: "no-shortcut" },
      { name: "Add aromatics",     text: "Add diced onion, bell pepper, and garlic to the roux. Sauté until softened.", shortcutText: "no-shortcut" },
      { name: "Build the gumbo",   text: "Add beef stock, tomato sauce, worcestershire, apple cider vinegar, tapatio, cajun seasoning, curry leaf, salt, and pepper. Stir to combine and bring to a simmer.", shortcutText: "no-shortcut" },
      { name: "Add proteins",      text: "Add the chicken, sliced andouille, okra and crab (I like to sear the okra briefly first in any remaining butter in the chicken skillet). Simmer 20 minutes.", shortcutText: "Add the rotisserie chicken, sliced andouille, okra, and crab." },
      { name: "Finish",            text: "Add shrimp in the last 5 minutes of cooking. Cook until just barely pink. Serve with rice if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["seasonal-berry-salad"],
    suggestedExtras: [
      { itemId: "rice", quantity: "1", unit: "cup" },
    ],
  },

  // ─── AMERICAN — SOUPS ─────────────────────────────────────────────────────

  // ── Chicken Noodle Soup ───────────────────────────────────────────────────
  {
    id: "chicken-noodle-soup",
    name: "Chicken Noodle Soup",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",            quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "extra-wide-egg-noodles",quantity: "0.5",unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "celery",             quantity: "4",   unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "4",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "dried-oregano",             quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a soup pot with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the pot and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side).", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and add it to the pot." },
      { name: "Add vegetables",    text: "Add chicken stock, diced carrots, celery, and onion to the pot and season with oregano and more salt and pepper. Bring to a boil.", shortcutText: "no-shortcut" },
      { name: "Add noodles",       text: "Add egg noodles, submerging them as much as possible in the broth, and cook a few more minutes until tender.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
    suggestedExtras: [
      { itemId: "yeast-rolls-frozen", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Cheesy Ham Potato Soup ────────────────────────────────────────────────
  {
    id: "potato-soup",
    name: "Cheesy Ham Potato Soup",
    cuisine: "American",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 30 },
    ],

    ingredients: [
      { ingredientId: "ham-steak",               quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "bacon",              quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "russet-potatoes",           quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cheddar-cheese",     quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook bacon",        text: "Cook bacon until crispy (you may use a skillet on medium-high heat or bake in the oven at 400°F for 15–20 minutes). Chop the bacon and set aside, reserving some of the grease for the soup.", shortcutText: "no-shortcut" },
      { name: "Sauté onion",       text: "Sauté diced onion in the bacon fat until softened.", shortcutText: "no-shortcut" },
      { name: "Simmer potatoes",   text: "Add chicken stock and diced potatoes. Bring to a boil and cook until potatoes are tender, about 15 minutes. For a thick, chunky consistency, mash the potatoes only partly, or mash them completely for a smooth texture.", shortcutText: "no-shortcut" },
      { name: "Finish",            text: "Stir in cream, milk, diced ham, salt, pepper, and cheddar cheese. Simmer until melted, well incorporated, and heated through. Top with bacon and green onions, or fold them in if desired, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
    suggestedExtras: [
      { itemId: "yeast-rolls-frozen", quantity: "0.25", unit: "pkg" },
    ],
  },

  // ── Chicken and Dumplings ─────────────────────────────────────────────────
  {
    id: "chicken-and-dumplings",
    name: "Chicken and Dumplings",
    cuisine: "American",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 20 },
      { phase: "cook", minutes: 45 },
    ],

    ingredients: [
      { ingredientId: "chicken-thighs",      quantity: "1", unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "carrots",            quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "celery",             quantity: "3",   unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "russet-potatoes",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "3",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "dried-thyme",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "shortening",         quantity: "3",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Coat a soup pot with oil and heat on the stove to medium-high heat. Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the pot and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side).", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips (or shred it) and add it to the pot." },
      { name: "Make broth",        text: "Add the chicken stock, and chopped carrots, celery, and potatoes, seasoning with thyme, salt and pepper. Bring to a simmer and cook until vegetables are tender. Stir in the cream and milk.", shortcutText: "no-shortcut" },
      { name: "Make dumpling batter",text: "Mix flour, baking powder, salt, and shortening until crumbly. Add the milk and mix until combined to form a sticky dough.", shortcutText: "no-shortcut" },
      { name: "Add dumplings",     text: "Drop spoonfuls of dumpling batter onto the simmering broth. Cover tightly and cook without lifting the lid for 15 minutes. Remove from heat, allow to rest for up to 5 minutes, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["caesar-salad"],
  },

  // ─── AMERICAN — SIDES ─────────────────────────────────────────────────────

  // ── BBQ Beans ─────────────────────────────────────────────────────────────
  {
    id: "bbq-beans",
    name: "BBQ Beans",
    cuisine: "American",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 30 },
    ],

    ingredients: [
      { ingredientId: "pinto-beans",        quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "chili-beans",        quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "beef-smokies",       quantity: "0.5",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "celery",             quantity: "2", unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "0.5",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.25",unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "0.25",unit: "cup",    shortcutSubstitute: "bbq-sauce" },
      { ingredientId: "ketchup",            quantity: "0.25",unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "poupon-mustard",     quantity: "2",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "worcestershire-sauce",quantity: "0.5",  unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salted-butter",             quantity: "5",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "chipotle-peppers",   quantity: "1.5", unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "dried-chilies",      quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "molasses",           quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Prepare sauce", text:"In a pot on medium heat, add 1 tsp of the butter and the dried chilies, toasting them until fragrant, and add the chipotle peppers, cooking another minute or two until warmed through. Transfer the pepper mixture to a blender, and blend until smooth (if needed,adding more of the butter melted). Leave the mixture in the blender for later.", shortcutText: ""},
      { name: "Make the aromatics", text: "In a pot on medium heat coated with 1 tbsp of the butter, add the diced onion, minced garlic, and diced jalapeno, and cook until softened, seasoning with salt and pepper.", shortcutText: "no-shortcut" },
      { name: "Combine",           text: "Rinse and add all the beans to the pot. Chop and add the smokies and the sauce to the pot, along with the pepper mixture from the blender, any remaining butter, the brown sugar, ketchup, poupon mustard, worcestershire sauce, and molasses. Stir to combine and bring to a simmer.", shortcutText: "Rinse and add all the beans to the pot. Chop and add the smokies and the sauce to the pot, along with the bbq sauce of preference." },
      { name: "Simmer",            text: "Cook over medium-low heat for 20–30 minutes, stirring occasionally, until thoroughly incorporated and fragrant, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Mashed Potatoes ───────────────────────────────────────────────────────
  {
    id: "mashed-potatoes",
    name: "Mashed Potatoes",
    cuisine: "American",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "russet-potatoes",           quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "gravy-mix",          quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Boil potatoes",     text: "Peel and cube potatoes. Boil in salted water until fork-tender, about 15–20 minutes. Drain.", shortcutText: "no-shortcut" },
      { name: "Mash",              text: "Mash with salt, pepper, butter, milk, and sour cream if desired, until smooth and creamy.", shortcutText: "no-shortcut" },
      { name: "Make gravy",        text: "Prepare gravy mix per package instructions and serve alongside.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Cornbread Cake ────────────────────────────────────────────────────────
  {
    id: "cornbread-cake",
    name: "Cornbread Cake",
    cuisine: "American",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 6,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "cornmeal",           quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "1.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "0.5",unit: "cup",  shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "0.33",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "3",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "honey",              quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "1.25",unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix dry",           text: "Whisk together cornmeal, flour, sugar, and baking powder in a small bowl.", shortcutText: "no-shortcut" },
      { name: "Mix wet",           text: "In a larger bowl, whisk together oil, melted butter, honey, eggs, and milk.", shortcutText: "no-shortcut" },
      { name: "Combine & bake",    text: "Fold the dry mixture into the wet mixture with a spatula until just combined. Pour into a greased 9x9 pan. Bake at 400°F for 20–25 minutes until a toothpick comes out clean.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Deviled Eggs ──────────────────────────────────────────────────────────
  {
    id: "deviled-eggs",
    name: "Deviled Eggs",
    cuisine: "American",
    dishType: "snack",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "eggs",              quantity: "6",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "mayonnaise",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "poupon-mustard",     quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "apple-cider-vinegar",quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "paprika",            quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-pepper",              quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Hard boil",         text: "Place eggs in a pot of cold water, bring to a boil, cook 10 minutes, then transfer to an ice bath to cool. Peel.", shortcutText: "no-shortcut" },
      { name: "Fill",              text: "Halve eggs lengthwise. Remove yolks and mash with mayo, mustard, apple cider vinegar, salt, and pepper until smooth.", shortcutText: "no-shortcut" },
      { name: "Pipe & garnish",    text: "Spoon or pipe yolk mixture back into the egg whites. Dust with paprika and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ─── AMERICAN — DESSERTS & BREAKFAST ─────────────────────────────────────

  // ── Seasonal Berry Salad ──────────────────────────────────────────────────
  {
    id: "seasonal-berry-salad",
    name: "Seasonal Berry Salad",
    cuisine: "American",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
    ],

    ingredients: [
      { ingredientId: "raspberries",            quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",    quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "pecans",              quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cucumber",           quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "romaine-lettuce",            quantity: "0.5", unit: "head",   shortcutSubstitute: "none" },
      { ingredientId: "spinach",            quantity: "0.5", unit: "bag",    shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "balsamic-vinegar",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "raspberry-jam",               quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Make dressing",     text: "Whisk together olive oil, balsamic vinegar, and jam until smooth.", shortcutText: "no-shortcut" },
      { name: "Toss & serve",      text: "Combine chopped lettuce, spinach, berries, sliced cucumber, sliced red onion, nuts, and parmesan in a bowl. Dress lightly and toss.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Fruit Smoothie ────────────────────────────────────────────────────────
  {
    id: "fruit-smoothie-beverage",
    name: "Fruit Smoothie",
    cuisine: "American",
    dishType: "beverage",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 5 },
    ],

    ingredients: [
      { ingredientId: "frozen-berries",     quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "bananas",            quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "honey",              quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "yogurt",             quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Blend",             text: "Combine all ingredients in a blender. Blend until smooth. Add more milk to thin if needed.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Chocolate Chip Cookies ────────────────────────────────────────────────
  {
    id: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    cuisine: "American",
    dishType: "dessert",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 24,
    batchSize: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "chocolate-chips",    quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix ingredients",text: "Mix softened butter, both sugars, beaten eggs, vanilla, flour, baking soda, and salt until thoroughly combined. Fold in the chocolate chips.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Drop by spoonfuls onto parchment-lined baking sheets. Bake at 375°F for 8–11 minutes until desired doneness. Cool on the pan 5 minutes.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Cinnamon Rolls ────────────────────────────────────────────────────────
  {
    id: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    cuisine: "American",
    dishType: "breakfast",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "long",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 50 },
      { phase: "rise", minutes: 150 },
      { phase: "rise", minutes: 50 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "16",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "active-dry-yeast",              quantity: "4",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "ground-cinnamon",           quantity: "12",  unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "cream-cheese",       quantity: "16",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "powdered-sugar",     quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Make dough",        text: "Dissolve a teaspoon of the sugar in warm milk and sprinkle the yeast accross the top of the milk, waiting afterwards to ensure that it activates (allow the yeast to sit for at least 5 minutes. If it has not developed a foamy appearance after 15, throw it out and try again with new yeast). Mix the yeast milk with the flour, softened butter, sugar, salt, and eggs. Knead until elastic or use a stand mixer with the dough hook to knead until smooth and elastic.", shortcutText: "no-shortcut" },
      { name: "First rise",        text: "Cover dough and let rise in a warm place until at least doubled, about 2-4 hours.", shortcutText: "no-shortcut" },
      { name: "Make filling",       text: "Mix the remaining softened butter, brown sugar, and cinnamon until mixed evenly.", shortcutText: "no-shortcut" },
      { name: "Fill & roll",       text: "Roll dough into a 1/4 inch thick rectangle. Spread with the filling as evenly as possible. Roll tightly into a log and slice into rolls.", shortcutText: "no-shortcut" },
      { name: "Second rise",       text: "Place rolls in a greased or parchment-lined baking dish or sheet. Cover and let rise another 45–60 minutes.", shortcutText: "no-shortcut" },
      { name: "Bake & frost",      text: "Bake at 375°F for 20–25 minutes until golden. Beat cream cheese with powdered sugar and vanilla. Frost the rolls while warm and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Homemade Donuts ───────────────────────────────────────────────────────
  {
    id: "donuts",
    name: "Homemade Donuts",
    cuisine: "American",
    dishType: "dessert",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "powdered-sugar",     quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.25",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Make batter",       text: "Mix the flour, baking soda, and a pinch of salt. Combine with egg and sour cream until a soft, sticky dough forms.", shortcutText: "no-shortcut" },
      { name: "Cut & fry",         text: "Roll dough to ½ inch thick on a floured surface. Cut into rounds with a donut cutter. Heat oil to 375°F. Fry donuts 1–2 minutes per side until golden.", shortcutText: "no-shortcut" },
      { name: "Dust & serve",      text: "Drain on paper towels. Dust generously with powdered sugar while warm.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Peanut Butter Brownies ────────────────────────────────────────────────
  {
    id: "peanut-butter-brownies",
    name: "Peanut Butter Brownies",
    cuisine: "American",
    dishType: "dessert",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 16,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "bake", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cocoa-powder",       quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "peanut-butter-mms",  quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix",               text: "Stir together flour, cocoa, sugar, baking powder, oil, and vanilla until combined (batter will be thick). Fold in peanut butter M&Ms.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Spread into a greased 9x13 baking dish. Bake at 350°F for 20–25 minutes until a toothpick comes out with moist crumbs.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Oatmeal Cookies ───────────────────────────────────────────────────────
  {
    id: "oatmeal-cookies",
    name: "Oatmeal Cookies",
    cuisine: "American",
    dishType: "dessert",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 24,
    batchSize: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "quick-oats",         quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "all-purpose-flour",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "raisins",            quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix ingredients",           text: "Mix the softened butter, both sugars, eggs, vanilla, flour, baking soda, and salt until thoroughly combined. Fold in oats and raisins.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Drop by spoonfuls onto greased baking sheets. Bake at 375°F for 9–12 minutes until desired doneness.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Molasses Cookies ──────────────────────────────────────────────────────
  {
    id: "molasses-cookies",
    name: "Molasses Cookies",
    cuisine: "American",
    dishType: "dessert",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 24,
    batchSize: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "shortening",         quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "molasses",           quantity: "0.25",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "2",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ground-cinnamon",           quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ground-cloves",             quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-ginger",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix ingredients",           text: "Mix the softened butter, shortening, brown sugar, eggs, molasses, flour, baking soda, cinnamon, ginger, cloves, and salt until thoroughly combined.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Roll into 1-inch balls, roll in sugar, and place on baking sheets. Bake at 375°F for 8–10 minutes until crinkled. Do not overbake.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Blueberry Muffins ─────────────────────────────────────────────────────
  {
    id: "blueberry-muffins",
    name: "Blueberry Muffins",
    cuisine: "American",
    dishType: "breakfast",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 22 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "buttermilk",         quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "blueberries",        quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix wet",           text: "Cream the softened butter and sugar till fluffy, then beat in the eggs, buttermilk, and vanilla until just combined.", shortcutText: "no-shortcut" },
      { name: "Mix dry",           text: "In a separate bowl, whisk together the flour, baking powder, and baking soda, making a well in the center for the wet ingredients. Pour the wet ingredients into the well and gently fold until just combined. Gently fold in blueberries.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Fill greased or lined muffin tin ¾ full. Bake at 375°F for 20–22 minutes until a toothpick comes out clean.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Chocolate Cherry Muffins ──────────────────────────────────────────────
  {
    id: "chocolate-cherry-muffins",
    name: "Chocolate Cherry Muffins",
    cuisine: "American",
    dishType: "breakfast",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 22 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "cocoa-powder",       quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "chocolate-chips",    quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "cherries",           quantity: "1",   unit: "cup",    shortcutSubstitute: "frozen-cherries" },
      { ingredientId: "almond-extract",     quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "muffin-cupcake-liners",quantity: "1", unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix wet",           text: "Whisk together the oil, sugar, eggs, milk, sour cream, vanilla, and almond extract in a small bowl.", shortcutText: "no-shortcut" },
      { name: "Mix dry",           text: "In a separate larger bowl, whisk together the flour, cocoa, baking powder, baking soda, and salt, making a well in the center for the wet ingredients. Pour the wet ingredients into the well and gently fold until just combined.", shortcutText: "no-shortcut" },
      { name: "Add mix-ins",       text: "Gently fold in chocolate chips and pitted, chopped cherries.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Line a muffin tin with liners. Fill ¾ full. Bake at 375°F for 20–22 minutes.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Lemon Poppy Seed Muffins ──────────────────────────────────────────────
  {
    id: "lemon-poppy-seed-muffins",
    name: "Lemon Poppy Seed Muffins",
    cuisine: "American",
    dishType: "breakfast",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 22 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-powder",      quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "whole-milk",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "sour-cream",         quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "lemon-juice",        quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "poppy-seeds",        quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "vegetable-oil",      quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "vanilla-extract",    quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "muffin-cupcake-liners",quantity: "1", unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mix wet",           text: "Whisk together oil, sugar, eggs, milk, sour cream, lemon juice, and vanilla.", shortcutText: "no-shortcut" },
      { name: "Mix dry",           text: "In a separate bowl, whisk together the flour, baking powder, baking soda, poppy seeds, and salt, making a well in the center for the wet ingredients. Pour the wet ingredients into the well and gently fold until just combined.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Line muffin tin with liners. Fill ¾ full. Bake at 375°F for 20–22 minutes.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Banana Bread ──────────────────────────────────────────────────────────
  {
    id: "banana-bread",
    name: "Banana Bread",
    cuisine: "American",
    dishType: "breakfast",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 8,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
      { phase: "bake", minutes: 60 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "baking-soda",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "bananas",            quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "16",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "nuts",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.25", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Mash & mix",        text: "Mash ripe bananas thoroughly. Mix in melted butter, sugar, eggs, flour, baking soda, and salt until thoroughly combined. Fold in nuts if using.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Pour into a greased loaf pan. Bake at 350°F for 55–65 minutes until a toothpick comes out clean. Cool before slicing.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INDIAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Chicken Tikka Masala ──────────────────────────────────────────────────
  {
    id: "chicken-tikka-masala",
    name: "Chicken Tikka Masala",
    cuisine: "Indian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken; homemade masala sauce → store-bought tikka masala sauce",
    servings: 4,
    timeToComplete: [
      { phase: "prep",     minutes: 15 },
      { phase: "marinate", minutes: 60 },
      { phase: "cook",     minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "chicken-thighs",     quantity: "1",   unit: "lb",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "rice",               quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "4",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "tomato-sauce",       quantity: "7",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "tomato-paste",       quantity: "3",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "heavy-whipping-cream",quantity: "0.5",unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",     quantity: "1",   unit: "tsp",    shortcutSubstitute: "sadaf-tikka-masala-seasoning" },
      { ingredientId: "garam-masala",     quantity: "2",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "ground-cumin",            quantity: "2",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "ground-coriander",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",             quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "yogurt",           quantity: "1", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "ginger-root",       quantity: "4",   unit: "tbsp",   shortcutSubstitute: "ginger-paste" },
      { ingredientId: "cilantro",         quantity: "1",   unit: "bunch",  shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Marinate & cook chicken",      text: "Trim excess fat and slice chicken into strips. Mix the garlic, ginger, chili powder, garam masala, cumin, coriander, and salt. Divide the spice mixture in half, and set half aside. Add the other half to the yogurt and mix until combined. Add the yogurt mixture and the chicken to a bowl or bag, combining them thoroughly, and allow the chicken to marinate for at least 1 hour before cooking. In a skillet coated with olive oil on medium-high heat, add the chicken and allow to cook untouched until developing a crust, continuing to sauté until golden brown (you may need to cook in multiple batches to ensure even crispiness), then set aside.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set aside." },
      { name: "Cook rice",              text: "While chicken is cooking, wash and add the rice and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Make masala sauce", text: "Sauté diced onion in the butter. Add tomato paste, tomato sauce, and the remaining tikka masala seasoning. Simmer 10 minutes, then transfer to a blender. Blend until smooth, return to the pan, and stir in the heavy cream and chicken.", shortcutText: "Sauté diced onion in the butter. Add either the tomato paste, tomato sauce, and sadaf seasoning mix or the store-bought tikka masala sauce in the pan until heated thoroughly. Transfer to a blender and blend until smooth, then return to the pan and stir in the heavy cream and chicken." },
      { name: "Toppings & serve", text: "Fluff the rice once it is finished cooking and the tikka masala is heated through. Serve the tikka masala over rice topped with fresh cilantro if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["daal", "chana-masala"],
    suggestedExtras: [
      { itemId: "dawn-paratha", quantity: "0.25", unit: "pkg" },
      { itemId: "naan",         quantity: "0.5",  unit: "pkg" },
    ],
  },

  // ── Daal ──────────────────────────────────────────────────────────────────
  {
    id: "daal",
    name: "Daal",
    cuisine: "Indian",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "yellow-lentils",     quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "cumin-seed",         quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "black-mustard-seed", quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "1",   unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",             quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Simmer lentils",    text: "Combine yellow lentils with chicken stock and bring to a boil. Simmer 20–25 minutes until soft and creamy, meanwhile preparing and adding the spices.", shortcutText: "no-shortcut" },
      { name: "Temper & add spices",     text: "Heat 1 tbsp of butter in a small pan. Add cumin seeds and mustard seeds and cook until they pop. Add chopped onion, minced garlic, and diced jalapeño and sauté until golden. Add the tempered spices, salt, and remaining butter to the lentils while they continue to cook until desired doneness. If desired, transfer to a blender and blend until smooth. Serve and top with fresh cilantro if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Chana Masala ──────────────────────────────────────────────────────────
  {
    id: "chana-masala",
    name: "Chana Masala",
    cuisine: "Indian",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "chickpeas",          quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "apple-cider-vinegar",quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "1",   unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ground-coriander",          quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Sauté aromatics",   text: "Sauté chopped onion, minced garlic, diced jalapeño, and drained chickpeas in olive oil until golden.", shortcutText: "no-shortcut" },
      { name: "Add chickpeas",     text: "Add tomato sauce, chicken stock, cumin, coriander, salt, and apple cider vinegar. Stir to combine.", shortcutText: "no-shortcut" },
      { name: "Simmer & serve",    text: "Simmer 15–20 minutes until sauce is well incorporated and heated through. Top with fresh cilantro if desired and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Chicken Poori Chana ───────────────────────────────────────────────────
  {
    id: "chicken-chana",
    name: "Chicken Poori Chana",
    cuisine: "Indian",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "fresh chicken, roasted → rotisserie chicken",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "chicken-thighs",      quantity: "0.5", unit: "whole",  shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "chickpeas",          quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "apple-cider-vinegar",quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "el-pato-tomato-sauce",quantity: "3",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "1",   unit: "bunch",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "jalapeno",           quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "ground-coriander",          quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "dawn-paratha",       quantity: "0.25",unit: "pkg",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Sauté aromatics",   text: "Sauté chopped onion, minced garlic, diced jalapeño, and drained chickpeas in olive oil until golden.", shortcutText: "no-shortcut" },
      { name: "Add chickpeas",     text: "Add tomato sauce, chicken stock, cumin, coriander, salt, and apple cider vinegar. Stir to combine, then add the chicken. Simmer 15–20 minutes until sauce is well incorporated and heated through.", shortcutText: "no-shortcut" },
      { name: "Toppings & sides",       text: "Top with cilantro if desired. Serve with warm flaky paratha for dipping.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
    suggestedExtras: [
      { itemId: "rice", quantity: "1", unit: "cup" },
    ],
  },

  // ── Yellow Turmeric Curry ─────────────────────────────────────────────────
  {
    id: "yellow-curry",
    name: "Yellow Turmeric Curry",
    cuisine: "Indian",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 20 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",     shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "russet-potatoes",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "coconut-milk",       quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",          quantity: "4",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "ginger-paste",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "shallots",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-chilies",        quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "shredded-coconut",   quantity: "0.25",unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "sriracha",           quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "dates",              quantity: "2",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "tamarind",           quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "turmeric",           quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "ground-cumin",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "fennel-seeds",quantity: "1",unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "cardamom-pods",      quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "curry-leaves",       quantity: "3",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-sugar",        quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet with half the butter and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Cook rice",              text: "While chicken is cooking, wash and add the rice and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Build curry base",  text: "Sauté the shallots, dried chilies, and crushed cardamom pods, in the remaining butter until golden. Add turmeric, cumin, fennel seeds, chili powder, salt and brown sugar. Stir 1 minute. Add chopped, shredded coconut, dates and tamarind if using, then transfer to a blender and blend until smooth.", shortcutText: "no-shortcut" },
      { name: "Add coconut milk",  text: "Return the sauce to the skillet, add the chicken and the curry leaves, and pour in coconut milk and chicken stock. Add chopped potatoes and carrots and simmer 15-20 minutes until the vegetables are tender.", shortcutText: "no-shortcut" },
      { name: "Serve",             text: "Add siracha to taste, if desired. Fluff the rice and serve the curry over the rice.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["fatoush-salad"],
    suggestedExtras: [
      { itemId: "naan",         quantity: "0.5",  unit: "pkg" },
      { itemId: "dawn-paratha", quantity: "0.25", unit: "pkg" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ASIAN — CHINESE
  // ════════════════════════════════════════════════════════════════════════════

  // ── Chicken Stir Fry (noodle) ─────────────────────────────────────────────
  {
    id: "chicken-stir-fry",
    name: "Chicken Stir Fry",
    cuisine: "Chinese",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "possible",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "broccoli",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "yellow-bell-pepper", quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "snow-peas",          quantity: "1",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "jalapeno",           quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "bean-sprouts",       quantity: "1",   unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "soy-sauce",          quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "teriyaki-sauce",     quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "2",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "ginger-root",        quantity: "1",   unit: "tsp",    shortcutSubstitute: "ginger-paste" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-fish-paste",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "msg",               quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "sesame-oil",         quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "rice-noodles",       quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "sweet-chili-sauce",  quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
    ],

    steps: [
      
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet with olive oil and cook until browned on both sides, seasoning with salt and pepper (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Stir fry vegetables",text: "In the same pan with remaining olive oil, stir fry chopped onion, carrots, broccoli, bell pepper, mushrooms, snow peas, diced jalapeno, minced garlic, and ginger over high heat 3–4 minutes (you may have to do this in batches).", shortcutText: "no-shortcut" },
      { name: "Soak noodles",      text: "Prepare rice noodles by soaking or boiling in a pot of water 5–8 minutes, until desired doneness. Drain and set aside.", shortcutText: "no-shortcut" },
      { name: "Combine",           text: "Return chicken and noodles to the pan. Add soy sauce, teriyaki sauce, fish paste if using, sesame oil, salt and MSG. Toss everything together over high heat 1–2 minutes.", shortcutText: "no-shortcut" },
      { name: "Finish & toppings",            text: "Add bean sprouts in the final 30 seconds and serve with sweet chili sauce if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bao-buns"],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Bao Buns ──────────────────────────────────────────────────────────────
  {
    id: "bao-buns",
    name: "Bao Buns",
    cuisine: "Chinese",
    dishType: "side",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 25 },
      { phase: "cook", minutes: 330 },
      { phase: "rise", minutes: 30 },
      { phase: "cook", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "active-dry-yeast",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "pork-shoulder",      quantity: "1", unit: "lb",      shortcutSubstitute: "pulled-pork" },
      { ingredientId: "chicken-stock",      quantity: "0.5", unit: "cup",      shortcutSubstitute: "none" },
      { ingredientId: "ginger-root",        quantity: "1",   unit: "knob",   shortcutSubstitute: "ginger-paste" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "jalapeno",           quantity: "0.5",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "sesame-seeds",       quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "soy-sauce",          quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "sesame-oil",         quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "bbq-sauce",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",              quantity: "0.25", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Cook pork",        text: "Pour the sesame oil into a slow cooker. Rub the grated ginger, salt and pepper onto the pork, and place the pork into the slow cooker. Pour the chicken stock, soy sauce, and bbq sauce into the slow cooker. Cover and cook on high for 5-6 hours until the pork is tender. Pull the pork apart with two forks, and return to the juices, mixing in the diced green onions and jalapeno, and sesame seeds.", shortcutText: "Separate the meat from a store-bought pulled pork, add the included sauce or bbq sauce of your choice, along with the ginger, sesame oil, soy sauce, diced green onions and jalapeno, and sesame seeds." },
      { name: "Make dough",        text: "Dissolve yeast in warm water with sugar. Mix in the flour, kneading until a smooth dough forms (knead about 5 minutes). Cover and let dough rest at least 30 minutes or until doubled in size.", shortcutText: "no-shortcut" },
      { name: "Fill & shape",     text: "Divide dough into small rounds (usually 16 pieces per cup of flour). Lightly flour a clean surface and roll out each piece into a circle, a bit thinner on the outer edge than in the center. Scoop about a tablespoon of filling into the center and fold the dough, gathering and pinching the edges together to seal (wetting your fingers slightly with water before pinching can help the edges to stick). You may cut a small piece of parchment paper to place each bun on to help prevent it sticking to the steamer.", shortcutText: "no-shortcut" },
      { name: "Steam",     text: "Place the buns on a steamer basket and steam for 10-12 minutes until puffed. If you do not have a steamer, you can use a large skillet or pot with 3 wads of foil inside. Pour water into the pot (not quite enough to submerge the foil) and place a plate on top of the foil. Bring the water to a boil, arrange some of the buns on the plate (leave room for them to grow in size) and cover the pot to steam (same duration).", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Shrimp Fried Rice ─────────────────────────────────────────────────────
  {
    id: "shrimp-fried-rice",
    name: "Shrimp Fried Rice",
    cuisine: "Chinese",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 45 },
    ],

    ingredients: [
      { ingredientId: "rice",              quantity: "2",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "large-shrimp",             quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "ham-steak",               quantity: "0.5", unit: "lb",     shortcutSubstitute: "omit" },
      { ingredientId: "snow-peas",          quantity: "1",   unit: "cup",    shortcutSubstitute: "frozen-peas" },
      { ingredientId: "carrots",            quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "soy-sauce",          quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "teriyaki-sauce",     quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "1",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "msg",               quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Toast rice",        text: "Toast dry rice in a large dry skillet or wok over medium heat until lightly golden and fragrant, 3–4 minutes.", shortcutText: "" },
      { name: "Cook rice",              text: "Add the soy sauce and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Scramble eggs",     text: "Scramble eggs on medium heat in a wok or the large skillet with a little oil. Set aside.", shortcutText: "no-shortcut" },
      { name: "Fry vegetables & rice",          text: "Increase heat to medium-high and stir fry chopped onion, carrots, peas, and ham in oil, 4-5 minutes. Add the rice, more oil, and cook for another 2-3 minutes (you might need to do this in batches).", shortcutText: "no-shortcut" },
      { name: "Add shrimp",      text: "Add shrimp, salt, MSG, teriyaki sauce, and diced green onions. Cook until shrimp are pink and fold in the scrambled eggs, then serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bao-buns"],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ASIAN — KOREAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Korean Beef ───────────────────────────────────────────────────────────
  {
    id: "korean-beef",
    name: "Korean Beef",
    cuisine: "Korean",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 5 },
      { phase: "cook", minutes: 25 },
    ],

    ingredients: [
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "romaine-lettuce",            quantity: "0.5", unit: "head",   shortcutSubstitute: "omit" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "soy-sauce",          quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "teriyaki-sauce",     quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "ginger-root",        quantity: "1",   unit: "tbsp",   shortcutSubstitute: "ginger-paste" },
      { ingredientId: "sesame-oil",         quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "sesame-seeds",       quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "brown-sugar",        quantity: "3",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "thai-chilies",       quantity: "3",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "sriracha",           quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "msg",               quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Cook rice",              text: "Wash and add the rice and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Brown beef",        text: "Brown and break apart ground beef with minced garlic and grated ginger. Drain excess fat.", shortcutText: "no-shortcut" },
      { name: "Season",            text: "Add soy sauce, teriyaki sauce, brown sugar, sesame oil, Thai chilies, sriracha, salt, half the sesame seeds, and MSG. Stir and simmer 3–4 minutes until fragrant.", shortcutText: "no-shortcut" },
      { name: "Serve",             text: "Serve beef over rice, wrapped in lettuce leaves (or with chopped lettuce). Top with diced green onions, cilantro, and remaining sesame seeds.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
    suggestedExtras: [
      { itemId: "kimchi", quantity: "3", unit: "oz" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ASIAN — JAPANESE
  // ════════════════════════════════════════════════════════════════════════════

  // ── Pork Ramen ────────────────────────────────────────────────────────────
  {
    id: "pork-ramen",
    name: "Pork Ramen",
    cuisine: "Japanese",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "expensive",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep",     minutes: 15 },
      { phase: "marinate", minutes: 30 },
      { phase: "cook",     minutes: 35 },
    ],

    ingredients: [
      { ingredientId: "ramen-noodles",      quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "pork-belly",         quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "eggs",              quantity: "4",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "bok-choy",           quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "soy-sauce",          quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "carrots",            quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "shiitake-mushrooms", quantity: "1",   unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "nori",              quantity: "1",   unit: "pkg",    shortcutSubstitute: "omit" },
      { ingredientId: "sriracha",           quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "fish-sauce",         quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "tonkatsu-pork-stock",quantity: "3",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "msg",               quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Soft boil eggs",    text: "Bring water to a boil. Gently lower eggs in and cook exactly 6–7 minutes. Transfer to an ice bath. Peel and soak in soy sauce + water for up to 30 minutes.", shortcutText: "no-shortcut" },
      { name: "Cook pork belly",   text: "Slice pork belly into thick strips. Sear on medium-high heat in a pan on all sides until golden and cooked through.", shortcutText: "no-shortcut" },
      { name: "Make broth",        text: "Combine tonkatsu stock, water, soy sauce, fish sauce, garlic, salt, and MSG in a pot. Bring to a gentle simmer.", shortcutText: "no-shortcut" },
      { name: "Add vegetables",       text: "Add sliced carrots, bok choy, shiitake mushrooms, and green onions to the broth and cook until tender.", shortcutText: "no-shortcut" },
      { name: "Add noodles",       text: "Add the ramen noodles and cook until desired tenderness or per package instructions.", shortcutText: "no-shortcut" },
      { name: "Assemble",          text: "Serve the ramen and vegetables, topping with the pork belly, halved soft-boiled eggs, nori if using, and sriracha if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bao-buns"],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THAI
  // ════════════════════════════════════════════════════════════════════════════

  // ── Thai Red Curry ────────────────────────────────────────────────────────
  {
    id: "thai-red-curry",
    name: "Thai Red Curry",
    cuisine: "Thai",
    dishType: "main",
    difficulty: "difficult",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "homemade red curry paste → store-bought Thai red curry paste",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 25 },
      { phase: "cook", minutes: 45 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",     shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "zucchini",           quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "brown-onion",              quantity: "0.5", unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "green-bell-pepper",  quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-chilies",        quantity: "6",   unit: "whole",  shortcutSubstitute: "thai-red-curry-paste" },
      { ingredientId: "garlic",             quantity: "4",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "coconut-milk",       quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-fish-paste",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "shrimp-paste",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "ginger-paste",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "lemongrass",         quantity: "0.5", unit: "stalk",  shortcutSubstitute: "omit" },
      { ingredientId: "cilantro",           quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "shallots",           quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "ground-coriander",          quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "ground-cumin",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "lime-leaves",        quantity: "3-5", unit: "whole",    shortcutSubstitute: "omit" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "msg",               quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Make curry paste",  text: "Blend red chilies, shallots, garlic, lemongrass, ginger paste, shrimp paste, brown fish paste, cumin, and coriander into a paste using a food processor, blender, or mortar. If it is too thick to blend, you can add water sparingly until it blends.", shortcutText: "Use 2–3 tbsp of store-bought Thai red curry paste — skip the paste-making step." },
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet with olive oil and cook until browned on both sides, seasoning with salt (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Cook rice",              text: "While chicken is cooking, wash and add the rice and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Cook curry",        text: "Fry curry paste in oil 2–3 minutes. Add coconut milk and bring to a simmer. Add the chicken, chopped bell pepper, sliced zucchini, and chopped onion.", shortcutText: "no-shortcut" },
      { name: "Season",            text: "Add lime leaves, salt and MSG, and simmer until vegetables are tender, 15–20 minutes. Add lime juice if desired. Fluff the rice when finished and serve the curry over it, topped with cilantro if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Thai Green Curry ──────────────────────────────────────────────────────
  {
    id: "thai-green-curry",
    name: "Thai Green Curry",
    cuisine: "Thai",
    dishType: "main",
    difficulty: "difficult",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: "homemade green curry paste → store-bought Thai green curry paste",
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 25 },
      { phase: "cook", minutes: 45 },
    ],

    ingredients: [
      { ingredientId: "chicken-breast",     quantity: "1",   unit: "lb",     shortcutSubstitute: "rotisserie-chicken" },
      { ingredientId: "bamboo-shoots",      quantity: "7",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "green-beans",        quantity: "1.5", unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "cilantro",           quantity: "1",   unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "asian-eggplant",     quantity: "2",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "thai-basil-leaves",  quantity: "1",   unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "coriander-leaves",   quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "thai-chilies",       quantity: "6",   unit: "whole",  shortcutSubstitute: "thai-green-curry-paste" },
      { ingredientId: "garlic",             quantity: "4",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "lemongrass",         quantity: "0.5", unit: "stalk",  shortcutSubstitute: "omit" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "fish-sauce",         quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "brown-fish-paste",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "shrimp-paste",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "coconut-milk",       quantity: "14",  unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "shallots",           quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "ginger-paste",       quantity: "0.5", unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "msg",               quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Make green paste",  text: "Blend Thai chilies, shallots, garlic, lemongrass, ginger paste, shrimp paste, fish paste, lime zest, half the basil leaves, half the cilantro, and half the coriander leaves into a smooth paste using a food processor, blender, or mortar. If it is too thick to blend, you can add water sparingly until it blends.", shortcutText: "Use 2–3 tbsp of store-bought Thai green curry paste — skip the paste-making step." },
      { name: "Cook chicken",      text: "Trim the raw chicken of excess fat and skin and cut into short strips. Add the chicken to the skillet with olive oil and cook until browned on both sides, seasoning with salt (up to 5 minutes per side) and remove from heat.", shortcutText: "Peel the meat from a store-bought rotisserie chicken, tear or cut it into short strips and set it aside." },
      { name: "Cook rice",              text: "While chicken is cooking, wash and add the rice and enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker). Bring to a boil, cover, reduce heat, and simmer 18–20 minutes (or closer to 25 minutes if using a rice cooker).", shortcutText: "no-shortcut" },
      { name: "Fry paste",         text: "Fry curry paste in oil 2–3 minutes. Add coconut milk and bring to a simmer. Add the chicken, chopped green beans, bamboo shoots, sliced eggplant, and chopped onion.", shortcutText: "no-shortcut" },
      { name: "Season & finish",   text: "Add some of the remaining basil leaves, salt and MSG, and simmer until vegetables are tender, 15–20 minutes. Add lime juice if desired. Fluff the rice when finished and serve the curry over it, topped with cilantro, additional basil leaves, and/or additional coriander leaves if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ── Tom Kha Gai ───────────────────────────────────────────────────────────
  {
    id: "tom-kha-gai",
    name: "Tom Kha Gai",
    cuisine: "Thai",
    dishType: "main",
    difficulty: "easy",
    priceLevel: "mid",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
      { phase: "cook", minutes: 20 },
    ],

    ingredients: [
      { ingredientId: "large-shrimp",             quantity: "1",   unit: "lb",     shortcutSubstitute: "none" },
      { ingredientId: "cremini-mushrooms",          quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "coconut-milk",       quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "galangal-root",        quantity: "1",   unit: "knob", shortcutSubstitute: "ginger-root" },
      { ingredientId: "lemongrass",         quantity: "1",   unit: "stalk",  shortcutSubstitute: "none" },
      { ingredientId: "lime-leaves",        quantity: "1",   unit: "pkg",    shortcutSubstitute: "omit" },
      { ingredientId: "green-onions",       quantity: "0.5", unit: "bunch",  shortcutSubstitute: "omit" },
      { ingredientId: "lime",              quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "fish-sauce",         quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "garlic",             quantity: "3",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "chicken-stock",      quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "thai-chilies",       quantity: "1",   unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "shrimp-paste",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "brown-fish-paste",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salt",                quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "chili-flakes",       quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Build broth",       text: "Blend Thai chilies, shallots, garlic, lemongrass, shrimp paste, fish paste, and lime zest into a smooth paste using a food processor, blender, or mortar. If it is too thick to blend, you can add water sparingly until it blends. Combine chicken stock, coconut milk, fish sauce, sliced galangal (or ginger), lime leaves, and salt.", shortcutText: "no-shortcut" },
      { name: "Add mushrooms & shrimp",     text: "Add sliced mushrooms and simmer 10 minutes, then add shrimp and diced green onions, then cook up to 3–4 minutes, only until the shrimp has just turned pink (don't overcook).", shortcutText: "no-shortcut" },
      { name: "Season & serve",    text: "Stir in lime juice to taste, and chili flakes if desired. Top with diced green onions and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["bao-buns"],
    suggestedExtras: [
      { itemId: "gyoza", quantity: "1", unit: "pkg" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MEDITERRANEAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Greek Salad ───────────────────────────────────────────────────────────
  {
    id: "greek-salad",
    name: "Greek Salad",
    cuisine: "Mediterranean",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "cucumber",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "roma-tomato",             quantity: "2",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "red-onion",          quantity: "0.5", unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "radish",             quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "feta-cheese",        quantity: "0.5", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "pickled-olives",             quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Chop & combine",    text: "Thinly slice cucumber, tomato, radish, and red onion. Combine in a bowl with chopped olives.", shortcutText: "no-shortcut" },
      { name: "Dress & serve",     text: "Drizzle with olive oil and season with salt and oregano. Top with crumbled feta.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ── Fatoush Salad ─────────────────────────────────────────────────────────
  {
    id: "fatoush-salad",
    name: "Fatoush Salad",
    cuisine: "Mediterranean",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "unlikely",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 15 },
    ],

    ingredients: [
      { ingredientId: "roma-tomato",             quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "cucumber",           quantity: "1",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "feta-cheese",        quantity: "0.25",unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "red-onion",          quantity: "0.5", unit: "whole",  shortcutSubstitute: "omit" },
      { ingredientId: "dried-mint",         quantity: "0.5",   unit: "tsp",   shortcutSubstitute: "sadaf-fatoush-seasoning" },
      { ingredientId: "dried-parsley",      quantity: "0.5",   unit: "tsp",   shortcutSubstitute: "omit" },
      { ingredientId: "onion-powder",       quantity: "0.25",   unit: "tsp",   shortcutSubstitute: "omit" },
      { ingredientId: "salt",               quantity: "0.25", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",       quantity: "0.25", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "sumac",              quantity: "0.5",   unit: "tsp",   shortcutSubstitute: "omit" },
      { ingredientId: "garlic-powder",      quantity: "0.25",   unit: "tsp",   shortcutSubstitute: "omit" },
      { ingredientId: "tarragon",           quantity: "0.5",   unit: "tsp",   shortcutSubstitute: "omit" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "lemon-juice",        quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "balsamic-vinegar",   quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "pomegranate-molasses",quantity: "1",  unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "romaine-lettuce",            quantity: "1",   unit: "head",   shortcutSubstitute: "none" },
      { ingredientId: "fresh-mint",              quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
      { ingredientId: "pita-chips",         quantity: "0.25",unit: "bag",    shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Make dressing",     text: "Whisk together olive oil, lemon juice, balsamic vinegar, pomegranate molasses, spices, and dried herbs.", shortcutText: "Whisk together olive oil, lemon juice, balsamic vinegar, pomegranate molasses, and 2 tsp of sadaf fatoush seasoning mix to taste." },
      { name: "Assemble",          text: "Combine chopped lettuce, diced tomato, sliced cucumber, thinly sliced red onion, feta, and chopped mint in a bowl. Add roughly crushed pita chips.", shortcutText: "no-shortcut" },
      { name: "Dress & serve",     text: "Drizzle with dressing, toss gently, and serve.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: [],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // EGYPTIAN
  // ════════════════════════════════════════════════════════════════════════════

  // ── Kosheri with Meat ─────────────────────────────────────────────────────
  {
    id: "kosheri-with-meat",
    name: "Kosheri with Meat",
    cuisine: "Egyptian",
    dishType: "main",
    difficulty: "moderate",
    priceLevel: "mid",
    timeRequirement: "medium",
    multiTasking: "unlikely",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 30 },
      { phase: "cook", minutes: 40 },
    ],

    ingredients: [
      { ingredientId: "rice",              quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "brown-lentils",            quantity: "1",   unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "ground-beef",        quantity: "1",   unit: "lb",     shortcutSubstitute: "omit" },
      { ingredientId: "chickpeas",          quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "macaroni",           quantity: "0.5", unit: "pkg",    shortcutSubstitute: "none" },
      { ingredientId: "diced-tomatoes",     quantity: "7",   unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "0.5",   unit: "whole",  shortcutSubstitute: "none" },
      { ingredientId: "brown-onion",              quantity: "1",   unit: "whole",  shortcutSubstitute: "crispy-onions" },
      { ingredientId: "salt",                quantity: "2", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "garlic",             quantity: "7",   unit: "clove",  shortcutSubstitute: "none" },
      { ingredientId: "tomato-paste",       quantity: "3.5", unit: "oz",     shortcutSubstitute: "none" },
      { ingredientId: "ground-coriander",          quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "ground-cumin",              quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "allspice",           quantity: "0.25",unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "ground-cinnamon",           quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "paprika",            quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "fennel-seeds",       quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "chili-powder",       quantity: "1",   unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "olive-oil",          quantity: "8",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "chili-oil",          quantity: "1",   unit: "tbsp",   shortcutSubstitute: "omit" },
    ],

    steps: [
      { name: "Toast rice & lentils",        text: "Toast dry rice and lentils (in separate batches) in an oil-coated large dry skillet over medium heat until lightly golden and fragrant, 3–4 minutes.", shortcutText: "" },
      { name: "Cook rice",              text: "Add enough water to cover rice by about 1 inch in a pot (or to the water level indicated if using a rice cooker) and submerge the lentils in a separate pot . Bring to a boil, cover, reduce heat, and simmer rice 18–20 minutes (or closer to 25 minutes if using a rice cooker) and lentils until tender.", shortcutText: "no-shortcut" },
      { name: "Cook macaroni",      text: "Cook macaroni in a pot of salted (using 1 tsp of salt) boiling water until al dente, then drain and toss in olive oil.", shortcutText: "no-shortcut" },
      { name: "Make tomato sauce",  text: "Sauté half the onion and garlic in olive oil. Add tomato paste, diced tomatoes, and 0.5 tsp salt. Simmer 15 minutes.", shortcutText: "no-shortcut" },
      { name: "Cook meat",          text: "If desired, in a separate pan brown ground beef and season with all spices and salt as well as any remaining garlic.", shortcutText: "" },
      { name: "Toast chickpeas & crisp onions",    text: "Toast drained chickpeas in an oil-coated skillet over medium-high heat until lightly browned, about 3-4 minutes, seasoning with salt. Slice the remaining onion, coat in flour, and fry in oil in the same skillet over medium-high heat until golden brown, about 3-4 minutes, seasoning with salt.", shortcutText: "" },
      { name: "Assemble",           text: "Layer lentils, rice, macaroni, and chickpeas in a baking dish or platter. Spoon tomato sauce over the top, finish with crispy onions and a drizzle of chili oil, then serve with the meat if desired.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["fatoush-salad"],
    suggestedExtras: [
      { itemId: "olives", quantity: "3.5", unit: "oz" },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // PREVIOUSLY EXISTING RECIPES (kept from new schema)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Caesar Salad ─────────────────────────────────────────────────────────
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    cuisine: "American",
    dishType: "side",
    difficulty: "easy",
    priceLevel: "cheap",
    timeRequirement: "short",
    multiTasking: "ideal",
    mealprepIdeal: "no",
    shortcutReplaces: null,
    servings: 4,
    timeToComplete: [
      { phase: "prep", minutes: 10 },
    ],

    ingredients: [
      { ingredientId: "romaine-lettuce",           quantity: "1",   unit: "head",   shortcutSubstitute: "none" },
      { ingredientId: "anchovy-fillets",          quantity: "4",   unit: "oz",     shortcutSubstitute: "omit" },
      { ingredientId: "garlic",     quantity: "3", unit: "clove",    shortcutSubstitute: "omit" },
      { ingredientId: "mayonnaise",         quantity: "1/4", unit: "cup",    shortcutSubstitute: "none" },
      { ingredientId: "lemon",              quantity: "1",   unit: "whole",   shortcutSubstitute: "none" },
      { ingredientId: "worcestershire-sauce", quantity: "1",   unit: "tsp",   shortcutSubstitute: "none" },
      { ingredientId: "salt",               quantity: "0.5", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "black-pepper",       quantity: "0.25", unit: "tsp",    shortcutSubstitute: "omit" },
      { ingredientId: "poupon-mustard",     quantity: "1",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "olive-oil",          quantity: "2",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "caesar-dressing",   quantity: "3",   unit: "tbsp",   shortcutSubstitute: "none" },
      { ingredientId: "parmesan-cheese",   quantity: "5",   unit: "tbsp",   shortcutSubstitute: "omit" },
      { ingredientId: "croutons",          quantity: "0.5", unit: "cup",    shortcutSubstitute: "omit" },
    ],

    steps: [
      {name: "Make dressing",     text: "Zest and juice the lemon. In a food processor, combine anchovy fillets, garlic, Worcestershire sauce, 1 tsp lemon juice, 1 tsp lemon zest, 3 tbsp of the parmesan cheese, salt, and pepper. Pulse until finely chopped. Add mayonnaise and pulse again until smooth.", shortcutText: "" },
      { name: "Dress & toss",      text: "Wash and tear or chop lettuce. Add dressing, remaining parmesan, and croutons. Toss to coat evenly and serve immediately.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spaghetti-bolognese"],
  },

  // ── Yeast Rolls ──────────────────────────────────────────────────────────
  {
    id: "yeast-rolls",
    name: "Yeast Rolls",
    cuisine: "American",
    dishType: "side",
    difficulty: "moderate",
    priceLevel: "cheap",
    timeRequirement: "long",
    multiTasking: "ideal",
    mealprepIdeal: "yes",
    shortcutReplaces: null,
    servings: 12,
    timeToComplete: [
      { phase: "prep", minutes: 25 },
      { phase: "rise", minutes: 60 },
      { phase: "prep", minutes: 10 },
      { phase: "rise", minutes: 30 },
      { phase: "bake", minutes: 18 },
    ],

    ingredients: [
      { ingredientId: "all-purpose-flour", quantity: "3",    unit: "cup",   shortcutSubstitute: "none" },
      { ingredientId: "active-dry-yeast",  quantity: "2.25", unit: "tsp",   shortcutSubstitute: "none" },
      { ingredientId: "granulated-sugar",             quantity: "2",    unit: "tbsp",  shortcutSubstitute: "none" },
      { ingredientId: "salt",             quantity: "1",    unit: "tsp",   shortcutSubstitute: "none" },
      { ingredientId: "salted-butter",            quantity: "3",    unit: "tbsp",  shortcutSubstitute: "none" },
      { ingredientId: "eggs",             quantity: "1",    unit: "whole", shortcutSubstitute: "none" },
    ],

    steps: [
      { name: "Activate yeast",    text: "Dissolve yeast and sugar in 1 cup warm water. Let sit 5–10 minutes until foamy (if you do not see any foam after 15 minutes, throw it out and try again with new yeast).", shortcutText: "no-shortcut" },
      { name: "Mix dough",         text: "Combine flour, salt, butter, and egg with yeast mixture. Knead until smooth, about 8 minutes.", shortcutText: "no-shortcut" },
      { name: "First rise",        text: "Cover and let rise in a warm place until doubled, at least 1 hour.", shortcutText: "no-shortcut" },
      { name: "Shape rolls",       text: "Punch down dough, divide into 12 equal pieces, and shape into balls. Place in a greased baking dish.", shortcutText: "no-shortcut" },
      { name: "Second rise",       text: "Cover and let rise again for 30 minutes.", shortcutText: "no-shortcut" },
      { name: "Bake",              text: "Bake at 375°F (190°C) for 16–20 minutes until golden brown. Brush with melted butter while warm.", shortcutText: "no-shortcut" },
    ],

    recommendedSides: ["spaghetti-bolognese"],
  },

]

export default DEFAULT_RECIPES
