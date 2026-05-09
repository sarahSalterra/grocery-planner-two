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
    return stored ? JSON.parse(stored) : [...DEFAULT_INGREDIENTS]
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
