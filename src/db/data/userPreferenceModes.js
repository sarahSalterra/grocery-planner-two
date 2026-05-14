// ─── User Preference Mode Definitions ────────────────────────────────────────
//
// Defines every configurable mode, its valid options, labels, descriptions,
// and default value. Used by both the onboarding wizard and the settings panel.

export const PREFERENCE_MODES = [
  {
    id: "shortcutMode",
    name: "Shortcut Mode",
    // "on/off" = whether shortcuts are active
    // "visible/hidden" = whether the shortcut toggle appears on step pages (mini-settings)
    options: ["on-visible", "on-hidden", "off-visible", "off-hidden"],
    default: "off-visible",
  },
  {
    id: "substitutionMode",
    name: "Substitution Mode",
    options: ["strict", "regular", "lenient"],
    default: "regular",
  },
  {
    id: "planMode",
    name: "Plan Mode",
    options: ["planned", "unplanned", "mealprep"],
    default: "unplanned",   // most common casual use case
  },
  {
    id: "noWasteMode",
    name: "Low Waste Step",
    options: ["visible", "hidden"],
    default: "hidden",      // optional feature; auto-set visible for cheapest+low-waste priority pairs
  },
  {
    id: "experienceMode",
    name: "Experience Mode",
    options: ["beginner", "experienced"],
    default: "experienced", // recipes are written to be followable; extra guidance opt-in
  },
  {
    id: "wholesale",
    name: "Wholesale Shopping",
    options: [true, false],
    default: false,
  },
]

// ─── User Types ───────────────────────────────────────────────────────────────
// Derived from householdSize + planMode only.
// Chef types are the default; switching to mealprep swaps the suffix.

export const USER_TYPES = [
  "single-chef",
  "couple-chef",
  "small-household-chef",
  "large-household-chef",
  "single-mealprep",
  "couple-mealprep",
  "small-household-mealprep",
  "large-household-mealprep",
]

// ─── Recipe Sizes ─────────────────────────────────────────────────────────────
// "single" (couple-chef default) = feeds 2 + up to 2 servings leftover

export const RECIPE_SIZES = ["half", "single", "double", "triple", "quadruple"]

// ─── Derivation: householdSize + planMode → userType ──────────────────────────

export function deriveUserType(householdSize, planMode) {
  if (planMode === "mealprep") return `${householdSize}-mealprep`
  return `${householdSize}-chef`
}

// ─── Derivation: userType → recipeSize ───────────────────────────────────────

const USER_TYPE_TO_RECIPE_SIZE = {
  "single-chef":               "half",
  "couple-chef":               "single",
  "small-household-chef":      "double",
  "large-household-chef":      "triple",
  "single-mealprep":           "single",
  "couple-mealprep":           "double",
  "small-household-mealprep":  "triple",
  "large-household-mealprep":  "quadruple",
}

export function deriveRecipeSize(userType) {
  return USER_TYPE_TO_RECIPE_SIZE[userType] ?? "single"
}

// ─── Shopping Schedule Options ────────────────────────────────────────────────

export const SHOP_SCHEDULES = [
  { id: "weekly",       label: "Once a week",       desc: "One grocery trip per week (default)" },
  { id: "twice-weekly", label: "Twice a week",       desc: "Two grocery trips per week" },
  { id: "biweekly",     label: "Every two weeks",    desc: "One grocery trip every two weeks" },
]

// ─── Priority Definitions ─────────────────────────────────────────────────────
// Ordered array on the user profile represents ranked preference (index 0 = highest)

export const PRIORITIES = [
  {
    id: "cheapest",
    label: "Cost-Effective",
    desc: "Prioritize recipes that cost the least to make",
  },
  {
    id: "easiest",
    label: "Easy to Make",
    desc: "Prefer simple, low-effort recipes",
  },
  {
    id: "quickest",
    label: "Quick to Cook",
    desc: "Get meals done in the least amount of time",
  },
  {
    id: "exploration",
    label: "Explore Flavors",
    desc: "Try new recipes and cuisines for fun",
  },
  {
    id: "frequency",
    label: "Cook Less Often",
    desc: "Minimize how many times per week you cook",
  },
  {
    id: "low-waste",
    label: "Low Waste",
    desc: "Use up ingredients and avoid clutter or spoilage",
  },
  {
    id: "healthy",
    label: "Healthiness",
    desc: "Prefer lighter, lower-calorie meals",
  },
]

export const DEFAULT_PRIORITIES_RANKED = PRIORITIES.map((p) => p.id)

// ─── Household Sizes ──────────────────────────────────────────────────────────

export const HOUSEHOLD_SIZES = [
  { id: "single",           label: "Single",           desc: "1 person" },
  { id: "couple",           label: "Couple",           desc: "2 people" },
  { id: "small-household",  label: "Small Household",  desc: "3–5 people" },
  { id: "large-household",  label: "Large Household",  desc: "6 or more people" },
]

// ─── Onboarding Recommendation Logic ─────────────────────────────────────────
// Call these with the current prioritiesRanked array to get UI hints.

export function getRecommendations(prioritiesRanked, currentPrefs = {}) {
  const rank = (id) => prioritiesRanked.indexOf(id)
  const topTwo = prioritiesRanked.slice(0, 2)

  const shortcutIsOn = currentPrefs.shortcutMode?.startsWith("on")

  return {
    // Shortcut: recommend if easiest or quickest is #1 AND cheapest is #5 or #6
    shortcutRecommended:
      (rank("easiest") === 0 || rank("quickest") === 0) && rank("cheapest") >= 4,

    // Shortcut: warn red if shortcut is on but cheapest ranks above both quickest and easiest
    shortcutWarn:
      shortcutIsOn &&
      rank("cheapest") < rank("quickest") &&
      rank("cheapest") < rank("easiest"),

    // Mealprep: recommend if "frequency" (cook less often) is a top-2 priority
    mealprepRecommended: rank("frequency") <= 1,

    // Lenient substitution: recommend if low-waste is #1, or cheapest+low-waste are top 2
    lenientRecommended:
      rank("low-waste") === 0 ||
      (topTwo.includes("cheapest") && topTwo.includes("low-waste")),

    // Strict substitution: recommend if exploration is #1 AND easiest+quickest are both bottom 2
    strictRecommended:
      rank("exploration") === 0 &&
      rank("easiest") >= 4 &&
      rank("quickest") >= 4,

    // Low waste step: auto-show if low-waste is any top-3 priority
    noWasteAutoVisible:
      prioritiesRanked.slice(0, 3).includes("low-waste"),
  }
}
