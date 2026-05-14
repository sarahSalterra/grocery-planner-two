/**
 * groceryUtils.js
 *
 * Self-contained grocery list builder.
 * Loads recipes / ingredients / goods internally so any page can call
 * buildGroceryList(preferences) without managing their own data maps.
 *
 * Returns an array of sections:  [{ dept, label, items }]
 * Each item:  { key, id, name, department, qty, unit, atLeast }
 *
 * The result is serialisable to JSON, safe to store in localStorage, and
 * designed to be rebuilt whenever the meal plan or restock list changes.
 */

import { getRecipes }        from '../db/recipesDB'
import { getIngredients }    from '../db/ingredientsDB'
import { getHouseholdGoods } from '../db/householdGoodsDB'
import { DEPARTMENTS }       from '../db/data/filterOptions'
import { getAllergyOmitIds, DIETARY_MODE_FIELD } from './dietaryUtils'
import { scaleRecipe, parseQtyStr } from './recipeUtils'

export const DEPT_LABELS = {
  produce:   'Produce',
  pantry:    'Pantry',
  deli:      'Deli',
  bakery:    'Bakery',
  spices:    'Spices',
  baking:    'Baking',
  butchery:  'Butcher',
  frozen:    'Frozen',
  dairy:     'Dairy',
  snacks:    'Snacks',
  drinks:    'Drinks',
  household: 'Household',
  hygiene:   'Hygiene',
  pets:      'Pets',
  wholesale: 'Wholesale 🏪',
}

/**
 * Builds the full grocery list from the current preferences snapshot.
 * Loads recipes, ingredients, and household goods from localStorage internally.
 * Returns an empty array on error rather than throwing.
 */
export function buildGroceryList(preferences) {
  try {
    const recipesMap     = Object.fromEntries(getRecipes().map((r) => [r.id, r]))
    const ingredientsMap = Object.fromEntries(getIngredients().map((i) => [i.id, i]))
    const goodsMap       = Object.fromEntries(getHouseholdGoods().map((g) => [g.id, g]))
    return _buildGroceryList(preferences, recipesMap, ingredientsMap, goodsMap)
  } catch (err) {
    console.error('[groceryUtils] buildGroceryList error:', err)
    return []
  }
}

