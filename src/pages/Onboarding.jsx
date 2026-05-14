import React, { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../db/preferencesDB'
import { getHouseholdGoods, saveHouseholdGoods } from '../db/householdGoodsDB'
import { getIngredients, saveIngredients } from '../db/ingredientsDB'
import {
  HOUSEHOLD_SIZES,
  PRIORITIES,
  DEFAULT_PRIORITIES_RANKED,
  SHOP_SCHEDULES,
  getRecommendations,
} from '../db/data/userPreferenceModes.js'
import { DIETARY_MODE_LABELS } from '../utils/dietaryUtils'
import {
  STARTER_HOUSEHOLD_GOODS,
  STARTER_PANTRY_INGREDIENTS,
} from '../db/data/onboardingStarters.js'

const TOTAL_PAGES = 7

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Returns "YYYY-MM-DD" for the next occurrence of dayOfWeek from today
function nextOccurrenceISO(dayOfWeek) {
  if (dayOfWeek === null || dayOfWeek === undefined) return null
  const today = new Date()
  const daysUntil = (dayOfWeek - today.getDay() + 7) % 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntil)
  return next.toISOString().split('T')[0]
}

const DIETARY_MODES = Object.entries(DIETARY_MODE_LABELS).map(([id, label]) => ({ id, label }))

// ─── Page 1: Name & Household Size ───────────────────────────────────────────

