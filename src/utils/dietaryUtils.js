// ─── Dietary & Allergy Utilities ─────────────────────────────────────────────

// Maps each dietary restriction mode to the ingredient substitute field it uses
export const DIETARY_MODE_FIELD = {
  vegetarian:    'vegSubstitute',
  vegan:         'veganSubstitute',
  'gluten-free': 'glutenSubstitute',
  'dairy-free':  'dairySubstitute',
  pescatarian:   'fishSubstitute',
}

export const DIETARY_MODE_LABELS = {
  vegetarian:    'Vegetarian',
  vegan:         'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free':  'Dairy-Free',
  pescatarian:   'Pescatarian',
}

// ─── Allergy: Omit detection ──────────────────────────────────────────────────

/**
 * Returns true if an allergen ingredient can be safely omitted from a recipe.
 *
 * An ingredient is considered omittable when ANY of these are true:
 *   1. allergySubstitute !== 'none'  (has a defined allergy substitute)
 *   2. lenientSubstitute is or contains 'omit'
 *   3. The recipe ingredient's shortcutSubstitute === 'omit'
 *
 * When allergySubstitute === 'none' and none of the other conditions hold,
 * the ingredient is considered critical and the whole recipe should be hidden.
 */
export function canOmitAllergen(ingredientData, recipeIngredient) {
  // Recipe-level shortcut substitute is "omit"
  if (recipeIngredient?.shortcutSubstitute === 'omit') return true

  if (!ingredientData) return false

  // allergySubstitute has a real value (not "none") → ingredient can be swapped/omitted
  const av = ingredientData.allergySubstitute
  if (av && av !== 'none') return true

  // lenientSubstitute is "omit" or includes "omit"
  const lv = ingredientData.lenientSubstitute
  if (lv === 'omit') return true
  if (Array.isArray(lv) && lv.includes('omit')) return true

  // allergySubstitute is "none" (critical allergen) but the recipe provides a real
  // shortcut substitute that can serve as a safe alternative for this specific dish
  const sc = recipeIngredient?.shortcutSubstitute
  if (sc && sc !== 'none' && sc !== 'omit') return true

  return false
}

// ─── Allergy: Name matching ───────────────────────────────────────────────────

/**
 * Returns true if the ingredient name matches any entry in the allergy list.
 * Uses a simple substring match in both directions (case-insensitive) so that
 * e.g. "mushrooms" matches allergy entry "mushroom" and vice-versa.
 */
function isAllergenMatch(ingName, allergyList) {
  const lc = ingName.toLowerCase()
  return allergyList.some((a) => {
    const al = a.toLowerCase().trim()
    return lc === al || lc.includes(al) || al.includes(lc)
  })
}

/**
 * Returns the Set of ingredient IDs within a recipe that should be auto-omitted
 * because the user is allergic to them AND they can be omitted.
 */
export function getAllergyOmitIds(recipe, ingredientsMap, allergyList) {
  if (!allergyList?.length || !recipe?.ingredients) return new Set()
  const omitIds = new Set()
  recipe.ingredients.forEach((ri) => {
    const ingData = ingredientsMap[ri.ingredientId]
    const ingName = ingData?.name ?? ri.ingredientId
    if (isAllergenMatch(ingName, allergyList) && canOmitAllergen(ingData, ri)) {
      omitIds.add(ri.ingredientId)
    }
  })
  return omitIds
}

/**
 * Returns true if a recipe should be completely hidden from recipe lists because
 * it contains an allergen that CANNOT be omitted.
 */
export function isRecipeAllergyExcluded(recipe, ingredientsMap, allergyList) {
  if (!allergyList?.length || !recipe?.ingredients) return false
  return recipe.ingredients.some((ri) => {
    const ingData = ingredientsMap[ri.ingredientId]
    const ingName = ingData?.name ?? ri.ingredientId
    if (!isAllergenMatch(ingName, allergyList)) return false
    return !canOmitAllergen(ingData, ri) // can't omit → exclude recipe
  })
}

// ─── Substitution stacking ────────────────────────────────────────────────────

/**
 * Returns a deduplicated list of visible substitute labels for an ingredient,
 * stacked according to the active substitution mode:
 *   strict  → strictSubstitute only
 *   regular → strictSubstitute + regularSubstitute
 *   lenient → strictSubstitute + regularSubstitute + lenientSubstitute
 *
 * Values of "none", "n/a", and "omit" are filtered out of the display list.
 */
export function getStackedSubOptions(data, mode) {
  if (!data) return []
  const raw = []
  raw.push(data.strictSubstitute)
  if (mode === 'regular' || mode === 'lenient') raw.push(data.regularSubstitute)
  if (mode === 'lenient') raw.push(data.lenientSubstitute)

  const seen = new Set()
  const result = []
  let canOmit = false

  for (const f of raw) {
    const items = Array.isArray(f) ? f : (f ? [f] : [])
    for (const s of items) {
      if (!s || s === 'none' || s === 'n/a') continue
      if (s === 'omit') { canOmit = true; continue }
      if (!seen.has(s)) {
        seen.add(s)
        result.push(s)
      }
    }
  }

  // Append the omit indicator after named substitutes so it reads naturally
  if (canOmit) result.push('(can omit)')
  return result
}

