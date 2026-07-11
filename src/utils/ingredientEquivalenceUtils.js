const REGULAR_SUB_SENTINELS = new Set(['none', 'n/a', 'omit', '(can omit)', 'shortcut-dietary'])

class UnionFind {
  constructor(ids) {
    this.parent = Object.fromEntries(ids.map((id) => [id, id]))
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }

  union(a, b) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent[rb] = ra
  }
}

function collectRegularSubstituteNames(value) {
  if (!value || REGULAR_SUB_SENTINELS.has(value)) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Build equivalence groups from regularSubstitute links only.
 * Returns { canonical: { [ingredientId]: canonicalGroupId } }.
 */
export function buildIngredientEquivalence(ingredients) {
  const nameToId = {}
  const lowerToId = {}
  for (const ing of ingredients) {
    nameToId[ing.name] = ing.id
    lowerToId[ing.name.toLowerCase()] = ing.id
  }

  function resolveSubstituteId(name) {
    if (!name || REGULAR_SUB_SENTINELS.has(name)) return null
    return nameToId[name] ?? lowerToId[name.toLowerCase()] ?? null
  }

  const ids = ingredients.map((ing) => ing.id)
  const uf = new UnionFind(ids)

  for (const ing of ingredients) {
    for (const subName of collectRegularSubstituteNames(ing.regularSubstitute)) {
      const subId = resolveSubstituteId(subName)
      if (subId && subId !== ing.id) uf.union(ing.id, subId)
    }
  }

  const membersByRoot = new Map()
  for (const id of ids) {
    const root = uf.find(id)
    if (!membersByRoot.has(root)) membersByRoot.set(root, [])
    membersByRoot.get(root).push(id)
  }

  const canonical = {}
  for (const members of membersByRoot.values()) {
    const groupId = [...members].sort()[0]
    for (const id of members) canonical[id] = groupId
  }

  return { canonical }
}

export function getCanonicalGroupId(ingredientId, canonical) {
  return canonical[ingredientId] ?? ingredientId
}

/** Expand staples so any regular substitute in the same group is excluded. */
export function buildStapleGroupSet(commonIngredientIds, canonical) {
  const staples = new Set()
  for (const id of commonIngredientIds ?? []) {
    staples.add(getCanonicalGroupId(id, canonical))
  }
  return staples
}

export function getRecipeGroupIds(recipe, canonical) {
  const groups = new Set()
  for (const ing of recipe.ingredients ?? []) {
    groups.add(getCanonicalGroupId(ing.ingredientId, canonical))
  }
  return groups
}

export function ingredientMatchesSelection(ingredientId, selectedIds, canonical) {
  const group = getCanonicalGroupId(ingredientId, canonical)
  for (const selId of selectedIds) {
    if (getCanonicalGroupId(selId, canonical) === group) return true
  }
  return false
}

/** Count unique selected equivalence groups matched by the recipe. */
export function countEquivalenceMatches(recipe, selectedIds, canonical) {
  const selectedGroups = new Set(
    [...selectedIds].map((id) => getCanonicalGroupId(id, canonical))
  )
  const recipeGroups = getRecipeGroupIds(recipe, canonical)
  let count = 0
  for (const group of selectedGroups) {
    if (recipeGroups.has(group)) count++
  }
  return count
}

export function recipeMatchesSelectedIngredients(recipe, selectedIds, canonical) {
  return countEquivalenceMatches(recipe, selectedIds, canonical) > 0
}

/** Recipe frequency per equivalence group (each recipe counts once per group). */
export function buildGroupFrequency(recipes, canonical) {
  const counts = {}
  for (const recipe of recipes) {
    for (const group of getRecipeGroupIds(recipe, canonical)) {
      counts[group] = (counts[group] ?? 0) + 1
    }
  }
  return counts
}
