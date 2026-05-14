import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { getHouseholdGoods } from '../db/householdGoodsDB'
import { getIngredients } from '../db/ingredientsDB'
import { DEPARTMENTS, ADDITIONAL_DEPARTMENTS } from '../db/data/filterOptions'
import { buildGroceryList } from '../utils/groceryUtils'

const DEPT_LABELS = {
  produce:              'Produce',
  pantry:               'Pantry',
  deli:                 'Deli',
  bakery:               'Bakery',
  spices:               'Spices',
  baking:               'Baking',
  butchery:             'Butcher',
  frozen:               'Frozen',
  dairy:                'Dairy',
  snacks:               'Snacks',
  drinks:               'Drinks',
  florist:              'Florist',
  household:            'Household',
  hygiene:              'Hygiene',
  pets:                 'Pets',
  baby:                 'Baby',
  wholesale:            'Wholesale',
  'international market': 'International Market',
}

const ALL_DEPARTMENTS = [...DEPARTMENTS, ...ADDITIONAL_DEPARTMENTS]

export default function RestockList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [preferences,    setPreferences]    = useState(getPreferences)
  const [allGoods,       setAllGoods]       = useState(getHouseholdGoods)
  const [allIngredients, setAllIngredients] = useState(getIngredients)

  useEffect(() => {
    setPreferences(getPreferences())
    setAllGoods(getHouseholdGoods())
    setAllIngredients(getIngredients())
  }, [])

  const ingredientsMap = useMemo(
    () => Object.fromEntries(allIngredients.map((i) => [i.id, i])),
    [allIngredients]
  )

  // ── Derive: filter goods to only what's in the user's household inventory ──
  // For IDs that were stored from an ingredient match (before the fix that
  // auto-registers them as goods), fall back to the ingredients map so
  // existing saved data still renders correctly.
  const inventoryIds   = new Set(preferences.householdInventory ?? [])
  const inventoryItems = useMemo(() => {
    return [...inventoryIds]
      .map((id) => {
        const good = allGoods.find((g) => g.id === id)
        if (good) return good
        const ing = ingredientsMap[id]
        if (ing) return { id: ing.id, name: ing.name, department: ing.department }
        return null
      })
      .filter(Boolean)
  }, [allGoods, ingredientsMap, preferences.householdInventory])

  // ── Group items by department (maintaining DEPARTMENTS display order) ──────
  const departmentGroups = useMemo(() => {
    const byDept = {}
    inventoryItems.forEach((item) => {
      if (!byDept[item.department]) byDept[item.department] = []
      byDept[item.department].push(item)
    })
    // Return in the canonical department order, skipping empty departments
    return ALL_DEPARTMENTS.filter((d) => byDept[d]?.length > 0).map((d) => ({
      dept:  d,
      label: DEPT_LABELS[d] ?? d.charAt(0).toUpperCase() + d.slice(1),
      items: byDept[d],
    }))
  }, [inventoryItems])

  // ── Selected items (items that need restocking) ───────────────────────────
  const [selected, setSelected] = useState(
    () => new Set(preferences.selectedRestockItems ?? [])
  )

  // ── Wholesale toggle state ────────────────────────────────────────────────
  const showWholesaleToggle = preferences.wholesale === true
  const [restockWholesale, setRestockWholesale] = useState(
    preferences.restockWholesale ?? false
  )

  // ── Preference update (MiniSettings) ─────────────────────────────────────
  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferences(updated)
    savePreferences(updated)
  }

  // ── Toggle an item's selected state ──────────────────────────────────────
  function toggleItem(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      const base = {
        ...preferences,
        selectedRestockItems: [...next],
        restockWholesale,
      }
      const updated = { ...base, groceryListSections: buildGroceryList(base) }
      savePreferences(updated)
      return next
    })
  }

  // ── Toggle wholesale mode ─────────────────────────────────────────────────
  function toggleWholesale() {
    const next = !restockWholesale
    setRestockWholesale(next)
    const base = {
      ...preferences,
      selectedRestockItems: [...selected],
      restockWholesale: next,
    }
    const updated = { ...base, groceryListSections: buildGroceryList(base) }
    setPreferences(updated)
    savePreferences(updated)
  }

  const selectedCount = selected.size

  return (
    <div className="page step-page restock-page">

      {/* ── Header ── */}
      <div className="step-page__header">
        <button className="step-back-btn" onClick={() => navigate('/')}>← Main Menu</button>
        <div className="step-page__header-row">
          <h1 className="step-page__title">🏠 Step 2 — Restock List</h1>
          <MiniSettings preferences={preferences} onUpdate={handlePreferenceUpdate} hideShortcut />
        </div>
        <p className="step-page__subtitle">
          Select any household items you need to restock this trip.
        </p>
      </div>

      <div className="step-page__body">

        {/* ── Wholesale toggle ── */}
        {showWholesaleToggle && (
          <div className="restock-wholesale-row">
            <div className="restock-wholesale-label">
              <span className="restock-wholesale-title">Shop Wholesale</span>
              <span className="restock-wholesale-desc">
                Sends selected items to a separate wholesale section in your shopping list
              </span>
            </div>
            <button
              className={`toggle ${restockWholesale ? 'toggle--on' : ''}`}
              onClick={toggleWholesale}
              role="switch"
              aria-checked={restockWholesale}
            >
              <span className="toggle__knob" />
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {inventoryItems.length === 0 ? (
          <div className="placeholder-block">
            <p>Your household inventory is empty.</p>
            <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
              Add items in Settings → Customize Inventory to track what you restock.
            </p>
          </div>
        ) : (
          <>
            {/* ── Selection summary ── */}
            {selectedCount > 0 && (
              <div className="restock-summary">
                <span className="restock-summary__count">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </span>
                {restockWholesale && (
                  <span className="restock-summary__wholesale">→ Wholesale</span>
                )}
                <button
                  className="restock-summary__clear"
                  onClick={() => {
                    setSelected(new Set())
                    const updated = { ...preferences, selectedRestockItems: [] }
                    setPreferences(updated)
                    savePreferences(updated)
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ── Department sections ── */}
            {departmentGroups.map(({ dept, label, items }) => (
              <div key={dept} className="restock-dept">
                <h2 className="restock-dept__title">{label}</h2>
                <div className="restock-item-grid">
                  {items.map((item) => {
                    const isSelected = selected.has(item.id)
                    return (
                      <button
                        key={item.id}
                        className={`restock-item ${isSelected ? 'restock-item--selected' : ''}`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <span className="restock-item__check">
                          {isSelected ? '✓' : ''}
                        </span>
                        <span className="restock-item__name">{item.name}</span>
                        {isSelected && restockWholesale && (
                          <span className="restock-item__ws-tag">W</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

      </div>

      <StepNav currentPath={location.pathname} preferences={preferences} />
    </div>
  )
}
