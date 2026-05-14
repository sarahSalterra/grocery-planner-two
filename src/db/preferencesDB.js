import {
  deriveUserType,
  deriveRecipeSize,
  DEFAULT_PRIORITIES_RANKED,
  PRIORITIES,
} from './data/userPreferenceModes.js'

const KEY = 'gp_preferences'

const DEFAULTS = {
  hasOnboarded: false,

  // ── Identity ────────────────────────────────────────────────────────────────
  name: null,
  householdSize: "couple",

  // ── Derived ─────────────────────────────────────────────────────────────────
  userType: "couple-chef",
  recipeSize: "single",

  // ── Priorities ──────────────────────────────────────────────────────────────
  prioritiesRanked: DEFAULT_PRIORITIES_RANKED,

  // ── Modes ───────────────────────────────────────────────────────────────────
  // "on-visible" | "on-hidden" | "off-visible" | "off-hidden"
  shortcutMode: "off-visible",
  substitutionMode: "regular",       // strict | regular | lenient
  planMode: "unplanned",             // planned | unplanned | mealprep
  experienceMode: "experienced",     // beginner | experienced

  // ── Dietary restrictions ────────────────────────────────────────────────────
  // dietaryMode: null | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'pescatarian'
  dietaryMode: null,
  // allergyIngredients: string[] — ingredient names the user is allergic to
  allergyIngredients: [],

  // ── Visibility toggles (booleans) ───────────────────────────────────────────
  showLowWaste: false,               // show the optional Low Waste pre-step
  showSubstitutions: false,          // show substitution options on recipe pages
  metricUnits: false,                // convert customary units to metric on recipe pages
  notifications: false,
  wholesale: false,

  // ── Schedule ─────────────────────────────────────────────────────────────────
  // "weekly" | "twice-weekly" | "biweekly"
  shopSchedule: "weekly",
  shopDay:      null,                // 0–6 (Sun–Sat), primary shop day
  shopDay2:     null,                // 0–6 (Sun–Sat), second shop day (twice-weekly only)
  shopCycleRef: null,                // ISO date string "YYYY-MM-DD" — first shopping date of
                                     // the biweekly cycle; weeks 0,2,4… from this are shop weeks

  // ── Inventory & Ingredients ─────────────────────────────────────────────────
  householdInventory: ["toilet-paper", "toothpaste", "ziplock-bags"],
  commonIngredients: [],

  // ── Meal Plan Data ────────────────────────────────────────────────────────
  // Planned mode:   { [slotKey 0-6]: [{ recipeId, sides: [] }] }
  //                 slotKey 7-13 used for biweekly week 2
  // Unplanned/prep: weekMeals = week 1 list, weekMeals2 = week 2 (biweekly)
  mealsByDay:  {},
  weekMeals:   [],
  weekMeals2:  [],

  // ── Pantry Check (set during Meal Planning → Restock transition) ──────────
  // Ingredient IDs the user confirmed they already have enough of.
  // Used to omit those ingredients from the final grocery list.
  checkedAvailableIngredients: [],

  // ── Restock List ─────────────────────────────────────────────────────────
  selectedRestockItems: [],
  restockWholesale: false,

  // ── Shop ─────────────────────────────────────────────────────────────────
  // Stored snapshot of the grocery list — rebuilt whenever meals or restock
  // items change so Shop always shows the current state.
  groceryListSections: [],
  shoppingChecked: [],
  // Items manually added by the user on the Shop page. Persist until removed.
  shopExtraItems: [],

  // ── Cook ─────────────────────────────────────────────────────────────────
  // Recipe IDs completed this week. Cleared when a new meal plan is started.
  cookedRecipeIds: [],

  // ── Glossary ──────────────────────────────────────────────────────────────
  // When true, cooking terms in recipe step text are highlighted and tappable
  // for inline definitions. Only shown when experienceMode === 'beginner'.
  glossaryBeginnerMode: false,

  // ── Low Waste → Meal Planning handoff ─────────────────────────────────────
  // Recipes selected on the Use Up Items page that should be auto-added to
  // the calendar when Meal Planning loads. Cleared immediately after read.
  pendingMeals: [],
}

const ALL_PRIORITY_IDS = PRIORITIES.map((p) => p.id)

// Append any priority IDs that were added after a user completed onboarding,
// so new priorities always appear at the bottom of their existing ranking.
function normalizePrioritiesRanked(ranked) {
  const known = new Set(ranked)
  const missing = ALL_PRIORITY_IDS.filter((id) => !known.has(id))
  return missing.length ? [...ranked, ...missing] : ranked
}

export function getPreferences() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return { ...DEFAULTS }
    const parsed = JSON.parse(stored)
    if (parsed.prioritiesRanked) {
      parsed.prioritiesRanked = normalizePrioritiesRanked(parsed.prioritiesRanked)
    }
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

export function savePreferences(prefs) {
  try {
    const userType = deriveUserType(
      prefs.householdSize ?? DEFAULTS.householdSize,
      prefs.planMode ?? DEFAULTS.planMode
    )
    const recipeSize = deriveRecipeSize(userType)
    const merged = { ...DEFAULTS, ...prefs, userType, recipeSize }
    localStorage.setItem(KEY, JSON.stringify(merged))
  } catch (e) {
    console.error('Failed to save preferences:', e)
  }
}

export function clearPreferences() {
  localStorage.removeItem(KEY)
}

export function revertPreferencesToDefaults() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...DEFAULTS, hasOnboarded: true }))
  } catch (e) {
    console.error('Failed to revert preferences:', e)
  }
}

export function completeOnboarding(formData) {
  const current = getPreferences()
  savePreferences({ ...current, ...formData, hasOnboarded: true })
}
