import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { buildGroceryList, DEPT_LABELS } from '../utils/groceryUtils'
import { getIngredients } from '../db/ingredientsDB'
import { getStackedSubOptions } from '../utils/dietaryUtils'
import { DEPARTMENTS } from '../db/data/filterOptions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n) {
  return String(Math.ceil(n))
}

const MAX_ADD_SUGGESTIONS = 6
const DEPT_ORDER = [...DEPARTMENTS, 'wholesale']

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
    setExtraItems(fresh.shopExtraItems ?? [])
  }, [])

  // Use the stored snapshot if present; fall back to computing on the fly
  // (backward compat for users whose list was saved before this change).
  // If the user explicitly cleared the list, surface an empty array.
  const sections = useMemo(() => {
    if (preferences.shoppingListCleared) return []
    const stored = preferences.groceryListSections ?? []
    return stored.length > 0 ? stored : buildGroceryList(preferences)
  }, [preferences])

  // Ingredients map + sub mode — used to show optional substitutions per item
  const allIngredients = useMemo(getIngredients, [])
  const ingredientsMap = useMemo(
    () => Object.fromEntries(allIngredients.map((i) => [i.id, i])),
    [allIngredients]
  )
  const subMode = preferences.substitutionMode ?? 'regular'

  // Which items currently have their substitutions expanded
  const [expandedSubs, setExpandedSubs] = useState(new Set())

  function toggleSubs(e, key) {
    e.stopPropagation()
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

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

  function clearList() {
    setChecked(new Set())
    setExtraItems([])
    const updated = {
      ...preferences,
      shoppingListCleared: true,
      shoppingChecked: [],
      shopExtraItems: [],
    }
    setPreferences(updated)
    savePreferences(updated)
  }

  function reloadList() {
    setChecked(new Set())
    setExtraItems([])
    const updated = {
      ...preferences,
      shoppingListCleared: false,
      shoppingChecked: [],
      shopExtraItems: [],
    }
    setPreferences(updated)
    savePreferences(updated)
  }

  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferences(updated)
    savePreferences(updated)
  }

  // ── Manually-added extra items ────────────────────────────────────────────
  const [extraItems, setExtraItems] = useState(() => preferences.shopExtraItems ?? [])
  const [addInput, setAddInput]     = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const addInputRef = useRef(null)

  const addSuggestions = useMemo(() => {
    const q = addInput.trim().toLowerCase()
    if (!q) return []
    const alreadyAdded = new Set(extraItems.map((e) => e.name.toLowerCase()))
    return allIngredients
      .filter((ing) =>
        ing.name.toLowerCase().includes(q) &&
        !alreadyAdded.has(ing.name.toLowerCase())
      )
      .slice(0, MAX_ADD_SUGGESTIONS)
  }, [addInput, allIngredients, extraItems])

  function addExtraItem(name, ingredientId, department) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (extraItems.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())) return
    const newItem = { name: trimmed, department: department || 'pantry', ingredientId: ingredientId ?? null }
    const next = [...extraItems, newItem]
    setExtraItems(next)
    setAddInput('')
    setShowSuggestions(false)
    const updated = { ...preferences, shopExtraItems: next }
    setPreferences(updated)
    savePreferences(updated)
    addInputRef.current?.focus()
  }

  function commitAdd(val) {
    const trimmed = val.trim()
    if (!trimmed) return
    const match = allIngredients.find((i) => i.name.toLowerCase() === trimmed.toLowerCase())
    addExtraItem(match?.name ?? trimmed, match?.id ?? null, match?.department ?? 'pantry')
  }

  function removeExtraItem(name) {
    const key = `extra::${name}`
    const nextExtra   = extraItems.filter((e) => e.name !== name)
    const nextChecked = new Set(checked)
    nextChecked.delete(key)
    setExtraItems(nextExtra)
    setChecked(nextChecked)
    const updated = { ...preferences, shopExtraItems: nextExtra, shoppingChecked: [...nextChecked] }
    setPreferences(updated)
    savePreferences(updated)
  }

  // ── Merge extra items into sections by department ─────────────────────────
  const displaySections = useMemo(() => {
    if (extraItems.length === 0) return sections

    const result   = sections.map((s) => ({ ...s, items: [...s.items] }))
    const deptIndex = Object.fromEntries(result.map((s, i) => [s.dept, i]))

    for (const extra of extraItems) {
      const dept = extra.department || 'pantry'
      const item = {
        key:        `extra::${extra.name}`,
        id:         extra.ingredientId ?? `extra-${extra.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        name:       extra.name,
        department: dept,
        qty:        null,
        unit:       null,
        atLeast:    false,
        isExtra:    true,
      }

      if (deptIndex[dept] !== undefined) {
        result[deptIndex[dept]].items.push(item)
        result[deptIndex[dept]].items.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        const label = DEPT_LABELS[dept] ?? (dept.charAt(0).toUpperCase() + dept.slice(1))
        const newIdx = result.length
        result.push({ dept, label, items: [item] })
        deptIndex[dept] = newIdx
      }
    }

    result.sort((a, b) => {
      const ai = DEPT_ORDER.indexOf(a.dept)
      const bi = DEPT_ORDER.indexOf(b.dept)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })

    return result
  }, [sections, extraItems])

  const totalItems  = displaySections.reduce((sum, s) => sum + s.items.length, 0)
  const allDone     = totalItems > 0 && checkedCount === totalItems

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

        {/* ── Add-item search bar (always visible) ── */}
        <div className="shop-add-bar">
          <div className="shop-add-input-wrap">
            <input
              ref={addInputRef}
              className="shop-add-input"
              type="text"
              placeholder="Search to add an item…"
              value={addInput}
              onChange={(e) => { setAddInput(e.target.value); setShowSuggestions(true) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  { e.preventDefault(); commitAdd(addInput) }
                if (e.key === 'Escape') setShowSuggestions(false)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              autoComplete="off"
            />
            {showSuggestions && addSuggestions.length > 0 && (
              <ul className="shop-add-suggestions" role="listbox">
                {addSuggestions.map((ing) => (
                  <li
                    key={ing.id}
                    className="shop-add-suggestion"
                    role="option"
                    onMouseDown={() => addExtraItem(ing.name, ing.id, ing.department)}
                  >
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className="btn btn--primary"
            onClick={() => commitAdd(addInput)}
            disabled={!addInput.trim()}
          >
            Add
          </button>
        </div>

        {totalItems === 0 ? (
          <div className="placeholder-block">
            <p>Your grocery list is empty.</p>
            {preferences.shoppingListCleared && (preferences.groceryListSections ?? []).length > 0 ? (
              <>
                <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  Your last list is saved — reload it anytime.
                </p>
                <button
                  className="btn btn--secondary"
                  style={{ marginTop: 12 }}
                  onClick={reloadList}
                >
                  Reload List
                </button>
              </>
            ) : (
              <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
                Select recipes in Meal Planning and / or items in the Restock List first,
                or add items above.
              </p>
            )}
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
                {allDone ? (
                  <div className="shop-progress__actions">
                    <button className="shop-progress__reset" onClick={reloadList}>
                      Reload List
                    </button>
                    <button className="shop-progress__reset shop-progress__reset--clear" onClick={clearList}>
                      Clear List
                    </button>
                  </div>
                ) : checkedCount > 0 ? (
                  <button className="shop-progress__reset" onClick={resetChecked}>
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            {/* ── Department sections ── */}
            {displaySections.map(({ dept, label, items }) => (
              <div
                key={dept}
                className={`shop-dept ${dept === 'wholesale' ? 'shop-dept--wholesale' : ''}`}
              >
                <h2 className="shop-dept__title">{label}</h2>
                <ul className="shop-item-list">
                  {items.map((item) => {
                    const isChecked  = checked.has(item.key)
                    const subsOpen   = expandedSubs.has(item.key)
                    const qtyText    = item.qty !== null
                      ? `${item.atLeast ? 'at least ' : ''}${fmtNum(item.qty)} ${item.unit}`
                      : null
                    const subOptions = getStackedSubOptions(ingredientsMap[item.id], subMode)
                    const hasSubs    = subOptions.length > 0

                    return (
                      <li
                        key={item.key}
                        className={`shop-item ${isChecked ? 'shop-item--checked' : ''} ${subsOpen ? 'shop-item--subs-open' : ''}`}
                        onClick={() => toggleChecked(item.key)}
                      >
                        <span className={`shop-item__box ${isChecked ? 'shop-item__box--on' : ''}`}>
                          {isChecked ? '✓' : ''}
                        </span>
                        <div className="shop-item__body">
                          <div className="shop-item__row">
                            <span className="shop-item__name">{item.name}</span>
                            <div className="shop-item__right">
                              {qtyText && (
                                <span className={`shop-item__qty ${item.atLeast ? 'shop-item__qty--atleast' : ''}`}>
                                  {qtyText}
                                </span>
                              )}
                              {hasSubs && (
                                <button
                                  className={`shop-sub-btn ${subsOpen ? 'shop-sub-btn--open' : ''}`}
                                  onClick={(e) => toggleSubs(e, item.key)}
                                  title={subsOpen ? 'Hide substitutions' : 'Show substitutions'}
                                >
                                  Sub
                                </button>
                              )}
                              {item.isExtra && (
                                <button
                                  className="shop-item__remove"
                                  onClick={(e) => { e.stopPropagation(); removeExtraItem(item.name) }}
                                  title="Remove from list"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          {hasSubs && subsOpen && (
                            <div className="shop-sub-list">
                              <span className="shop-sub-list__label">If unavailable, try:</span>
                              <ul className="shop-sub-list__items">
                                {subOptions.map((sub, i) => (
                                  <li key={i} className="shop-sub-list__item">{sub}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
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
