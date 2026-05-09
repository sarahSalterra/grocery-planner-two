// ─── Recipe Utilities ────────────────────────────────────────────────────────
//
// Time formatting, quantity formatting, and serving-size scaling.
// All scaling is applied at display time — base recipe data stays at
// "single" (couple-chef) scale.

// ─── Time Formatting ─────────────────────────────────────────────────────────

/**
 * Format a minute count into a human-readable string.
 * e.g. 10 → "10 min", 90 → "1 hr 30 min", 60 → "1 hr"
 */
export function formatMinutes(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/**
 * Sum all time phases in a timeToComplete array.
 */
export function getTotalTime(timeToComplete) {
  if (!Array.isArray(timeToComplete)) return 0
  return timeToComplete.reduce((s, p) => s + (p.minutes ?? 0), 0)
}

/**
 * Sum only the active (hands-on) phases, excluding passive waiting phases.
 * Passive phases: rise, chill, marinate, rest
 */
const PASSIVE_PHASES = new Set(['rise', 'chill', 'marinate', 'rest'])

export function getTotalActiveTime(timeToComplete) {
  if (!Array.isArray(timeToComplete)) return 0
  return timeToComplete
    .filter((p) => !PASSIVE_PHASES.has(p.phase))
    .reduce((s, p) => s + (p.minutes ?? 0), 0)
}

/**
 * Returns any phases that require advance planning (≥ 15 min passive).
 * Used by the notification service to schedule start reminders.
 */
export function getAdvancePlanningPhases(timeToComplete) {
  if (!Array.isArray(timeToComplete)) return []
  return timeToComplete.filter(
    (p) => PASSIVE_PHASES.has(p.phase) && p.minutes >= 15
  )
}

// ─── Quantity Formatting ──────────────────────────────────────────────────────

// Maps common decimal fractions to display strings
const FRACTION_MAP = [
  [0.125, '1/8'],
  [0.25,  '1/4'],
  [0.333, '1/3'],
  [0.5,   '1/2'],
  [0.667, '2/3'],
  [0.75,  '3/4'],
]

/**
 * Format a numeric quantity into a clean display string.
 * Handles whole numbers, simple fractions, and mixed numbers.
 * e.g. 0.5 → "1/2", 1.5 → "1½", 2.333 → "2 1/3", 3 → "3"
 */
export function formatQuantity(num) {
  if (isNaN(num) || num <= 0) return '0'

  const whole = Math.floor(num)
  const decimal = Math.round((num - whole) * 1000) / 1000

  if (decimal < 0.05) return String(whole === 0 ? '0' : whole)

  // Find the closest fraction
  let bestFrac = null
  let bestDiff = Infinity
  for (const [val, str] of FRACTION_MAP) {
    const diff = Math.abs(decimal - val)
    if (diff < bestDiff) {
      bestDiff = diff
      bestFrac = str
    }
  }

  // Use unicode fraction if available for common halves
  const unicodeFracs = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/3': '⅓', '2/3': '⅔' }
  const fracDisplay = unicodeFracs[bestFrac] ?? bestFrac

  if (whole === 0) return fracDisplay
  // Mixed number: prefer tight display for common cases
  if (bestFrac === '1/2') return `${whole}½`
  return `${whole} ${bestFrac}`
}

// ─── Metric Unit Conversion ───────────────────────────────────────────────────

// Parse a display quantity string (possibly a fraction or mixed number with
// unicode characters) back to a plain float.
export function parseQtyStr(str) {
  if (!str && str !== 0) return 0
  const s = String(str).trim()

  // Unicode fraction characters produced by formatQuantity
  const UNI = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 }

  // Pure unicode fraction: "½"
  if (UNI[s] !== undefined) return UNI[s]

  // Mixed number with unicode fraction: "1½", "2⅓", etc.
  for (const [ch, val] of Object.entries(UNI)) {
    if (s.endsWith(ch)) {
      const whole = parseFloat(s.slice(0, -ch.length))
      if (!isNaN(whole)) return whole + val
    }
  }

  // Mixed number with slash fraction: "1 1/2"
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) return +mixedMatch[1] + +mixedMatch[2] / +mixedMatch[3]

  // Simple slash fraction: "1/2"
  const fracMatch = s.match(/^(\d+)\/(\d+)$/)
  if (fracMatch) return +fracMatch[1] / +fracMatch[2]

  return parseFloat(s) || 0
}

// Units that map to mL (volume) — key is the lowercase unit string as it
// appears in recipe data.
const VOL_TO_ML = {
  tsp:    4.92892,
  tbsp:   14.7868,
  'fl oz': 29.5735,
  cup:    236.588,
  cups:   236.588,
  pt:     473.176,
  qt:     946.353,
  gal:    3785.41,
}

// Units that map to g (weight)
const WEIGHT_TO_G = {
  oz:  28.3495,
  lb:  453.592,
}

function fmtVolume(ml) {
  if (ml >= 1000) {
    // Round to 1 decimal litre
    return { quantity: String(Math.round(ml / 100) / 10), unit: 'L' }
  }
  // < 5 mL: 1 decimal place; otherwise round to nearest 5
  const rounded = ml < 5
    ? Math.round(ml * 10) / 10
    : Math.round(ml / 5) * 5
  return { quantity: String(rounded), unit: 'mL' }
}

function fmtWeight(g) {
  if (g >= 1000) {
    return { quantity: String(Math.round(g / 100) / 10), unit: 'kg' }
  }
  // < 20 g: round to nearest gram; otherwise round to nearest 5 g
  const rounded = g < 20 ? Math.round(g) : Math.round(g / 5) * 5
  return { quantity: String(rounded), unit: 'g' }
}

