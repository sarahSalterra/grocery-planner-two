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
import { getAllergyOmitIds, getDietarySubstitute, getShortcutFallbackSub, recipeNeedsAutoShortcut, isDietaryFieldIncompatible, DIETARY_MODE_FIELD } from './dietaryUtils'
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
  const dietaryModes = preferences.dietaryModes ?? []
  const recipeSize   = preferences.recipeSize ?? 'single'
  // Auto-shortcut substitutions are only applied when the shortcut feature is
  // available to the user. When shortcut mode is fully disabled ('off-hidden'),
  // incompatible ingredients are silently omitted rather than replaced with
  // their safe shortcut alternative.
  const shortcutAllowed = (preferences.shortcutMode ?? 'off-visible') !== 'off-hidden'
  const ingAgg = {}

  for (const { recipeId, useShortcut } of selectedMeals) {
    const recipe = recipesMap[recipeId]
    if (!recipe) continue

    // Auto-shortcut: if any ingredient is dietary/allergy-incompatible but the
    // recipe has a safe shortcut alternative, treat the whole recipe as if
    // the user had enabled shortcut mode for it.
    const effectiveShortcut = useShortcut || (shortcutAllowed && recipeNeedsAutoShortcut(recipe, ingredientsMap, dietaryModes, allergyList))

    const omitIds = getAllergyOmitIds(recipe, ingredientsMap, allergyList)
    const scaled  = scaleRecipe(recipe, recipeSize)

    ;(scaled.ingredients ?? []).forEach((ing) => {
      if (confirmed.has(ing.ingredientId)) return

      // ── Allergy omit: use recipe shortcut as safe alternative if available ──
      if (omitIds.has(ing.ingredientId)) {
        const ingData      = ingredientsMap[ing.ingredientId]
        const safeName     = shortcutAllowed
          ? getShortcutFallbackSub(ingData, dietaryModes, allergyList, ing, ingredientsMap)
          : null
        if (safeName) {
          const scData = ingredientsMap[ing.shortcutSubstitute]
          const scKey  = `sc_${safeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
          if (!ingAgg[scKey]) {
            ingAgg[scKey] = { key: scKey, id: scKey, name: safeName, department: scData?.department ?? 'pantry', qty: null, unit: null, atLeast: false }
          }
        }
        return
      }

      // ── Shortcut mode handling ─────────────────────────────────────────────
      if (effectiveShortcut && ing.shortcutSubstitute && ing.shortcutSubstitute !== 'none') {
        if (ing.shortcutSubstitute === 'omit') return
        const scId   = ing.shortcutSubstitute
        const scData = ingredientsMap[scId]
        // Apply dietary substitution to the shortcut ingredient itself
        const scDietSub = getDietarySubstitute(scData, dietaryModes)
        const subName   = scDietSub ?? scData?.name ?? scId
        const scKey     = `sc_${subName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
        if (!ingAgg[scKey]) {
          ingAgg[scKey] = {
            key:        scKey,
            id:         scKey,
            name:       subName,
            department: scData?.department ?? 'pantry',
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
          const subDietSub = getDietarySubstitute(subData, dietaryModes)

          const subDisplayName = subDietSub ?? subData?.name ?? subIng.ingredientId
          const subSlug = subDietSub
            ? subDietSub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : null
          const subKey     = subSlug ? `ing_${subSlug}` : `ing_${subIng.ingredientId}`
          const subParsed  = parseQtyStr(subIng.quantity) * fraction

          if (!ingAgg[subKey]) {
            ingAgg[subKey] = {
              key:        subKey,
              id:         subSlug ?? subIng.ingredientId,
              name:       subDisplayName,
              department: subData?.department ?? 'pantry',
              qty:        subParsed,
              unit:       subIng.unit,
              atLeast:    false,
            }
          } else if (ingAgg[subKey].unit === subIng.unit) {
            ingAgg[subKey].qty += subParsed
          } else {
            ingAgg[subKey].atLeast = true
          }
        })
        return
      }

      const data = ingredientsMap[ing.ingredientId]
      const dietarySub = getDietarySubstitute(data, dietaryModes)

      // ── Dietary-incompatible ingredient: omit or replace with safe shortcut ──
      // When any active mode says this ingredient can't be used ("none"/"omit"),
      // try to substitute with the diet-safe version of its recipe shortcut.
      // If no safe shortcut exists, just omit the ingredient entirely.
      if (!dietarySub && dietaryModes.length > 0 && data) {
        const hasIncompatibleMode = dietaryModes.some((mode) => {
          const field = DIETARY_MODE_FIELD[mode]
          if (!field) return false
          // isDietaryFieldIncompatible handles plain strings, arrays, and
          // the 'shortcut-dietary' sentinel (e.g. ['omit', 'shortcut-dietary'])
          return isDietaryFieldIncompatible(data[field])
        })
        if (hasIncompatibleMode) {
          const safeName = shortcutAllowed
            ? getShortcutFallbackSub(data, dietaryModes, allergyList, ing, ingredientsMap)
            : null
          if (safeName) {
            const scData = ingredientsMap[ing.shortcutSubstitute]
            const scKey  = `sc_${safeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
            if (!ingAgg[scKey]) {
              ingAgg[scKey] = { key: scKey, id: scKey, name: safeName, department: scData?.department ?? 'pantry', qty: null, unit: null, atLeast: false }
            }
          }
          return // never add the original incompatible ingredient
        }
      }

      const displayName = dietarySub ?? data?.name ?? ing.ingredientId
      const slugSub     = dietarySub
        ? dietarySub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : null
      // Key by ingredient id only — same ingredient from multiple recipes with
      // different units would otherwise produce duplicate list entries.
      const key       = slugSub ? `ing_${slugSub}` : `ing_${ing.ingredientId}`
      const parsedQty = parseQtyStr(ing.quantity)

      if (!ingAgg[key]) {
        ingAgg[key] = {
          key,
          id:         slugSub ?? ing.ingredientId,
          name:       displayName,
          department: data?.department ?? 'pantry',
          qty:        parsedQty,
          unit:       ing.unit,
          atLeast:    false,
        }
      } else if (ingAgg[key].unit === ing.unit) {
        ingAgg[key].qty += parsedQty
      } else {
        // Different unit — can't sum; flag so Shop shows "at least X unit"
        ingAgg[key].atLeast = true
      }
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
