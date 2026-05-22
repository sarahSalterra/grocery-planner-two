import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecipes, addRecipe, updateRecipe, deleteRecipe } from '../db/recipesDB'
import { getIngredients, addIngredient, updateIngredient } from '../db/ingredientsDB'
import { getPreferences } from '../db/preferencesDB'
import {
  CUISINES, DISH_TYPES, DIFFICULTIES, PRICE_LEVELS,
  TIME_REQUIREMENTS, MULTI_TASK_OPTIONS,
} from '../db/data/filterOptions'
import { convertToMetric, convertFromMetric } from '../utils/recipeUtils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UNITS_CUSTOMARY = ['oz', 'lb', 'cup', 'tbsp', 'tsp', 'whole', 'cloves', 'slices', 'portions', 'pinch', 'pkg', 'can', 'bunch', 'stalk', 'head', 'sheet']
const UNITS_METRIC    = ['mL', 'L', 'g', 'kg', 'whole', 'cloves', 'slices', 'portions', 'pinch', 'pkg', 'can', 'bunch', 'stalk', 'head', 'sheet']

function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Convert substitute value (string | array | "none") to editable string
function subToString(val) {
  if (!val || val === 'none' || val === 'n/a') return val ?? ''
  return Array.isArray(val) ? val.join(', ') : String(val)
}

// Parse editable string back to substitute value
function stringToSub(str) {
  const s = str.trim()
  if (!s || s === 'none' || s === 'omit' || s === 'n/a') return s || 'none'
  if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean)
  return s
}

// Get the mode-specific substitute field name
function modeSubstituteField(mode) {
  return mode === 'strict' ? 'strictSubstitute'
    : mode === 'lenient'   ? 'lenientSubstitute'
    : 'regularSubstitute'
}

// ─── Blank templates ──────────────────────────────────────────────────────────

// ingredientName = what the user types (friendly name, resolved to ID on save)
const blankIngredient = () => ({
  ingredientName: '', quantity: '', unit: 'oz', shortcutSubstitute: '', substitute: ''
})

const blankStep = () => ({
  name: '', text: '', shortcutText: 'no-shortcut'
})

const TIME_PHASES = ['prep', 'cook', 'bake', 'rise', 'chill', 'marinate', 'rest']

const blankPhase = () => ({ phase: 'prep', minutes: '' })