/**
 * Convert a recipe ingredient's quantity + unit to metric equivalents.
 * Returns { quantity, unit } if the unit is a convertible customary unit,
 * or null if the unit should be left unchanged (whole, clove, pkg, etc.).
 *
 * @param {string} quantityStr  - Formatted quantity string (e.g. "1½", "2 1/3")
 * @param {string} unit         - Unit string as stored in recipe data
 */
export function convertToMetric(quantityStr, unit) {
  if (!unit) return null
  const u = unit.trim().toLowerCase()

  const volFactor = VOL_TO_ML[u]
  if (volFactor !== undefined) {
    const qty = parseQtyStr(quantityStr)
    if (!qty) return null
    return fmtVolume(qty * volFactor)
  }

  const wtFactor = WEIGHT_TO_G[u]
  if (wtFactor !== undefined) {
    const qty = parseQtyStr(quantityStr)
    if (!qty) return null
    return fmtWeight(qty * wtFactor)
  }

  return null // unit doesn't need conversion
}

/**
 * Convert a metric quantity + unit back to the closest clean customary equivalent.
 * Used when saving RecipeForm data that was entered in metric mode.
 * Returns { quantity, unit } if the unit is a metric unit, or null if no conversion needed.
 *
 * @param {string} quantityStr  - Metric quantity string (e.g. "240", "1.2")
 * @param {string} unit         - Metric unit ("mL", "ml", "L", "g", "kg")
 */
export function convertFromMetric(quantityStr, unit) {
  if (!unit) return null
  const u = unit.trim().toLowerCase()
  const qty = parseFloat(quantityStr)
  if (!qty || isNaN(qty)) return null

  if (u === 'ml') {
    // Choose the cleanest customary unit based on volume
    if (qty < 15) {
      return { quantity: formatQuantity(qty / 4.92892), unit: 'tsp' }
    }
    if (qty < 60) {
      return { quantity: formatQuantity(qty / 14.7868), unit: 'tbsp' }
    }
    return { quantity: formatQuantity(qty / 236.588), unit: 'cup' }
  }

  if (u === 'l') {
    return { quantity: formatQuantity(qty * 4.22675), unit: 'cup' }
  }

  if (u === 'g') {
    if (qty < 453.592) {
      return { quantity: formatQuantity(qty / 28.3495), unit: 'oz' }
    }
    return { quantity: formatQuantity(qty / 453.592), unit: 'lb' }
  }

  if (u === 'kg') {
    return { quantity: formatQuantity(qty * 2.20462), unit: 'lb' }
  }

  return null // not a metric unit
}

// ─── Serving-Size Scaling ─────────────────────────────────────────────────────

const SIZE_MULTIPLIER = {
  half:       0.5,
  single:     1,
  double:     2,
  triple:     3,
  quadruple:  4,
}

/**
 * Scale a recipe's servings, ingredients, and time to complete for a given
 * recipeSize preference. Returns a new recipe object; does not mutate the original.
 *
 * For baked goods with a batchSize field, bake time scales by batch count rather
 * than linearly. Prep time scales at 70% of the quantity multiplier to reflect
 * that doubling ingredients does not quite double active prep work.
 *
 * @param {object} recipe        - Recipe object from DEFAULT_RECIPES
 * @param {string} recipeSize    - One of "half" | "single" | "double" | "triple" | "quadruple"
 * @returns {object}             - Scaled recipe (new object, base data unchanged)
 */
export function scaleRecipe(recipe, recipeSize = 'single') {
  const factor = SIZE_MULTIPLIER[recipeSize] ?? 1
  if (factor === 1) return recipe

  const scaledServings = Math.round((recipe.servings ?? 4) * factor)

  // Scale ingredients
  const ingredients = (recipe.ingredients ?? []).map((ing) => {
    const rawQty = parseFloat(ing.quantity)
    if (isNaN(rawQty)) return ing
    return { ...ing, quantity: formatQuantity(rawQty * factor) }
  })

  // Scale timeToComplete phases
  const timeToComplete = _scaleTime(recipe, factor, scaledServings)

  return { ...recipe, servings: scaledServings, ingredients, timeToComplete }
}

function _scaleTime(recipe, factor, scaledServings) {
  const phases = recipe.timeToComplete
  if (!Array.isArray(phases)) return phases

  return phases.map((phase) => {
    if (PASSIVE_PHASES.has(phase.phase)) {
      // Passive phases (rise, chill, marinate, rest) don't scale with quantity
      return phase
    }

    if ((phase.phase === 'bake' || phase.phase === 'cook') && recipe.batchSize) {
      // Baked goods with a defined batch size: scale by number of batches
      const baseBatches = Math.ceil((recipe.servings ?? 4) / recipe.batchSize)
      const scaledBatches = Math.ceil(scaledServings / recipe.batchSize)
      const minutesPerBatch = Math.round(phase.minutes / baseBatches)
      return { ...phase, minutes: scaledBatches * minutesPerBatch }
    }

    if (phase.phase === 'prep') {
      // Prep scales at ~70% of quantity factor (chopping more doesn't take 2x as long)
      const scaledMin = Math.round(phase.minutes * (1 + (factor - 1) * 0.7))
      return { ...phase, minutes: scaledMin }
    }

    // Cook/bake without batchSize: stays the same regardless of scale
    return phase
  })
}
