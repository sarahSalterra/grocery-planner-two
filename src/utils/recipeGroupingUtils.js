import {
  buildGroupFrequency,
  buildStapleGroupSet,
  getCanonicalGroupId,
} from './ingredientEquivalenceUtils'

const COMMON_FREQ_THRESHOLD = 0.15

/**
 * Ingredients that can link recipes into a group:
 * not in the user's common-ingredient equivalence groups and not globally too common.
 */
function getGroupingGroupIds(recipe, stapleGroups, groupFreq, totalRecipes, canonical) {
  const groups = new Set()
  for (const ing of recipe.ingredients ?? []) {
    const group = getCanonicalGroupId(ing.ingredientId, canonical)
    if (stapleGroups.has(group)) continue
    const count = groupFreq[group] ?? 0
    if (count / totalRecipes > COMMON_FREQ_THRESHOLD) continue
    groups.add(group)
  }
  return groups
}

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

/**
 * After filter/sort, cluster recipes that share grouping-worthy ingredient groups.
 * Returns [{ recipe, showSimilarBadge }] — leaders keep sort position; followers
 * are pulled directly after their group leader and marked Similar.
 */
export function groupRecipesBySimilarIngredients(
  sortedRecipes,
  allRecipes,
  commonIngredientIds,
  canonical
) {
  if (!sortedRecipes.length) return []

  const groupFreq = buildGroupFrequency(allRecipes, canonical)
  const totalRecipes = allRecipes.length || 1
  const stapleGroups = buildStapleGroupSet(commonIngredientIds, canonical)

  const distinctiveByRecipe = new Map()
  for (const recipe of sortedRecipes) {
    distinctiveByRecipe.set(
      recipe.id,
      getGroupingGroupIds(recipe, stapleGroups, groupFreq, totalRecipes, canonical)
    )
  }

  const ids = sortedRecipes.map((r) => r.id)
  const uf = new UnionFind(ids)

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const setA = distinctiveByRecipe.get(ids[i])
      const setB = distinctiveByRecipe.get(ids[j])
      if ([...setA].some((group) => setB.has(group))) uf.union(ids[i], ids[j])
    }
  }

  const componentMembers = new Map()
  for (const id of ids) {
    const root = uf.find(id)
    if (!componentMembers.has(root)) componentMembers.set(root, [])
    componentMembers.get(root).push(id)
  }

  const orderIndex = new Map(sortedRecipes.map((r, i) => [r.id, i]))
  const idToRecipe = Object.fromEntries(sortedRecipes.map((r) => [r.id, r]))
  const assigned = new Set()
  const result = []

  for (const recipe of sortedRecipes) {
    if (assigned.has(recipe.id)) continue
    const members = [...(componentMembers.get(uf.find(recipe.id)) ?? [recipe.id])]
    members.sort((a, b) => orderIndex.get(a) - orderIndex.get(b))

    members.forEach((id, idx) => {
      assigned.add(id)
      result.push({
        recipe: idToRecipe[id],
        showSimilarBadge: idx > 0 && members.length > 1,
      })
    })
  }

  return result
}

// Re-export for callers that need group-level frequency elsewhere.
export { buildGroupFrequency } from './ingredientEquivalenceUtils'
