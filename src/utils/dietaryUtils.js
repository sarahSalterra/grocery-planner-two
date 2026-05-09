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

/**
 * Returns true if a recipe should be hidden for a given dietary mode because
 * it contains an ingredient that is incompatible AND has no valid substitute.
 *
 * An ingredient is incompatible when its dietary substitute field is "none"
 * (meaning it is required and cannot be swapped or omitted for that diet).
 * A value of "n/a" means the ingredient is already diet-compatible — no action needed.
 * Any other value is a usable substitute — recipe remains visible.
 */
export function isRecipeDietaryExcluded(recipe, ingredientsMap, dietaryMode) {
  if (!dietaryMode || !recipe?.ingredients) return false
  const field = DIETARY_MODE_FIELD[dietaryMode]
  if (!field) return false

  return recipe.ingredients.some((ri) => {
    const ingData = ingredientsMap[ri.ingredientId]
    if (!ingData) return false
    return ingData[field] === 'none'
  })
}