// Normalise a dietary substitute field value (string | string[] | 'none' | 'n/a')
// into a filtered array of display-ready strings, stripping sentinel values.
// Sentinel values that mean "no real substitute" — filtered out so only actual
// ingredient names remain.  "omit" / "(can omit)" mean the ingredient is simply
// skipped; they are instructions, not substitute ingredient names.
// 'shortcut-dietary' signals that the ingredient is dietary-incompatible but a
// safe alternative is available through the recipe's shortcut ingredient.
const DIETARY_SENTINELS = new Set(['none', 'n/a', 'omit', '(can omit)', 'shortcut-dietary'])

function normaliseDietaryField(val) {
  const items = Array.isArray(val) ? val : (val ? [val] : [])
  return items.filter((s) => s && !DIETARY_SENTINELS.has(s))
}

/**
 * Returns true if a dietary field value indicates the ingredient is
 * incompatible with the dietary mode — i.e. there is no real direct substitute.
 *
 * Compatible values  : 'n/a' (already safe), any non-sentinel string/array
 * Incompatible values: null/undefined (unknown), 'none', 'omit', '(can omit)',
 *                      'shortcut-dietary', or any array containing only sentinels
 *                      (e.g. ['omit', 'shortcut-dietary']).
 *
 * Exported so grocery-list and other utilities can share the same logic.
 */
export function isDietaryFieldIncompatible(v) {
  if (!v) return true                              // null/undefined → unknown/incompatible
  if (v === 'n/a') return false                   // already compatible with this mode
  if (Array.isArray(v)) {
    if (v.includes('n/a')) return false            // at least one element says compatible
    return v.every((s) => !s || DIETARY_SENTINELS.has(s)) // all elements are sentinels
  }
  return DIETARY_SENTINELS.has(v)                 // sentinel string → incompatible
}

/**
 * Returns the first valid substitute name (or joined string when the field holds
 * an array) from the first active dietary mode that has one.  Used by the grocery
 * list builder where a single item name is required.
 */
export function getDietarySubstitute(ingredientData, dietaryModes) {
  if (!ingredientData || !dietaryModes?.length) return null
  for (const mode of dietaryModes) {
    const field = DIETARY_MODE_FIELD[mode]
    if (!field) continue
    const vals = normaliseDietaryField(ingredientData[field])
    if (vals.length > 0) return vals.join(' / ')
  }
  return null
}

/**
 * Returns a deduplicated array of all valid substitute strings across every
 * active dietary mode.  Used by recipe views so that all applicable dietary
 * swaps are visible while identical values from overlapping modes (e.g. both
 * "vegetarian" and "vegan" resolving to "plant-based meat") appear only once.
 */
export function getDietarySubstitutes(ingredientData, dietaryModes) {
  if (!ingredientData || !dietaryModes?.length) return []
  const seen = new Set()
  const result = []
  for (const mode of dietaryModes) {
    const field = DIETARY_MODE_FIELD[mode]
    if (!field) continue
    for (const s of normaliseDietaryField(ingredientData[field])) {
      if (!seen.has(s)) {
        seen.add(s)
        result.push(s)
      }
    }
  }
  return result
}

/**
 * Returns true if a recipe should be hidden because it contains an ingredient
 * that is incompatible with ANY of the active dietary modes AND has no valid
 * substitute for that mode ('none' means required with no swap available).
 *
 * A value of 'n/a' means the ingredient is already compatible — no problem.
 * Any other non-empty value is a valid substitute — recipe stays visible.
 *
 * Special case: if an incompatible ingredient has a recipe-level shortcut
 * substitute, the recipe is NOT excluded — the shortcut is the safe alternative.
 */
export function isRecipeDietaryExcluded(recipe, ingredientsMap, dietaryModes) {
  const modes = Array.isArray(dietaryModes) ? dietaryModes : (dietaryModes ? [dietaryModes] : [])
  if (!modes.length || !recipe?.ingredients) return false

  return modes.some((mode) => {
    const field = DIETARY_MODE_FIELD[mode]
    if (!field) return false
    return recipe.ingredients.some((ri) => {
      const ingData = ingredientsMap[ri.ingredientId]
      if (!ingData) return false
      const v = ingData[field]
      // Compatible ingredient (has a real substitute or is already n/a) → no issue
      if (!isDietaryFieldIncompatible(v)) return false
      // Incompatible, but recipe provides a shortcut safe alternative → not excluded
      const sc = ri.shortcutSubstitute
      if (sc && sc !== 'none' && sc !== 'omit') return false
      return true
    })
  })
}