const blankForm = {
  name: '',
  cuisine: '',
  dishType: '',
  difficulty: '',
  priceLevel: '',
  timeRequirement: '',
  multiTasking: '',
  mealprepIdeal: 'no',
  shortcutReplaces: '',
  servings: '',
  caloriesPerServing: '',
  timeToComplete: [],
  ingredients: [],
  steps: [],
  recommendedSides: [],
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({ title, children }) {
  return (
    <div className="form-section">
      <h2 className="form-section__title">{title}</h2>
      {children}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecipeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const preferences = useMemo(getPreferences, [])
  const substitutionMode = preferences.substitutionMode ?? 'regular'
  const subFieldName = modeSubstituteField(substitutionMode)
  const subFieldLabel = `${substitutionMode.charAt(0).toUpperCase() + substitutionMode.slice(1)} Substitute`
  const metricUnits = preferences.metricUnits ?? false

  const allIngredients = useMemo(getIngredients, [])
  const allRecipes = useMemo(getRecipes, [])

  // ── Load existing recipe (edit) or blank (new) ────────────────────────────
  const [form, setForm] = useState(() => {
    if (!isEdit) return { ...blankForm }
    const existing = allRecipes.find((r) => r.id === id)
    if (!existing) return { ...blankForm }

    // Hydrate each ingredient: translate stored ID → display name, pull current substitute
    // If metric mode is active, pre-convert quantities/units for editing convenience
    const ingredientsWithSub = existing.ingredients.map((ri) => {
      const ingData = allIngredients.find((i) => i.id === ri.ingredientId)
      let quantity = ri.quantity
      let unit     = ri.unit
      if (metricUnits) {
        const converted = convertToMetric(ri.quantity, ri.unit)
        if (converted) { quantity = converted.quantity; unit = converted.unit }
      }
      return {
        ...ri,
        quantity,
        unit,
        ingredientName: ingData?.name ?? ri.ingredientId,
        substitute: subToString(ingData?.[subFieldName] ?? 'none'),
      }
    })

    return {
      ...existing,
      shortcutReplaces:    existing.shortcutReplaces    ?? '',
      servings:            existing.servings            ?? '',
      caloriesPerServing:  existing.caloriesPerServing  ?? '',
      timeToComplete:      existing.timeToComplete      ?? [],
      ingredients: ingredientsWithSub,
      recommendedSides: existing.recommendedSides ?? [],
    }
  })

  // ── Field updates ─────────────────────────────────────────────────────────

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Ingredients ───────────────────────────────────────────────────────────

  function addIngredient() {
    setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, blankIngredient()] }))
  }

  function updateIngredientField(index, field, value) {
    setForm((prev) => {
      const list = [...prev.ingredients]
      list[index] = { ...list[index], [field]: value }
      return { ...prev, ingredients: list }
    })
  }

  function removeIngredientRow(index) {
    setForm((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))
  }

  // ── Steps ─────────────────────────────────────────────────────────────────

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, blankStep()] }))
  }

  function updateStep(index, field, value) {
    setForm((prev) => {
      const list = [...prev.steps]
      list[index] = { ...list[index], [field]: value }
      return { ...prev, steps: list }
    })
  }

  function moveStep(index, direction) {
    setForm((prev) => {
      const list = [...prev.steps]
      const target = index + direction
      if (target < 0 || target >= list.length) return prev
      ;[list[index], list[target]] = [list[target], list[index]]
      return { ...prev, steps: list }
    })
  }

  function removeStep(index) {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))
  }

  // ── Recommended sides ─────────────────────────────────────────────────────

  function addSide() {
    setForm((prev) => ({ ...prev, recommendedSides: [...prev.recommendedSides, ''] }))
  }

  function updateSide(index, value) {
    setForm((prev) => {
      const list = [...prev.recommendedSides]
      list[index] = value
      return { ...prev, recommendedSides: list }
    })
  }

  function removeSide(index) {
    setForm((prev) => ({ ...prev, recommendedSides: prev.recommendedSides.filter((_, i) => i !== index) }))
  }

  // ── Time phases ───────────────────────────────────────────────────────────

  function addPhase() {
    setForm((prev) => ({ ...prev, timeToComplete: [...prev.timeToComplete, blankPhase()] }))
  }

  function updatePhase(index, field, value) {
    setForm((prev) => {
      const list = [...prev.timeToComplete]
      list[index] = { ...list[index], [field]: value }
      return { ...prev, timeToComplete: list }
    })
  }

  function removePhase(index) {
    setForm((prev) => ({ ...prev, timeToComplete: prev.timeToComplete.filter((_, i) => i !== index) }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!form.name.trim()) {
      alert('Recipe name is required.')
      return
    }

    const recipeId = isEdit ? id : slugify(form.name)

    // Resolve each ingredient row: name → ID, creating new DB entries for custom ones
    const newlyCreated = new Set() // guard against duplicate creates in the same save

    const resolvedIngredients = form.ingredients
      .filter((ing) => (ing.ingredientName ?? '').trim())
      .map((ing) => {
        const typedName = (ing.ingredientName ?? '').trim()

        // Match existing ingredient by name (case-insensitive)
        const match = allIngredients.find(
          (i) => i.name.toLowerCase() === typedName.toLowerCase()
        )

        let resolvedId
        if (match) {
          resolvedId = match.id
        } else {
          // Custom ingredient: slugify name, create a DB entry the first time we see it
          resolvedId = slugify(typedName) || `ingredient-${Date.now()}`
          if (!newlyCreated.has(resolvedId)) {
            newlyCreated.add(resolvedId)
            const subVal = ing.substitute?.trim() ? stringToSub(ing.substitute) : 'none'
            addIngredient({
              id:                resolvedId,
              name:              typedName,
              department:        'pantry',
              vegSubstitute:     'n/a',
              veganSubstitute:   'n/a',
              glutenSubstitute:  'n/a',
              dairySubstitute:   'n/a',
              fishSubstitute:    'n/a',
              allergySubstitute: 'none',
              strictSubstitute:  'none',
              regularSubstitute: 'none',
              lenientSubstitute: 'none',
              otherSubstitute:   'none',
              [subFieldName]:    subVal,
            })
          }
        }

        // If saved in metric units, convert back to customary for storage
        const backConverted = convertFromMetric(ing.quantity, ing.unit)
        const storedQty  = backConverted ? backConverted.quantity : ing.quantity
        const storedUnit = backConverted ? backConverted.unit     : ing.unit

        return {
          ingredientId:       resolvedId,
          quantity:           storedQty,
          unit:               storedUnit,
          shortcutSubstitute: ing.shortcutSubstitute?.trim() || 'none',
          _substitute:        ing.substitute, // carry through for existing-ingredient update
        }
      })

    const recipe = {
      id:              recipeId,
      name:            form.name.trim(),
      cuisine:         form.cuisine,
      dishType:        form.dishType,
      difficulty:      form.difficulty,
      priceLevel:      form.priceLevel,
      timeRequirement: form.timeRequirement,
      multiTasking:    form.multiTasking,
      mealprepIdeal:   form.mealprepIdeal,
      shortcutReplaces: form.shortcutReplaces.trim() || null,
      servings:           form.servings           !== '' ? Number(form.servings)           : undefined,
      caloriesPerServing: form.caloriesPerServing  !== '' ? Number(form.caloriesPerServing) : undefined,
      timeToComplete: form.timeToComplete
        .filter((p) => p.phase && p.minutes !== '')
        .map((p) => ({ phase: p.phase, minutes: Number(p.minutes) })),
      // Strip internal _substitute field before storing
      ingredients: resolvedIngredients.map(({ _substitute, ...rest }) => rest),
      steps: form.steps.filter((s) => s.name.trim() || s.text.trim()),
      recommendedSides: form.recommendedSides.filter(Boolean),
    }

    if (isEdit) updateRecipe(id, recipe)
    else addRecipe(recipe)

    // For existing ingredients, update their substitute value if it changed
    resolvedIngredients.forEach((resolved) => {
      if (newlyCreated.has(resolved.ingredientId)) return // already set on creation
      if (!resolved._substitute?.trim()) return
      const existing = allIngredients.find((i) => i.id === resolved.ingredientId)
      if (!existing) return
      const newVal = stringToSub(resolved._substitute)
      if (subToString(existing[subFieldName]) !== subToString(newVal)) {
        updateIngredient(resolved.ingredientId, { [subFieldName]: newVal })
      }
    })

    navigate(-1)
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    deleteRecipe(id)
    navigate(-1)
  }

  // ─── Datalists ──────────────────────────────────────────────────────────────

  // Ingredients: value = friendly name (resolved to ID on save)
  const ingredientDatalist = (
    <datalist id="ingredient-names">
      {allIngredients.map((i) => (
        <option key={i.id} value={i.name} />
      ))}
    </datalist>
  )

  // Units: standard units as suggestions, but free-text is allowed
  // Show metric-first list when metric mode is active
  const unitDatalist = (
    <datalist id="unit-options">
      {(metricUnits ? UNITS_METRIC : UNITS_CUSTOMARY).map((u) => <option key={u} value={u} />)}
    </datalist>
  )

  const recipeDatalist = (
    <datalist id="recipe-ids">
      {allRecipes
        .filter((r) => r.id !== id)
        .map((r) => <option key={r.id} value={r.id}>{r.name}</option>)
      }
    </datalist>
  )

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="page recipe-form-page">
      {ingredientDatalist}
      {unitDatalist}
      {recipeDatalist}

      {/* Header */}
      <div className="library-header">
        <button className="library-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="library-header__title">{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
        <button className="btn btn--primary" onClick={handleSave}>Save</button>
      </div>

      <div className="recipe-form">

        {/* Basic Info */}
        <FormSection title="Basic Info">
          <FormField label="Recipe Name *">
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Spaghetti Bolognese"
            />
          </FormField>
          <div className="form-row">
            <FormField label="Cuisine">
              <select className="form-select" value={form.cuisine} onChange={(e) => setField('cuisine', e.target.value)}>
                <option value="">— Select —</option>
                {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Dish Type">
              <select className="form-select" value={form.dishType} onChange={(e) => setField('dishType', e.target.value)}>
                <option value="">— Select —</option>
                {DISH_TYPES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Servings Yielded">
            <input
              className="form-input form-input--sm"
              type="number"
              min="1"
              value={form.servings}
              onChange={(e) => setField('servings', e.target.value)}
              placeholder="e.g. 4"
            />
          </FormField>

          <FormField label="Calories per Serving (optional)">
            <input
              className="form-input form-input--sm"
              type="number"
              min="0"
              value={form.caloriesPerServing}
              onChange={(e) => setField('caloriesPerServing', e.target.value)}
              placeholder="e.g. 450"
            />
          </FormField>

          <FormField label="Time to Complete">
            {form.timeToComplete.length === 0 && (
              <p className="form-empty-note">No time phases added yet.</p>
            )}
            {form.timeToComplete.map((phase, i) => (
              <div key={i} className="phase-row">
                <select
                  className="form-select phase-row__phase"
                  value={phase.phase}
                  onChange={(e) => updatePhase(i, 'phase', e.target.value)}
                >
                  {TIME_PHASES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <input
                  className="form-input phase-row__mins"
                  type="number"
                  min="1"
                  value={phase.minutes}
                  onChange={(e) => updatePhase(i, 'minutes', e.target.value)}
                  placeholder="mins"
                />
                <span className="phase-row__unit">min</span>
                <button className="form-remove-btn" onClick={() => removePhase(i)} title="Remove">✕</button>
              </div>
            ))}
            <button className="form-add-row-btn" onClick={addPhase}>+ Add Phase</button>
          </FormField>
        </FormSection>

        {/* Attributes */}
        <FormSection title="Attributes">
          <div className="form-row">
            <FormField label="Difficulty">
              <select className="form-select" value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)}>
                <option value="">— Select —</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Price Level">
              <select className="form-select" value={form.priceLevel} onChange={(e) => setField('priceLevel', e.target.value)}>
                <option value="">— Select —</option>
                {PRICE_LEVELS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </FormField>
          </div>
          <div className="form-row">
            <FormField label="Time Required">
              <select className="form-select" value={form.timeRequirement} onChange={(e) => setField('timeRequirement', e.target.value)}>
                <option value="">— Select —</option>
                {TIME_REQUIREMENTS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Multi-Tasking">
              <select className="form-select" value={form.multiTasking} onChange={(e) => setField('multiTasking', e.target.value)}>
                <option value="">— Select —</option>
                {MULTI_TASK_OPTIONS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Meal Prep Ideal">
            <div className="form-radio-group">
              {['yes', 'no'].map((val) => (
                <label key={val} className={`form-radio ${form.mealprepIdeal === val ? 'form-radio--selected' : ''}`}>
                  <input
                    type="radio"
                    name="mealprepIdeal"
                    value={val}
                    checked={form.mealprepIdeal === val}
                    onChange={() => setField('mealprepIdeal', val)}
                  />
                  {val === 'yes' ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="Shortcut Version Replaces (optional)">
            <input
              className="form-input"
              type="text"
              value={form.shortcutReplaces}
              onChange={(e) => setField('shortcutReplaces', e.target.value)}
              placeholder="e.g. homemade sauce → jarred sauce"
            />
          </FormField>
        </FormSection>

        {/* Ingredients */}
        <FormSection title="Ingredients">
          {metricUnits && (
            <p className="form-metric-notice">
              Metric mode is active. Quantities are shown in metric units and will be stored as customary when saved.
            </p>
          )}
          {form.ingredients.length === 0 && (
            <p className="form-empty-note">No ingredients yet.</p>
          )}
          {form.ingredients.map((ing, i) => (
            <div key={i} className="ingredient-row">
              <div className="ingredient-row__main">
                <input
                  className="form-input ingredient-row__id"
                  list="ingredient-names"
                  placeholder="Ingredient name (type or pick)"
                  value={ing.ingredientName ?? ''}
                  onChange={(e) => updateIngredientField(i, 'ingredientName', e.target.value)}
                />
                <input
                  className="form-input ingredient-row__qty"
                  type="text"
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={(e) => updateIngredientField(i, 'quantity', e.target.value)}
                />
                <input
                  className="form-input ingredient-row__unit"
                  list="unit-options"
                  placeholder="unit"
                  value={ing.unit}
                  onChange={(e) => updateIngredientField(i, 'unit', e.target.value)}
                />
                <button
                  className="form-remove-btn"
                  onClick={() => removeIngredientRow(i)}
                  title="Remove"
                >✕</button>
              </div>
              <div className="ingredient-row__subs">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Shortcut substitute (ingredient name, 'omit', or 'none')"
                  value={ing.shortcutSubstitute}
                  onChange={(e) => updateIngredientField(i, 'shortcutSubstitute', e.target.value)}
                />
                <input
                  className="form-input"
                  type="text"
                  placeholder={`${subFieldLabel} (comma-separate multiple; optional)`}
                  value={ing.substitute}
                  onChange={(e) => updateIngredientField(i, 'substitute', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button className="form-add-row-btn" onClick={addIngredient}>+ Add Ingredient</button>
        </FormSection>

        {/* Steps */}
        <FormSection title="Steps">
          {form.steps.length === 0 && (
            <p className="form-empty-note">No steps yet.</p>
          )}
          {form.steps.map((step, i) => (
            <div key={i} className="step-row">
              <div className="step-row__header">
                <span className="step-row__number">{i + 1}</span>
                <input
                  className="form-input step-row__name"
                  type="text"
                  placeholder="Step name (e.g. Boil pasta)"
                  value={step.name}
                  onChange={(e) => updateStep(i, 'name', e.target.value)}
                />
                <div className="step-row__controls">
                  <button className="priority-btn" onClick={() => moveStep(i, -1)} disabled={i === 0}>▲</button>
                  <button className="priority-btn" onClick={() => moveStep(i, 1)} disabled={i === form.steps.length - 1}>▼</button>
                  <button className="form-remove-btn" onClick={() => removeStep(i)}>✕</button>
                </div>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Full step instructions"
                value={step.text}
                onChange={(e) => updateStep(i, 'text', e.target.value)}
                rows={3}
              />
              <textarea
                className="form-textarea form-textarea--shortcut"
                placeholder="Shortcut version (leave blank for 'no-shortcut')"
                value={step.shortcutText === 'no-shortcut' ? '' : step.shortcutText}
                onChange={(e) => updateStep(i, 'shortcutText', e.target.value.trim() || 'no-shortcut')}
                rows={2}
              />
            </div>
          ))}
          <button className="form-add-row-btn" onClick={addStep}>+ Add Step</button>
        </FormSection>

        {/* Recommended Sides */}
        <FormSection title="Recommended Sides">
          {form.recommendedSides.map((sideId, i) => (
            <div key={i} className="side-row">
              <input
                className="form-input"
                list="recipe-ids"
                placeholder="Recipe ID"
                value={sideId}
                onChange={(e) => updateSide(i, e.target.value)}
              />
              <button className="form-remove-btn" onClick={() => removeSide(i)}>✕</button>
            </div>
          ))}
          <button className="form-add-row-btn" onClick={addSide}>+ Add Side</button>
        </FormSection>

        {/* Footer actions */}
        <div className="form-footer">
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>Cancel</button>
          {isEdit && (
            <button className="btn btn--danger" onClick={handleDelete}>Delete Recipe</button>
          )}
          <button className="btn btn--primary" onClick={handleSave}>Save Recipe</button>
        </div>

      </div>
    </div>
  )
}
