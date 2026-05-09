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
    return stored ? JSON.parse(stored) : [...DEFAULT_HOUSEHOLD_GOODS]
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