function PageOne({ data, onChange }) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Welcome — let's get started</h2>
      <p className="onboarding-step__subtitle">
        This takes about a minute. You can change everything later in Settings.
      </p>

      <div className="onboarding-field">
        <label className="onboarding-label" htmlFor="name">Your name (optional)</label>
        <input
          id="name"
          className="onboarding-input"
          type="text"
          placeholder="e.g. Shayla"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>

      <div className="onboarding-field">
        <label className="onboarding-label">
          How many people will each meal feed?
        </label>
        <div className="option-cards option-cards--2col">
          {HOUSEHOLD_SIZES.map((size) => (
            <button
              key={size.id}
              className={`option-card ${data.householdSize === size.id ? 'option-card--selected' : ''}`}
              onClick={() => onChange('householdSize', size.id)}
            >
              <span className="option-card__label">{size.label}</span>
              <span className="option-card__desc">{size.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page 2: Priority Ranking ─────────────────────────────────────────────────

function PageTwo({ data, onChange }) {
  function move(index, direction) {
    const ranked = [...data.prioritiesRanked]
    const target = index + direction
    if (target < 0 || target >= ranked.length) return
    ;[ranked[index], ranked[target]] = [ranked[target], ranked[index]]
    onChange('prioritiesRanked', ranked)
  }

  const priorityMap = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]))

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">What matters most to you?</h2>
      <p className="onboarding-step__subtitle">
        Drag or use the arrows to rank these from most important (top) to least (bottom).
        This shapes how recipes are sorted and filtered for you.
      </p>

      <ol className="priority-list">
        {data.prioritiesRanked.map((id, index) => {
          const priority = priorityMap[id]
          return (
            <li key={id} className="priority-item">
              <span className="priority-item__rank">{index + 1}</span>
              <div className="priority-item__text">
                <span className="priority-item__label">{priority.label}</span>
                <span className="priority-item__desc">{priority.desc}</span>
              </div>
              <div className="priority-item__controls">
                <button
                  className="priority-btn"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  className="priority-btn"
                  onClick={() => move(index, 1)}
                  disabled={index === data.prioritiesRanked.length - 1}
                  title="Move down"
                >
                  ▼
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Page 3: Mode Settings ────────────────────────────────────────────────────

function PageThree({ data, onChange }) {
  const recs = getRecommendations(data.prioritiesRanked, data)

  const shortcutIsOn = data.shortcutMode.startsWith('on')

  function toggleShortcut() {
    const [, visibility] = data.shortcutMode.split('-')
    onChange('shortcutMode', shortcutIsOn ? `off-${visibility}` : `on-${visibility}`)
  }

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">How do you like to cook?</h2>
      <p className="onboarding-step__subtitle">
        Set your default cooking modes. These can all be changed anytime in Settings.
      </p>

      {/* Plan Mode */}
      <div className="onboarding-field">
        <label className="onboarding-label">Cooking schedule</label>
        <div className="option-cards option-cards--col">
          {[
            { id: 'planned',   label: 'Planned',   desc: 'I plan meals and schedule cooking most days each week' },
            { id: 'unplanned', label: 'Unplanned', desc: 'I pick recipes weekly but decide spontaneously when to cook' },
            { id: 'mealprep',  label: 'Meal Prep', desc: 'I cook larger quantities fewer times per week' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={[
                'option-card option-card--row',
                data.planMode === opt.id ? 'option-card--selected' : '',
                opt.id === 'mealprep' && recs.mealprepRecommended && data.planMode !== 'mealprep'
                  ? 'option-card--recommended'
                  : '',
              ].join(' ')}
              onClick={() => onChange('planMode', opt.id)}
            >
              <span className="option-card__label">{opt.label}</span>
              <span className="option-card__desc">{opt.desc}</span>
              {opt.id === 'mealprep' && recs.mealprepRecommended && (
                <span className="option-card__badge">Recommended for you</span>
              )}
            </button>
          ))}
        </div>
        {data.planMode === 'mealprep' && (
          <p className="onboarding-note">
            Meal prep mode scales recipe quantities up one level from your household size.
          </p>
        )}
      </div>

      {/* Substitution Mode */}
      <div className="onboarding-field">
        <label className="onboarding-label">Substitution flexibility</label>
        <div className="option-cards option-cards--col">
          {[
            { id: 'strict',  label: 'Strict',  desc: 'Most technical — minimal substitutions, closer to the original recipe' },
            { id: 'regular', label: 'Regular', desc: 'Flexible and intuitive — sensible swaps when needed (default)' },
            { id: 'lenient', label: 'Lenient', desc: 'Lowest waste — highest variance in flavor, including omissions' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={[
                'option-card option-card--row',
                data.substitutionMode === opt.id ? 'option-card--selected' : '',
                opt.id === 'lenient' && recs.lenientRecommended && data.substitutionMode !== 'lenient'
                  ? 'option-card--recommended'
                  : '',
                opt.id === 'strict' && recs.strictRecommended && data.substitutionMode !== 'strict'
                  ? 'option-card--recommended'
                  : '',
              ].join(' ')}
              onClick={() => onChange('substitutionMode', opt.id)}
            >
              <span className="option-card__label">{opt.label}</span>
              <span className="option-card__desc">{opt.desc}</span>
              {opt.id === 'lenient' && recs.lenientRecommended && (
                <span className="option-card__badge">Recommended for you</span>
              )}
              {opt.id === 'strict' && recs.strictRecommended && (
                <span className="option-card__badge">Recommended for you</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Mode */}
      <div className="onboarding-field">
        <label className="onboarding-label">Your cooking experience</label>
        <div className="option-cards option-cards--2col">
          {[
            { id: 'beginner',    label: 'Beginner',    desc: 'New to cooking — prefer extra guidance' },
            { id: 'experienced', label: 'Experienced', desc: 'Comfortable following standard recipes' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={`option-card ${data.experienceMode === opt.id ? 'option-card--selected' : ''}`}
              onClick={() => onChange('experienceMode', opt.id)}
            >
              <span className="option-card__label">{opt.label}</span>
              <span className="option-card__desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metric Units */}
      <div className="onboarding-field">
        <div className="onboarding-toggle-row">
          <div>
            <span className="onboarding-label">Metric Units</span>
            <p className="onboarding-hint">
              Display ingredient amounts in metric (mL, g, kg) instead of cups, oz, and lbs.
            </p>
          </div>
          <button
            className={`toggle ${data.metricUnits ? 'toggle--on' : 'toggle--off'}`}
            onClick={() => onChange('metricUnits', !data.metricUnits)}
            role="switch"
            aria-checked={data.metricUnits}
          >
            <span className="toggle__knob" />
          </button>
        </div>
      </div>

      {/* Shortcut Mode */}
      <div className="onboarding-field">
        <div className="onboarding-toggle-row">
          <div>
            <span className={[
              'onboarding-label',
              recs.shortcutWarn ? 'onboarding-label--warn' : '',
              recs.shortcutRecommended && !shortcutIsOn ? 'onboarding-label--recommend' : '',
            ].join(' ')}>
              Shortcut Mode
              {recs.shortcutRecommended && !shortcutIsOn && (
                <span className="onboarding-badge onboarding-badge--recommend"> Recommended</span>
              )}
              {recs.shortcutWarn && (
                <span className="onboarding-badge onboarding-badge--warn"> ⚠ Conflicts with Cost priority</span>
              )}
            </span>
            <p className="onboarding-hint">
              Replaces certain steps and ingredients with faster, simpler alternatives.
            </p>
          </div>
          <button
            className={`toggle ${shortcutIsOn ? 'toggle--on' : 'toggle--off'} ${recs.shortcutWarn ? 'toggle--warn' : ''}`}
            onClick={toggleShortcut}
            role="switch"
            aria-checked={shortcutIsOn}
          >
            <span className="toggle__knob" />
          </button>
        </div>
      </div>

    </div>
  )
}

// ─── Page 4: Dietary Restrictions & Allergies ────────────────────────────────

function PageFour({ data, onChange }) {
  const [allergyInput, setAllergyInput] = useState('')

  function setMode(modeId) {
    onChange('dietaryMode', data.dietaryMode === modeId ? null : modeId)
  }

  function addAllergy() {
    const val = allergyInput.trim()
    if (!val) return
    const already = (data.allergyIngredients ?? []).some(
      (a) => a.toLowerCase() === val.toLowerCase()
    )
    if (!already) {
      onChange('allergyIngredients', [...(data.allergyIngredients ?? []), val])
    }
    setAllergyInput('')
  }

  function removeAllergy(idx) {
    onChange('allergyIngredients', (data.allergyIngredients ?? []).filter((_, i) => i !== idx))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addAllergy() }
  }

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">Any dietary needs?</h2>
      <p className="onboarding-step__subtitle">
        This is optional — you can update it anytime in Settings. Ingredient substitutions
        will be shown automatically when you view recipes.
      </p>

      {/* Dietary Mode */}
      <div className="onboarding-field">
        <label className="onboarding-label">Dietary restriction</label>
        <div className="option-cards option-cards--col">
          <button
            className={`option-card option-card--row ${!data.dietaryMode ? 'option-card--selected' : ''}`}
            onClick={() => onChange('dietaryMode', null)}
          >
            <span className="option-card__label">None</span>
            <span className="option-card__desc">No dietary restriction</span>
          </button>
          {DIETARY_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`option-card option-card--row ${data.dietaryMode === mode.id ? 'option-card--selected' : ''}`}
              onClick={() => setMode(mode.id)}
            >
              <span className="option-card__label">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="onboarding-field">
        <label className="onboarding-label">Ingredient allergies</label>
        <p className="onboarding-hint">
          Recipes with non-omittable allergens will be hidden. Press Enter or Add after each one.
        </p>

        {(data.allergyIngredients ?? []).length > 0 && (
          <div className="allergy-tags onboarding-allergy-tags">
            {(data.allergyIngredients ?? []).map((item, i) => (
              <span key={i} className="allergy-tag">
                {item}
                <button
                  className="allergy-tag__remove"
                  onClick={() => removeAllergy(i)}
                  title={`Remove ${item}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="allergy-input-row">
          <input
            className="onboarding-input"
            type="text"
            placeholder="e.g. peanuts, shellfish…"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn--primary"
            onClick={addAllergy}
            disabled={!allergyInput.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page 5: Shopping Preferences ────────────────────────────────────────────

function PageFive({ data, onChange }) {
  const isTwiceWeekly = data.shopSchedule === 'twice-weekly'

  function setSchedule(id) {
    onChange('shopSchedule', id)
    if (id !== 'twice-weekly') onChange('shopDay2', null)
    // Anchor biweekly cycle when first enabling biweekly
    if (id === 'biweekly' && data.shopSchedule !== 'biweekly') {
      onChange('shopCycleRef', nextOccurrenceISO(data.shopDay))
    }
  }

  function setShopDay(val) {
    onChange('shopDay', val)
    if (data.shopSchedule === 'biweekly') {
      onChange('shopCycleRef', nextOccurrenceISO(val))
    }
  }

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">How do you like to shop?</h2>
      <p className="onboarding-step__subtitle">
        Set up your shopping schedule. You can update this anytime in Settings.
      </p>

      {/* Shopping frequency */}
      <div className="onboarding-field">
        <label className="onboarding-label">How often do you shop?</label>
        <div className="option-cards option-cards--col">
          {SHOP_SCHEDULES.map((opt) => (
            <button
              key={opt.id}
              className={`option-card option-card--row ${data.shopSchedule === opt.id ? 'option-card--selected' : ''}`}
              onClick={() => setSchedule(opt.id)}
            >
              <span className="option-card__label">{opt.label}</span>
              <span className="option-card__desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary shop day */}
      <div className="onboarding-field">
        <label className="onboarding-label">
          {isTwiceWeekly ? 'First shop day' : 'Which day do you usually shop?'}
        </label>
        <div className="onboarding-day-picker">
          {DAYS.map((day, idx) => (
            <button
              key={idx}
              className={`shop-day-btn ${data.shopDay === idx ? 'shop-day-btn--selected' : ''} ${data.shopDay2 === idx ? 'shop-day-btn--disabled' : ''}`}
              onClick={() => data.shopDay2 !== idx && setShopDay(data.shopDay === idx ? null : idx)}
              disabled={data.shopDay2 === idx}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Second shop day (twice-weekly only) */}
      {isTwiceWeekly && (
        <div className="onboarding-field">
          <label className="onboarding-label">Second shop day</label>
          <div className="onboarding-day-picker">
            {DAYS.map((day, idx) => (
              <button
                key={idx}
                className={`shop-day-btn ${data.shopDay2 === idx ? 'shop-day-btn--selected' : ''} ${data.shopDay === idx ? 'shop-day-btn--disabled' : ''}`}
                onClick={() => data.shopDay !== idx && onChange('shopDay2', data.shopDay2 === idx ? null : idx)}
                disabled={data.shopDay === idx}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wholesale */}
      <div className="onboarding-field">
        <div className="onboarding-toggle-row">
          <div>
            <span className="onboarding-label">Wholesale Shopping</span>
            <p className="onboarding-hint">
              Adds a separate wholesale section to your shopping list for bulk household items.
            </p>
          </div>
          <button
            className={`toggle ${data.wholesale ? 'toggle--on' : 'toggle--off'}`}
            onClick={() => onChange('wholesale', !data.wholesale)}
            role="switch"
            aria-checked={data.wholesale}
          >
            <span className="toggle__knob" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared Checklist Component ──────────────────────────────────────────────

const MAX_CHECKLIST_SUGGESTIONS = 6

function OnboardingChecklist({ items, selectedIds, onChange, customNames, onCustomChange, customPlaceholder, suggestionPool = [] }) {
  const [input, setInput]             = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const allSelected = items.every((item) => selectedIds.includes(item.id))

  function toggleItem(id) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onChange(next)
  }

  function toggleAll() {
    onChange(allSelected ? [] : items.map((i) => i.id))
  }

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q || !suggestionPool.length) return []
    const alreadyCustom = new Set(customNames.map((n) => n.toLowerCase()))
    return suggestionPool
      .filter((item) =>
        item.name.toLowerCase().includes(q) &&
        !alreadyCustom.has(item.name.toLowerCase())
      )
      .slice(0, MAX_CHECKLIST_SUGGESTIONS)
  }, [input, suggestionPool, customNames])

  function commitValue(val) {
    const trimmed = val.trim()
    if (!trimmed) return
    const already = customNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())
    if (!already) onCustomChange([...customNames, trimmed])
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeCustom(name) {
    onCustomChange(customNames.filter((n) => n !== name))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); commitValue(input) }
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  return (
    <div>
      <div className="onboarding-checklist__toggle-row">
        <span className="onboarding-hint">{selectedIds.length} of {items.length} selected</span>
        <button className="onboarding-checklist__toggle-btn" onClick={toggleAll}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="onboarding-checklist">
        {items.map((item) => {
          const checked = selectedIds.includes(item.id)
          return (
            <button
              key={item.id}
              className={`onboarding-checklist__item ${checked ? 'onboarding-checklist__item--checked' : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              <span className="onboarding-checklist__box">{checked ? '✓' : ''}</span>
              <span className="onboarding-checklist__name">{item.name}</span>
            </button>
          )
        })}
      </div>

      {customNames.length > 0 && (
        <div className="onboarding-custom-tags">
          {customNames.map((name) => (
            <span key={name} className="onboarding-custom-tag">
              {name}
              <button
                className="onboarding-custom-tag__remove"
                onClick={() => removeCustom(name)}
                title={`Remove ${name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="onboarding-custom-row" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            className="onboarding-input"
            type="text"
            placeholder={customPlaceholder}
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="onboarding-suggestions" role="listbox">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  className="onboarding-suggestion"
                  role="option"
                  onMouseDown={() => commitValue(item.name)}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="btn btn--primary"
          onClick={() => commitValue(input)}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Page 6: Household Inventory ──────────────────────────────────────────────

const STARTER_GOOD_IDS = new Set(STARTER_HOUSEHOLD_GOODS.map((g) => g.id))

function PageSix({ data, onChange }) {
  const suggestionPool = useMemo(() => {
    return getHouseholdGoods().filter((g) => !STARTER_GOOD_IDS.has(g.id))
  }, [])

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">What household items do you keep stocked?</h2>
      <p className="onboarding-step__subtitle">
        Uncheck anything you don't keep on hand. These will form your personal restock list.
        You can add or remove items later in Inventory Settings.
      </p>

      <OnboardingChecklist
        items={STARTER_HOUSEHOLD_GOODS}
        selectedIds={data.selectedHouseholdGoodIds}
        onChange={(ids) => onChange('selectedHouseholdGoodIds', ids)}
        customNames={data.customHouseholdGoodNames}
        onCustomChange={(names) => onChange('customHouseholdGoodNames', names)}
        customPlaceholder="Add an item not listed above…"
        suggestionPool={suggestionPool}
      />
    </div>
  )
}

// ─── Page 7: Common Pantry Ingredients ────────────────────────────────────────

const STARTER_INGREDIENT_IDS = new Set(STARTER_PANTRY_INGREDIENTS.map((i) => i.id))

function PageSeven({ data, onChange }) {
  const suggestionPool = useMemo(() => {
    return getIngredients().filter((i) => !STARTER_INGREDIENT_IDS.has(i.id))
  }, [])

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step__title">What ingredients do you usually have on hand?</h2>
      <p className="onboarding-step__subtitle">
        Checked items won't be added to your grocery list automatically — the app assumes you
        already have them. Uncheck anything you don't regularly keep stocked.
      </p>

      <OnboardingChecklist
        items={STARTER_PANTRY_INGREDIENTS}
        selectedIds={data.pantryIngredientIds}
        onChange={(ids) => onChange('pantryIngredientIds', ids)}
        customNames={data.customPantryIngredientNames}
        onCustomChange={(names) => onChange('customPantryIngredientNames', names)}
        customPlaceholder="Add an ingredient not listed above…"
        suggestionPool={suggestionPool}
      />
    </div>
  )
}

// ─── Onboarding Wizard Shell ──────────────────────────────────────────────────

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    householdSize: 'couple',
    prioritiesRanked: [...DEFAULT_PRIORITIES_RANKED],
    shortcutMode: 'off-visible',
    substitutionMode: 'regular',
    planMode: 'unplanned',
    showLowWaste: false,
    experienceMode: 'experienced',
    metricUnits: false,
    dietaryMode: null,
    allergyIngredients: [],
    shopSchedule: 'weekly',
    shopDay: null,
    shopDay2: null,
    shopCycleRef: null,
    wholesale: false,
    // Page 6 — household inventory
    selectedHouseholdGoodIds: STARTER_HOUSEHOLD_GOODS.map((g) => g.id),
    customHouseholdGoodNames: [],
    // Page 7 — pantry staples
    pantryIngredientIds: STARTER_PANTRY_INGREDIENTS.map((i) => i.id),
    customPantryIngredientNames: [],
  })

  function handleChange(key, value) {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value }

      // Auto-set showLowWaste when low-waste is a top-3 priority
      if (key === 'prioritiesRanked') {
        updated.showLowWaste = value.slice(0, 3).includes('low-waste')
      }

      // Auto-enable glossary beginner mode when the user selects beginner experience
      if (key === 'experienceMode') {
        updated.glossaryBeginnerMode = value === 'beginner'
      }

      return updated
    })
  }

  function handleSkip() {
    completeOnboarding({})
    onComplete()
    navigate('/')
  }

  function handleSave() {
    const allDefaultGoods    = getHouseholdGoods()
    const existingIngredients = getIngredients()

    // ── Household goods ────────────────────────────────────────────────────────
    const selectedGoods = allDefaultGoods.filter((g) =>
      formData.selectedHouseholdGoodIds.includes(g.id)
    )

    // For custom-named goods, look up in ingredients first (food items carry the
    // correct grocery department there), then in goods, then fall back to new.
    const customGoods = formData.customHouseholdGoodNames.map((name, i) => {
      const ingMatch = existingIngredients.find(
        (ing) => ing.name.toLowerCase() === name.toLowerCase()
      )
      if (ingMatch) return { id: ingMatch.id, name: ingMatch.name, department: ingMatch.department }

      const goodMatch = allDefaultGoods.find(
        (g) => g.name.toLowerCase() === name.toLowerCase()
      )
      if (goodMatch) return goodMatch

      return { id: `good-custom-${Date.now()}-${i}`, name, department: 'household' }
    })
    saveHouseholdGoods([...selectedGoods, ...customGoods])

    // ── Pantry ingredients ─────────────────────────────────────────────────────
    // Reuse existing records when the name matches — preserves proper department
    // and all substitution data. Only create new records for truly new items.
    const customIngredients = formData.customPantryIngredientNames.map((name, i) => {
      const existing = existingIngredients.find(
        (ing) => ing.name.toLowerCase() === name.toLowerCase()
      )
      if (existing) return existing

      return {
        id: `pantry-custom-${Date.now()}-${i}`,
        name,
        department: 'pantry',
        vegSubstitute: 'n/a', veganSubstitute: 'n/a', glutenSubstitute: 'n/a',
        dairySubstitute: 'n/a', fishSubstitute: 'n/a', allergySubstitute: 'none',
        strictSubstitute: 'none', regularSubstitute: 'none',
        lenientSubstitute: 'none', otherSubstitute: 'none',
      }
    })
    const brandNewIngredients = customIngredients.filter(
      (ci) => !existingIngredients.some((e) => e.id === ci.id)
    )
    if (brandNewIngredients.length > 0) {
      saveIngredients([...existingIngredients, ...brandNewIngredients])
    }

    const allPantryIds = [
      ...formData.pantryIngredientIds,
      ...customIngredients.map((i) => i.id),
    ]
    const allHouseholdIds = [
      ...formData.selectedHouseholdGoodIds,
      ...customGoods.map((g) => g.id),
    ]

    const merged = {
      ...formData,
      householdInventory: allHouseholdIds,
      commonIngredients: allPantryIds,
      checkedAvailableIngredients: [
        ...new Set([...(formData.checkedAvailableIngredients ?? []), ...allPantryIds]),
      ],
    }
    completeOnboarding(merged)
    onComplete()
    navigate('/')
  }

  return (
    <div className="page onboarding-page">
      <div className="onboarding-wizard">

        {/* Header */}
        <div className="onboarding-wizard__header">
          <div className="onboarding-progress">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <div
                key={i}
                className={`onboarding-progress__dot ${i + 1 <= page ? 'onboarding-progress__dot--active' : ''}`}
              />
            ))}
          </div>
          <span className="onboarding-wizard__step-label">Step {page} of {TOTAL_PAGES}</span>
        </div>

        {/* Page content */}
        <div className="onboarding-wizard__body">
          {page === 1 && <PageOne   data={formData} onChange={handleChange} />}
          {page === 2 && <PageTwo   data={formData} onChange={handleChange} />}
          {page === 3 && <PageThree data={formData} onChange={handleChange} />}
          {page === 4 && <PageFour  data={formData} onChange={handleChange} />}
          {page === 5 && <PageFive  data={formData} onChange={handleChange} />}
          {page === 6 && <PageSix   data={formData} onChange={handleChange} />}
          {page === 7 && <PageSeven data={formData} onChange={handleChange} />}
        </div>

        {/* Footer navigation */}
        <div className="onboarding-wizard__footer">
          <button className="btn btn--ghost" onClick={handleSkip}>
            Skip setup
          </button>

          <div className="onboarding-wizard__footer-nav">
            {page > 1 && (
              <button className="btn btn--ghost" onClick={() => setPage((p) => p - 1)}>
                ← Back
              </button>
            )}
            {page < TOTAL_PAGES ? (
              <button className="btn btn--primary" onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn btn--primary" onClick={handleSave}>
                Save & Start
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
