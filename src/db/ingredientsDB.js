import DEFAULT_INGREDIENTS from './data/ingredients.js'

const KEY = 'gp_ingredients'
const DEFAULTS_KEY = 'gp_ingredients_defaults'

export function initIngredientsDB() {
  if (!localStorage.getItem(DEFAULTS_KEY)) {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(DEFAULT_INGREDIENTS))
  }
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_INGREDIENTS))
  }
}

export function getIngredients() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return [...DEFAULT_INGREDIENTS]
    const storedList = JSON.parse(stored)

    // Merge stored ingredients with current defaults so that any fields added
    // to the source after the user's localStorage was written are filled in.
    // Stored values always win (user customisations are preserved); defaults
    // only fill in keys that are absent from the stored entry.
    const defaultsMap = Object.fromEntries(DEFAULT_INGREDIENTS.map((i) => [i.id, i]))
    const storedIds   = new Set(storedList.map((i) => i.id))

    // Fields that are source-managed (not user-editable via the UI).
    // These always reflect the current defaults so stale stored values
    // (e.g. dairySubstitute was "n/a" and is now "omit") are corrected.
    const SOURCE_FIELDS = [
      'department',
      'vegSubstitute', 'veganSubstitute', 'glutenSubstitute',
      'dairySubstitute', 'fishSubstitute',
      'allergySubstitute',
      'strictSubstitute', 'regularSubstitute', 'lenientSubstitute', 'otherSubstitute',
    ]

    const merged = storedList.map((ing) => {
      const def = defaultsMap[ing.id]
      if (!def) return ing
      // Stored value wins for all fields (preserves user edits like custom names),
      // then we overwrite source-managed fields with the current default so that
      // dietary substitution data is always up-to-date.
      const result = { ...def, ...ing }
      for (const f of SOURCE_FIELDS) {
        if (f in def) result[f] = def[f]
      }
      return result
    })

    // Add any ingredient that was added to defaults after localStorage was written
    const newDefaults = DEFAULT_INGREDIENTS.filter((i) => !storedIds.has(i.id))

    return [...merged, ...newDefaults]
  } catch {
    return [...DEFAULT_INGREDIENTS]
  }
}

export function saveIngredients(ingredients) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ingredients))
  } catch (e) {
    console.error('Failed to save ingredients:', e)
  }
}

export function addIngredient(ingredient) {
  const ingredients = getIngredients()
  const updated = [...ingredients, { ...ingredient, id: ingredient.id ?? `ingredient-${Date.now()}` }]
  saveIngredients(updated)
  return updated
}

export function updateIngredient(id, changes) {
  const ingredients = getIngredients()
  const updated = ingredients.map((item) =>
    item.id === id ? { ...item, ...changes } : item
  )
  saveIngredients(updated)
  return updated
}

export function deleteIngredient(id) {
  const ingredients = getIngredients()
  const updated = ingredients.filter((item) => item.id !== id)
  saveIngredients(updated)
  return updated
}

export function revertIngredientsToDefaults() {
  try {
    const defaults = localStorage.getItem(DEFAULTS_KEY)
    localStorage.setItem(KEY, defaults ?? JSON.stringify(DEFAULT_INGREDIENTS))
  } catch (e) {
    console.error('Failed to revert ingredients:', e)
  }
}
