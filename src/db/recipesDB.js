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
    if (!stored) return [...DEFAULT_RECIPES]
    const storedList = JSON.parse(stored)

    // Merge stored recipes with current defaults so that fields added to the
    // source after the user's localStorage was written are filled in.
    // Stored values win (user edits preserved); defaults fill in missing keys.
    const defaultsMap = Object.fromEntries(DEFAULT_RECIPES.map((r) => [r.id, r]))
    const storedIds   = new Set(storedList.map((r) => r.id))

    // Source-managed fields on recipe ingredients — always pulled from the
    // current defaults so that structural changes (like updating a
    // shortcutSubstitute from "none" to an actual ID) are reflected even in
    // recipes already stored in localStorage.
    const RECIPE_ING_SOURCE_FIELDS = ['shortcutSubstitute']

    const merged = storedList.map((recipe) => {
      const def = defaultsMap[recipe.id]
      if (!def) return recipe

      // Merge top-level recipe fields
      const mergedRecipe = { ...def, ...recipe }

      // Merge each ingredient's fields by ingredientId so that fields like
      // shortcutSubstitute added after the initial write are always present.
      if (def.ingredients && recipe.ingredients) {
        const defIngMap = Object.fromEntries(
          def.ingredients.map((i) => [i.ingredientId, i])
        )
        mergedRecipe.ingredients = recipe.ingredients.map((ing) => {
          const defIng = defIngMap[ing.ingredientId]
          if (!defIng) return ing
          const mergedIng = { ...defIng, ...ing }
          // Always use the current default for source-managed fields so that
          // stale stored values (e.g. shortcutSubstitute was "none" and is now
          // "alfredo-sauce") don't override the up-to-date defaults.
          for (const f of RECIPE_ING_SOURCE_FIELDS) {
            if (f in defIng) mergedIng[f] = defIng[f]
          }
          return mergedIng
        })
      }

      return mergedRecipe
    })

    // Add any recipe added to defaults after the stored snapshot was written
    const newDefaults = DEFAULT_RECIPES.filter((r) => !storedIds.has(r.id))
    return [...merged, ...newDefaults]
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