function _buildGroceryList(preferences, recipesMap, ingredientsMap, goodsMap) {
  const confirmed   = new Set(preferences.checkedAvailableIngredients ?? [])
  const restockIds  = new Set(preferences.selectedRestockItems ?? [])
  const isWholesale = preferences.restockWholesale ?? false
  const isPlanned   = preferences.planMode === 'planned'

  // ── Collect all selected meals with per-recipe shortcut flag ─────────────
  const selectedMeals = [] // [{ recipeId, useShortcut }]
  if (isPlanned) {
    Object.values(preferences.mealsByDay ?? {}).forEach((dayMeals) =>
      dayMeals.forEach((m) => {
        selectedMeals.push({ recipeId: m.recipeId, useShortcut: m.useShortcut ?? false })
        m.sides?.forEach((id) => selectedMeals.push({ recipeId: id, useShortcut: false }))
      })
    )
  } else {
    ;[...(preferences.weekMeals ?? []), ...(preferences.weekMeals2 ?? [])].forEach((m) => {
      selectedMeals.push({ recipeId: m.recipeId, useShortcut: m.useShortcut ?? false })
      m.sides?.forEach((id) => selectedMeals.push({ recipeId: id, useShortcut: false }))
    })
  }

  // ── Aggregate recipe ingredient quantities per ingredientId + unit ─────────
  const allergyList  = preferences.allergyIngredients ?? []
  const dietaryField = preferences.dietaryMode ? DIETARY_MODE_FIELD[preferences.dietaryMode] : null
  const recipeSize   = preferences.recipeSize ?? 'single'
  const ingAgg = {}

  for (const { recipeId, useShortcut } of selectedMeals) {
    const recipe = recipesMap[recipeId]
    if (!recipe) continue
    const omitIds = getAllergyOmitIds(recipe, ingredientsMap, allergyList)
    const scaled  = scaleRecipe(recipe, recipeSize)

    ;(scaled.ingredients ?? []).forEach((ing) => {
      if (confirmed.has(ing.ingredientId)) return
      if (omitIds.has(ing.ingredientId))   return

      // ── Shortcut mode handling ─────────────────────────────────────────────
      if (useShortcut && ing.shortcutSubstitute && ing.shortcutSubstitute !== 'none') {
        if (ing.shortcutSubstitute === 'omit') return
        const subName = ing.shortcutSubstitute
        const scKey   = `sc_${subName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
        if (!ingAgg[scKey]) {
          ingAgg[scKey] = {
            key:        scKey,
            id:         scKey,
            name:       subName,
            department: 'pantry',
            qty:        null,
            unit:       null,
            atLeast:    false,
          }
        }
        return
      }

      // ── Recipe-as-ingredient: expand sub-recipe inline ──────────────────────
      if (recipesMap[ing.ingredientId]) {
        const subRecipe = recipesMap[ing.ingredientId]
        const fraction  = parseQtyStr(ing.quantity) // e.g. 0.5 = half a batch
        const subScaled = scaleRecipe(subRecipe, recipeSize)
        const subOmit   = getAllergyOmitIds(subRecipe, ingredientsMap, allergyList)

        ;(subScaled.ingredients ?? []).forEach((subIng) => {
          if (confirmed.has(subIng.ingredientId)) return
          if (subOmit.has(subIng.ingredientId))   return

          const subData    = ingredientsMap[subIng.ingredientId]
          const subDietRaw = dietaryField && subData ? subData[dietaryField] : null
          const subDietSub = (subDietRaw && subDietRaw !== 'n/a' && subDietRaw !== 'none')
            ? subDietRaw
            : null

          const subDisplayName = subDietSub ?? subData?.name ?? subIng.ingredientId
          const subSlug = subDietSub
            ? subDietSub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : null
          const subKey = subSlug
            ? `ing_${subSlug}_${subIng.unit}`
            : `ing_${subIng.ingredientId}_${subIng.unit}`

          if (!ingAgg[subKey]) {
            ingAgg[subKey] = {
              key:        subKey,
              id:         subSlug ?? subIng.ingredientId,
              name:       subDisplayName,
              department: subData?.department ?? 'pantry',
              qty:        0,
              unit:       subIng.unit,
              atLeast:    false,
            }
          }
          ingAgg[subKey].qty += parseQtyStr(subIng.quantity) * fraction
        })
        return
      }

      const data = ingredientsMap[ing.ingredientId]
      const dietaryRaw = dietaryField && data ? data[dietaryField] : null
      const dietarySub = (dietaryRaw && dietaryRaw !== 'n/a' && dietaryRaw !== 'none')
        ? dietaryRaw
        : null

      const displayName = dietarySub ?? data?.name ?? ing.ingredientId
      const slugSub = dietarySub
        ? dietarySub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : null
      const key = slugSub
        ? `ing_${slugSub}_${ing.unit}`
        : `ing_${ing.ingredientId}_${ing.unit}`

      if (!ingAgg[key]) {
        ingAgg[key] = {
          key,
          id:         slugSub ?? ing.ingredientId,
          name:       displayName,
          department: data?.department ?? 'pantry',
          qty:        0,
          unit:       ing.unit,
          atLeast:    false,
        }
      }
      ingAgg[key].qty += parseQtyStr(ing.quantity)
    })
  }

  // ── Process household restock items ───────────────────────────────────────
  const wholesaleItems  = []
  const standaloneGoods = []

  for (const goodId of restockIds) {
    // Fall back to ingredientsMap for IDs that were stored from an ingredient
    // name-match before the fix that auto-registers them as household goods.
    const good = goodsMap[goodId]
      ?? (ingredientsMap[goodId]
        ? { id: goodId, name: ingredientsMap[goodId].name, department: ingredientsMap[goodId].department }
        : null)
    if (!good) continue

    if (isWholesale) {
      wholesaleItems.push({
        key:        `good_${good.id}`,
        id:         good.id,
        name:       good.name,
        department: 'wholesale',
        qty:        null,
        unit:       null,
        atLeast:    false,
      })
    } else {
      const matchKey = Object.keys(ingAgg).find((k) => k.startsWith(`ing_${good.id}_`))
      if (matchKey) {
        ingAgg[matchKey].atLeast = true
      } else {
        standaloneGoods.push({
          key:        `good_${good.id}`,
          id:         good.id,
          name:       good.name,
          department: good.department,
          qty:        null,
          unit:       null,
          atLeast:    false,
        })
      }
    }
  }

  // ── Group all regular items by department ─────────────────────────────────
  const allItems = [...Object.values(ingAgg), ...standaloneGoods]
  const byDept   = {}
  allItems.forEach((item) => {
    const d = item.department || 'pantry'
    if (!byDept[d]) byDept[d] = []
    byDept[d].push(item)
  })
  Object.values(byDept).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)))

  const sections = DEPARTMENTS.filter((d) => byDept[d]?.length > 0).map((d) => ({
    dept:  d,
    label: DEPT_LABELS[d] ?? d,
    items: byDept[d],
  }))

  if (wholesaleItems.length > 0) {
    wholesaleItems.sort((a, b) => a.name.localeCompare(b.name))
    sections.push({ dept: 'wholesale', label: DEPT_LABELS.wholesale, items: wholesaleItems })
  }

  return sections
}
