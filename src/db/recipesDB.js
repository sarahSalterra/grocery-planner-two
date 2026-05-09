import DEFAULT_RECIPES from './data/recipes.js'

const KEY = 'gp_recipes'
const DEFAULTS_KEY = 'gp_recipes_defaults'

export function initRecipesDB() {
  if (!localStorage.getItem(DEFAULTS_KEY)) {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(DEFAULT_RECIPES))
  }
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_RECIPES))
  }
}

export function getRecipes() {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? JSON.parse(stored) : [...DEFAULT_RECIPES]
  } catch {
    return [...DEFAULT_RECIPES]
  }
}

export function saveRecipes(recipes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(recipes))
  } catch (e) {
    console.error('Failed to save recipes:', e)
  }
}

export function addRecipe(recipe) {
  const recipes = getRecipes()
  const updated = [...recipes, { ...recipe, id: recipe.id ?? `recipe-${Date.now()}` }]
  saveRecipes(updated)
  return updated
}

export function updateRecipe(id, changes) {
  const recipes = getRecipes()
  const updated = recipes.map((r) => (r.id === id ? { ...r, ...changes } : r))
  saveRecipes(updated)
  return updated
}

export function deleteRecipe(id) {
  const recipes = getRecipes()
  const updated = recipes.filter((r) => r.id !== id)
  saveRecipes(updated)
  return updated
}

export function revertRecipesToDefaults() {
  try {
    const defaults = localStorage.getItem(DEFAULTS_KEY)
    localStorage.setItem(KEY, defaults ?? JSON.stringify(DEFAULT_RECIPES))
  } catch (e) {
    console.error('Failed to revert recipes:', e)
  }
}
