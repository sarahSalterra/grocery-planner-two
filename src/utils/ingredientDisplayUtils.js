/**
 * Turn an ingredient id or slug into a readable label (e.g. "black-pepper" → "Black Pepper").
 */
export function formatIdAsDisplayName(idOrSlug) {
  if (idOrSlug == null || idOrSlug === '') return ''
  const withSpaces = String(idOrSlug)
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
  return withSpaces
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** True when a string looks like an internal id, not a human label. */
export function looksLikeInternalIngredientLabel(name) {
  if (!name || typeof name !== 'string') return false
  const t = name.trim()
  if (!t) return false
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(t)) return true
  if (/^[a-z]+[A-Z][a-zA-Z]*$/.test(t)) return true
  return false
}

/**
 * Prefer canonical name from ingredients map; repair slug/camelCase fallbacks.
 */
export function resolveIngredientDisplayName(ingredientId, fallbackName, ingredientsMap) {
  if (ingredientId && ingredientsMap?.[ingredientId]?.name) {
    return ingredientsMap[ingredientId].name
  }
  const fb = (fallbackName ?? '').trim()
  if (fb && !looksLikeInternalIngredientLabel(fb) && fb !== ingredientId) {
    return fb
  }
  if (ingredientId) return formatIdAsDisplayName(ingredientId)
  if (fb) return looksLikeInternalIngredientLabel(fb) ? formatIdAsDisplayName(fb) : fb
  return fb
}

export function ingredientMatchesSearchQuery(ing, queryLower) {
  if (!queryLower) return false
  const name = (ing.name ?? '').toLowerCase()
  const idAsWords = (ing.id ?? '').replace(/-/g, ' ').toLowerCase()
  return name.includes(queryLower) || idAsWords.includes(queryLower)
}
