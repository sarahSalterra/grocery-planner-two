import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { getHouseholdGoods, addHouseholdGood } from '../db/householdGoodsDB'
import { getIngredients, addIngredient } from '../db/ingredientsDB'
import { DEPARTMENTS } from '../db/data/filterOptions'

function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─── Inline Add Panel ──────────────────────────────────────────────────────────

function AddItemPanel({ datalistId, datalistItems, onAdd, onCancel, allowCustomDept = false }) {
  const [name, setName] = useState('')
  const [dept, setDept] = useState('')

  function handleNameChange(val) {
    setName(val)
    const match = datalistItems.find((i) => i.name.toLowerCase() === val.toLowerCase())
    if (match) setDept(match.department ?? '')
    else if (!val) setDept('')
  }

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, dept.trim() || 'household')
    setName('')
    setDept('')
  }

  return (
    <div className="add-item-panel">
      {/* Suggestions for item names */}
      <datalist id={datalistId}>
        {datalistItems.map((i) => (
          <option key={i.id} value={i.name} />
        ))}
      </datalist>

      {/* Suggestions for departments */}
      <datalist id={`${datalistId}-depts`}>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
        ))}
      </datalist>

      <input
        className="form-input"
        list={datalistId}
        placeholder="Item name…"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        autoFocus
      />

      {/* Free-text department with datalist suggestions */}
      <input
        className="form-input"
        list={`${datalistId}-depts`}
        placeholder="Department (e.g. household, hygiene…)"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      />

      <div className="add-item-panel__actions">
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" onClick={handleAdd} disabled={!name.trim()}>
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Inventory Section ─────────────────────────────────────────────────────────

function InventorySection({ title, description, items, onRemove, onAdd, datalistId, datalistItems }) {
  const [adding, setAdding] = useState(false)

  function handleAdd(name, dept) {
    onAdd(name, dept)
    setAdding(false)
  }

  return (
    <div className="inventory-section">
      <div className="inventory-section__header">
        <h2 className="inventory-section__title">{title}</h2>
        {!adding && (
          <button className="inventory-add-btn" onClick={() => setAdding(true)}>+ Add</button>
        )}
      </div>
      <p className="inventory-section__desc">{description}</p>

      {items.length === 0 && !adding && (
        <p className="inventory-empty">No items yet. Add items using the button above.</p>
      )}

      <ul className="inventory-list">
        {items.map((item) => item && (
          <li key={item.id} className="inventory-item">
            <div className="inventory-item__info">
              <span className="inventory-item__name">{item.name}</span>
              <span className="inventory-item__dept">{item.department}</span>
            </div>
            <button
              className="inventory-item__remove"
              onClick={() => onRemove(item.id)}
              title="Remove"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <AddItemPanel
          datalistId={datalistId}
          datalistItems={datalistItems}
          onAdd={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InventoryLibrary() {
  const navigate = useNavigate()

  const [allGoods,       setAllGoods]       = useState(getHouseholdGoods)
  const [allIngredients, setAllIngredients] = useState(getIngredients)
  const [prefs,          setPrefs]          = useState(getPreferences)

  useEffect(() => {
    setAllGoods(getHouseholdGoods())
    setAllIngredients(getIngredients())
    setPrefs(getPreferences())
  }, [])

  // Combined pool for household inventory (goods + ingredients)
  const householdPool = useMemo(
    () => [...allGoods, ...allIngredients],
    [allGoods, allIngredients]
  )

  const householdIds = prefs.householdInventory ?? []
  const commonIds    = prefs.commonIngredients  ?? []

  // Resolve IDs → full item objects, skipping any that no longer exist
  const householdItems = householdIds
    .map((id) => householdPool.find((i) => i.id === id))
    .filter(Boolean)

  const commonItems = commonIds
    .map((id) => allIngredients.find((i) => i.id === id))
    .filter(Boolean)

  function updatePrefs(changes) {
    const updated = { ...prefs, ...changes }
    setPrefs(updated)
    savePreferences(updated)
  }

  // ── Household Inventory ────────────────────────────────────────────────────

  function removeFromHousehold(id) {
    updatePrefs({ householdInventory: householdIds.filter((i) => i !== id) })
  }

  function addToHousehold(name, dept) {
    // Check the full pool (goods + ingredients) for an existing match.
    // Ingredients carry their grocery department (dairy, produce, frozen, etc.)
    // so we always prefer that over the user-typed dept for food items.
    const existing = householdPool.find(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    )
    let id
    if (existing) {
      id = existing.id
      const isAlreadyGood = allGoods.some((g) => g.id === id)
      if (!isAlreadyGood) {
        addHouseholdGood({ id, name: existing.name, department: existing.department })
      }
    } else {
      id = slugify(name)
      addHouseholdGood({ id, name, department: dept || 'household' })
    }
    if (!householdIds.includes(id)) {
      updatePrefs({ householdInventory: [...householdIds, id] })
    }
  }

  // ── Common Ingredients ─────────────────────────────────────────────────────

  function removeFromCommon(id) {
    updatePrefs({ commonIngredients: commonIds.filter((i) => i !== id) })
  }

  function addToCommon(name, dept) {
    const existing = allIngredients.find(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    )
    let id
    if (existing) {
      id = existing.id
    } else {
      id = slugify(name)
      // Add a minimal ingredient entry — substitution fields can be filled in the ingredient library later
      addIngredient({
        id,
        name,
        department: dept,
        vegSubstitute: 'n/a', veganSubstitute: 'n/a', glutenSubstitute: 'n/a',
        dairySubstitute: 'n/a', fishSubstitute: 'n/a', allergySubstitute: 'none',
        strictSubstitute: 'none', regularSubstitute: 'none',
        lenientSubstitute: 'none', otherSubstitute: 'none',
      })
    }
    if (!commonIds.includes(id)) {
      updatePrefs({ commonIngredients: [...commonIds, id] })
    }
  }

  return (
    <div className="page library-page inventory-library-page">
      <div className="library-header">
        <button className="library-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="library-header__title">Inventory</h1>
        <div style={{ width: 60 }} />
      </div>

      <InventorySection
        title="Household Inventory"
        description="Items you always need stocked. The restock list will flag anything from this list that's running low."
        items={householdItems}
        onRemove={removeFromHousehold}
        onAdd={addToHousehold}
        datalistId="household-pool"
        datalistItems={householdPool}
      />

      <InventorySection
        title="Common Ingredients"
        description="Ingredients you usually have on hand. Meal planning will ask you to check your pantry for these before adding them to the shopping list."
        items={commonItems}
        onRemove={removeFromCommon}
        onAdd={addToCommon}
        datalistId="ingredient-pool"
        datalistItems={allIngredients}
      />
    </div>
  )
}
