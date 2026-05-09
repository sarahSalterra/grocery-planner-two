// ─── Filter Options ──────────────────────────────────────────────────────────
// These are the valid values for recipe filter fields.
// Used to populate dropdowns, filter menus, and validate incoming data.

export const CUISINES = [
  "Italian",
  "American",
  "Mexican",
  "Chinese",
  "Korean",
  "Japanese",
  "Thai",
  "Mediterranean",
  "Slavic",
  "British",
  "Middle Eastern",
  "Egyptian",
  "Indian",
]

export const DISH_TYPES = [
  "main",
  "side",
  "dessert",
  "snack",
  "breakfast",
  "beverage",
]

export const DIFFICULTIES = [
  "easy",
  "moderate",
  "difficult",
]

// How much a recipe typically costs to make per serving
export const PRICE_LEVELS = [
  "cheap",
  "mid",
  "expensive",
]

// Roughly how long the recipe takes start to finish
export const TIME_REQUIREMENTS = [
  "short",    // under ~30 min
  "medium",   // 30–60 min
  "long",     // over 60 min
]

// Whether the recipe is well-suited for batch cooking
export const MEALPREP_IDEAL_OPTIONS = ["yes", "no"]

// Whether the recipe benefits from doing multiple things at once
// "ideal"    — requires multitasking (e.g. boiling pasta while browning meat)
// "possible" — can be multitasked but doesn't require it
// "unlikely" — best done one step at a time
export const MULTI_TASK_OPTIONS = [
  "ideal",
  "possible",
  "unlikely",
]

// ─── Departments ─────────────────────────────────────────────────────────────
// Standard grocery store departments — used for sorting the shopping list
// and tagging ingredients and household goods.

export const DEPARTMENTS = [
  "produce",
  "pantry",
  "deli",
  "bakery",
  "spices",
  "baking",
  "butchery",
  "frozen",
  "dairy",
  "snacks",
  "drinks",
  "florist",
  "household",
  "hygiene",
  "pets",
  "baby",
]

// Additional departments shown only when wholesale option is enabled
export const ADDITIONAL_DEPARTMENTS = [
  "wholesale",
  "international market",
]
