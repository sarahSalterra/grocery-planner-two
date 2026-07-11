import { buildGroceryList } from './groceryUtils'

function plannedSlotCount(preferences) {
  return (preferences.shopSchedule ?? 'weekly') === 'biweekly' ? 14 : 7
}

/**
 * Remove the first planned occurrence of recipeId from the meal plan.
 * Planned mode: earliest slot (0–6 week 1, then 7–13 week 2 when biweekly).
 * Unplanned mode: first match in weekMeals, then weekMeals2.
 */
export function removeFirstMealInstance(preferences, recipeId) {
  const isPlanned = preferences.planMode === 'planned'

  if (isPlanned) {
    const mealsByDay = { ...(preferences.mealsByDay ?? {}) }
    for (let slot = 0; slot < plannedSlotCount(preferences); slot++) {
      const meals = mealsByDay[slot] ?? []
      const idx = meals.findIndex((m) => m.recipeId === recipeId)
      if (idx === -1) continue
      const updated = meals.filter((_, i) => i !== idx)
      if (updated.length > 0) mealsByDay[slot] = updated
      else delete mealsByDay[slot]
      return { ...preferences, mealsByDay }
    }
    return preferences
  }

  const weekMeals = [...(preferences.weekMeals ?? [])]
  const idx1 = weekMeals.findIndex((m) => m.recipeId === recipeId)
  if (idx1 !== -1) {
    weekMeals.splice(idx1, 1)
    return { ...preferences, weekMeals }
  }

  const weekMeals2 = [...(preferences.weekMeals2 ?? [])]
  const idx2 = weekMeals2.findIndex((m) => m.recipeId === recipeId)
  if (idx2 !== -1) {
    weekMeals2.splice(idx2, 1)
    return { ...preferences, weekMeals2 }
  }

  return preferences
}

/** Rebuild grocery list sections and prune stale shopping checkmarks. */
export function rebuildGroceryPreferences(preferences) {
  const sections = buildGroceryList(preferences)
  const validKeys = new Set(sections.flatMap((s) => s.items.map((i) => i.key)))
  return {
    ...preferences,
    groceryListSections: sections,
    shoppingChecked: (preferences.shoppingChecked ?? []).filter((k) => validKeys.has(k)),
    shoppingListCleared: false,
  }
}

/** Remove one meal instance from the plan and refresh the grocery list. */
export function completeRecipeInPlan(preferences, recipeId) {
  return rebuildGroceryPreferences(removeFirstMealInstance(preferences, recipeId))
}
