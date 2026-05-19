/**
 * Capitalizes all substitute ingredient name strings in ingredients.js to match
 * the Title Case convention used for ingredient names.
 *
 * Sentinel values ("none", "n/a", "omit", "(can omit)") are left unchanged.
 * Array entries and single strings are both handled.
 */

const fs   = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../src/db/data/ingredients.js')

const SUBSTITUTE_FIELDS = [
  'vegSubstitute',
  'veganSubstitute',
  'glutenSubstitute',
  'dairySubstitute',
  'fishSubstitute',
  'allergySubstitute',
  'strictSubstitute',
  'regularSubstitute',
  'lenientSubstitute',
  'otherSubstitute',
]

// Values that must never be transformed
const SENTINELS = new Set(['none', 'n/a', 'omit', '(can omit)'])

function toTitleCase(str) {
  if (SENTINELS.has(str)) return str
  // Capitalise the first letter of every word, including after hyphens
  return str
    .split(/(\s+|-)/)
    .map((part) => {
      if (part === '-' || /^\s+$/.test(part)) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}

let src = fs.readFileSync(FILE, 'utf8')
let changeCount = 0

for (const field of SUBSTITUTE_FIELDS) {
  // Match  fieldName: "value"  or  fieldName: ["v1","v2",...]
  const fieldPattern = new RegExp(
    `(${field}\\s*:\\s*)("(?:[^"\\\\]|\\\\.)*"|\\[[^\\]]*\\])`,
    'g'
  )

  src = src.replace(fieldPattern, (match, prefix, valueExpr) => {
    if (valueExpr.startsWith('[')) {
      // Array: replace each quoted string inside
      const newArray = valueExpr.replace(/"((?:[^"\\]|\\.)*)"/g, (m, inner) => {
        const updated = toTitleCase(inner)
        if (updated !== inner) changeCount++
        return `"${updated}"`
      })
      return prefix + newArray
    } else {
      // Single string
      const inner = valueExpr.slice(1, -1) // strip quotes
      const updated = toTitleCase(inner)
      if (updated !== inner) changeCount++
      return prefix + `"${updated}"`
    }
  })
}

fs.writeFileSync(FILE, src, 'utf8')
console.log(`Done. ${changeCount} substitute value(s) capitalized.`)