/**
 * Returns the diet/allergy-safe display name to show in place of an ingredient
 * when that ingredient is incompatible with at least one active diet mode OR is
 * a critical allergen, AND the recipe defines a shortcut
 * substitute that itself has a diet-safe version.
 *
 * Resolution priority for the returned name:
 *   1. dietary substitute of the shortcut ingredient (e.g. "Non-Dairy Whipped Topping")
 *   2. the shortcut's own name if it is already fully compatible (all modes say "n/a")
 *
 * Returns null when:
 *   - the original ingredient is actually compatible (has a real dietary sub, or n/a)
 *   - no valid recipe shortcut is defined
 *   - the shortcut ingredient is ALSO incompatible with the active diet modes
 *   - ingredientsMap is not provided (safety check cannot be performed)
 */
/**
 * Returns true when a recipe contains at least one ingredient that is
 * incompatible with the user's dietary/allergy settings AND the recipe
 * provides a safe shortcut substitute for that ingredient.
 *
 * When true, the recipe should be treated as being in shortcut mode
 * automatically so the safe alternative reaches the grocery list and
 * recipe views without any manual toggle from the user.
 */
export function recipeNeedsAutoShortcut(recipe, ingredientsMap, dietaryModes, allergyList) {
  if (!recipe?.ingredients || !ingredientsMap) return false
  return recipe.ingredients.some((ri) => {
    const ingData = ingredientsMap[ri.ingredientId]
    return getShortcutFallbackSub(ingData, dietaryModes, allergyList, ri, ingredientsMap) !== null
  })
}

/**
 * Returns true when the ingredient is incompatible with at least one active
 * dietary mode and should simply be omitted from the recipe (its dietary
 * substitute field is 'omit', meaning there is no direct swap but the
 * ingredient can be left out).  Used to show a "(dietary — omit)" label when
 * the shortcut-mode feature is disabled in user settings.
 */
export function isDietaryOmittedIngredient(ingredientData, dietaryModes) {
  if (!ingredientData || !dietaryModes?.length) return false
  return dietaryModes.some((mode) => {
    const field = DIETARY_MODE_FIELD[mode]
    if (!field) return false
    const v = ingredientData[field]
    // Accept plain 'omit' string or arrays containing 'omit'
    // (e.g. ['omit', 'shortcut-dietary'] where omit is the non-shortcut fallback)
    if (v === 'omit') return true
    if (Array.isArray(v) && v.includes('omit')) return true
    return false
  })
}

export function getShortcutFallbackSub(ingredientData, dietaryModes, allergyList, recipeIngredient, ingredientsMap) {
  const scId = recipeIngredient?.shortcutSubstitute
  if (!scId || scId === 'none' || scId === 'omit') return null
  if (!ingredientData || !ingredientsMap) return null

  // ── Is the original ingredient incompatible? ─────────────────────────────
  let originalIsOut = false

  if (dietaryModes?.length > 0) {
    // Only evaluate modes we recognise; unrecognised modes are ignored rather
    // than letting them short-circuit .every() to false.
    const knownModes = dietaryModes.filter((m) => DIETARY_MODE_FIELD[m])
    if (knownModes.length > 0) {
      // Ingredient is "out" when any active dietary mode indicates incompatibility.
      // isDietaryFieldIncompatible handles plain strings, arrays, and the new
      // 'shortcut-dietary' sentinel (e.g. ['omit', 'shortcut-dietary']).
      originalIsOut = knownModes.some((mode) => {
        const field = DIETARY_MODE_FIELD[mode]
        return isDietaryFieldIncompatible(ingredientData[field])
      })
    }
  }

  if (!originalIsOut && allergyList?.length > 0 && ingredientData.allergySubstitute === 'none') {
    originalIsOut = isAllergenMatch(ingredientData.name ?? '', allergyList)
  }

  if (!originalIsOut) return null

  // ── Resolve the shortcut to a diet/allergy-safe display name ─────────────
  const scData = ingredientsMap[scId]

  if (dietaryModes?.length > 0 && scData) {
    // Does the shortcut ingredient have its own dietary substitute?
    const scDietSub = getDietarySubstitute(scData, dietaryModes)
    if (scDietSub) return scDietSub   // e.g. "Non-Dairy Whipped Topping"

    // Is the shortcut already compatible with every active mode (n/a = no issue)?
    const alreadyCompatible = dietaryModes.every((mode) => {
      const field = DIETARY_MODE_FIELD[mode]
      return !field || scData[field] === 'n/a'
    })
    if (alreadyCompatible) return scData.name ?? scId

    // Shortcut is also incompatible — don't recommend it
    return null
  }

  if (allergyList?.length > 0 && scData) {
    const av = scData.allergySubstitute
    if (av && av !== 'none') return av
    // Shortcut is not itself the allergen → it is safe to use
    if (!isAllergenMatch(scData.name ?? scId, allergyList)) return scData.name ?? scId
    return null
  }

  return null
}
