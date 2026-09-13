import DEFAULT_HOUSEHOLD_GOODS from './data/householdGoods.js'

const KEY = 'gp_household_goods'
const DEFAULTS_KEY = 'gp_household_goods_defaults'

export function initHouseholdGoodsDB() {
  if (!localStorage.getItem(DEFAULTS_KEY)) {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(DEFAULT_HOUSEHOLD_GOODS))
  }
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_HOUSEHOLD_GOODS))
  }
}

export function getHouseholdGoods() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return [...DEFAULT_HOUSEHOLD_GOODS]
    const storedList = JSON.parse(stored)
    const defaultsMap = Object.fromEntries(DEFAULT_HOUSEHOLD_GOODS.map((g) => [g.id, g]))
    const storedIds = new Set(storedList.map((g) => g.id))
    const SOURCE_FIELDS = ['name', 'department']

    const merged = storedList.map((good) => {
      const def = defaultsMap[good.id]
      if (!def) return good
      const result = { ...def, ...good }
      for (const f of SOURCE_FIELDS) {
        if (f in def) result[f] = def[f]
      }
      return result
    })

    const newDefaults = DEFAULT_HOUSEHOLD_GOODS.filter((g) => !storedIds.has(g.id))
    return [...merged, ...newDefaults]
  } catch {
    return [...DEFAULT_HOUSEHOLD_GOODS]
  }
}

export function saveHouseholdGoods(goods) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goods))
  } catch (e) {
    console.error('Failed to save household goods:', e)
  }
}

export function addHouseholdGood(good) {
  const goods = getHouseholdGoods()
  const updated = [...goods, { ...good, id: good.id ?? `good-${Date.now()}` }]
  saveHouseholdGoods(updated)
  return updated
}

export function updateHouseholdGood(id, changes) {
  const goods = getHouseholdGoods()
  const updated = goods.map((g) => (g.id === id ? { ...g, ...changes } : g))
  saveHouseholdGoods(updated)
  return updated
}

export function deleteHouseholdGood(id) {
  const goods = getHouseholdGoods()
  const updated = goods.filter((g) => g.id !== id)
  saveHouseholdGoods(updated)
  return updated
}

export function revertHouseholdGoodsToDefaults() {
  try {
    const defaults = localStorage.getItem(DEFAULTS_KEY)
    localStorage.setItem(KEY, defaults ?? JSON.stringify(DEFAULT_HOUSEHOLD_GOODS))
  } catch (e) {
    console.error('Failed to revert household goods:', e)
  }
}
