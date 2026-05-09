import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { buildGroceryList } from '../utils/groceryUtils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n) {
  return String(Math.ceil(n))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Shop() {
  const navigate = useNavigate()
  const location = useLocation()
  const [preferences, setPreferences] = useState(getPreferences)

  // Re-read preferences on every mount so navigating back always reflects
  // the latest grocery list built by MealPlanning or RestockList.
  useEffect(() => {
    const fresh = getPreferences()
    setPreferences(fresh)
    setChecked(new Set(fresh.shoppingChecked ?? []))
  }, [])

  // Use the stored snapshot if present; fall back to computing on the fly
  // (backward compat for users whose list was saved before this change).
  const sections = useMemo(() => {
    const stored = preferences.groceryListSections ?? []
    return stored.length > 0 ? stored : buildGroceryList(preferences)
  }, [preferences])

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)

  // ── Checked state (persisted so re-opening mid-shop restores progress) ────
  const [checked, setChecked] = useState(() => new Set(preferences.shoppingChecked ?? []))
  const checkedCount = checked.size

  function toggleChecked(key) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      savePreferences({ ...preferences, shoppingChecked: [...next] })
      return next
    })
  }

  function resetChecked() {
    setChecked(new Set())
    const updated = { ...preferences, shoppingChecked: [] }
    setPreferences(updated)
    savePreferences(updated)
  }

  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferences(updated)
    savePreferences(updated)
  }

  const allDone = totalItems > 0 && checkedCount === totalItems

  return (
    <div className="page step-page shop-page">

      {/* ── Header ── */}
      <div className="step-page__header">
        <button className="step-back-btn" onClick={() => navigate('/')}>← Main Menu</button>
        <div className="step-page__header-row">
          <h1 className="step-page__title">🛒 Step 3 — Shop</h1>
          <MiniSettings preferences={preferences} onUpdate={handlePreferenceUpdate} hideShortcut />
        </div>
        <p className="step-page__subtitle">Check items off as you add them to your cart.</p>
      </div>

      <div className="step-page__body">

        {totalItems === 0 ? (
          <div className="placeholder-block">
            <p>Your grocery list is empty.</p>
            <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
              Select recipes in Meal Planning and / or items in the Restock List first.
            </p>
          </div>
        ) : (
          <>
            {/* ── Progress bar ── */}
            <div className="shop-progress">
              <div className="shop-progress__track">
                <div
                  className={`shop-progress__fill ${allDone ? 'shop-progress__fill--done' : ''}`}
                  style={{ width: `${(checkedCount / totalItems) * 100}%` }}
                />
              </div>
              <div className="shop-progress__row">
                <span className="shop-progress__label">
                  {allDone ? '✓ All done!' : `${checkedCount} of ${totalItems} items`}
                </span>
                {checkedCount > 0 && (
                  <button className="shop-progress__reset" onClick={resetChecked}>
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* ── Department sections ── */}
            {sections.map(({ dept, label, items }) => (
              <div
                key={dept}
                className={`shop-dept ${dept === 'wholesale' ? 'shop-dept--wholesale' : ''}`}
              >
                <h2 className="shop-dept__title">{label}</h2>
                <ul className="shop-item-list">
                  {items.map((item) => {
                    const isChecked = checked.has(item.key)
                    const qtyText = item.qty !== null
                      ? `${item.atLeast ? 'at least ' : ''}${fmtNum(item.qty)} ${item.unit}`
                      : null

                    return (
                      <li
                        key={item.key}
                        className={`shop-item ${isChecked ? 'shop-item--checked' : ''}`}
                        onClick={() => toggleChecked(item.key)}
                      >
                        <span className={`shop-item__box ${isChecked ? 'shop-item__box--on' : ''}`}>
                          {isChecked ? '✓' : ''}
                        </span>
                        <span className="shop-item__name">{item.name}</span>
                        {qtyText && (
                          <span className={`shop-item__qty ${item.atLeast ? 'shop-item__qty--atleast' : ''}`}>
                            {qtyText}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>

      <StepNav currentPath={location.pathname} preferences={preferences} />
    </div>
  )
}
