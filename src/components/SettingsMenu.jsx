import React, { useState, useMemo } from 'react'
import {
  HOUSEHOLD_SIZES,
  PRIORITIES,
  SHOP_SCHEDULES,
  getRecommendations,
} from '../db/data/userPreferenceModes.js'
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '../notifications/notificationService'
import { DIETARY_MODE_LABELS } from '../utils/dietaryUtils'
import { GLOSSARY } from '../db/data/glossary'

// ─── Sub-view: Household Size ─────────────────────────────────────────────────

function HouseholdSizeView({ preferences, onUpdate }) {
  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        Sets how many people each meal will feed, which scales recipe quantities.
      </p>
      <div className="settings-option-cards">
        {HOUSEHOLD_SIZES.map((size) => (
          <button
            key={size.id}
            className={`settings-option-card ${preferences.householdSize === size.id ? 'settings-option-card--selected' : ''}`}
            onClick={() => onUpdate({ householdSize: size.id })}
          >
            <span className="settings-option-card__label">{size.label}</span>
            <span className="settings-option-card__desc">{size.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sub-view: Cooking Priority ───────────────────────────────────────────────

function CookingPriorityView({ preferences, onUpdate }) {
  const ranked = preferences.prioritiesRanked ?? PRIORITIES.map((p) => p.id)
  const priorityMap = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]))

  function move(index, direction) {
    const list = [...ranked]
    const target = index + direction
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    onUpdate({ prioritiesRanked: list })
  }

  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        Drag or use arrows to rank from most (top) to least (bottom) important.
      </p>
      <ol className="priority-list priority-list--compact">
        {ranked.map((id, index) => {
          const p = priorityMap[id]
          return (
            <li key={id} className="priority-item priority-item--compact">
              <span className="priority-item__rank">{index + 1}</span>
              <div className="priority-item__text">
                <span className="priority-item__label">{p.label}</span>
                <span className="priority-item__desc">{p.desc}</span>
              </div>
              <div className="priority-item__controls">
                <button className="priority-btn" onClick={() => move(index, -1)} disabled={index === 0}>▲</button>
                <button className="priority-btn" onClick={() => move(index, 1)} disabled={index === ranked.length - 1}>▼</button>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Sub-view: Planned Cooking ────────────────────────────────────────────────

function PlanModeView({ preferences, onUpdate }) {
  const recs = getRecommendations(preferences.prioritiesRanked ?? [])
  const options = [
    { id: 'planned',   label: 'Planned',   desc: 'Plan meals and schedule cooking most days each week' },
    { id: 'unplanned', label: 'Unplanned', desc: 'Pick recipes weekly, decide spontaneously when to cook' },
    { id: 'mealprep',  label: 'Meal Prep', desc: 'Cook larger quantities fewer times per week' },
  ]
  return (
    <div className="settings-subview__body">
      <div className="settings-option-cards">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={[
              'settings-option-card settings-option-card--row',
              preferences.planMode === opt.id ? 'settings-option-card--selected' : '',
              opt.id === 'mealprep' && recs.mealprepRecommended && preferences.planMode !== 'mealprep'
                ? 'settings-option-card--recommended'
                : '',
            ].join(' ')}
            onClick={() => onUpdate({ planMode: opt.id })}
          >
            <span className="settings-option-card__label">{opt.label}</span>
            <span className="settings-option-card__desc">{opt.desc}</span>
            {opt.id === 'mealprep' && recs.mealprepRecommended && preferences.planMode !== 'mealprep' && (
              <span className="settings-option-card__badge">Recommended</span>
            )}
          </button>
        ))}
      </div>
      {preferences.planMode === 'mealprep' && (
        <p className="settings-subview__note">
          Meal prep scales recipe quantities up one level from your household size.
        </p>
      )}
    </div>
  )
}

// ─── Sub-view: Shopping Schedule ─────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Returns the ISO date string (YYYY-MM-DD) for the next occurrence of dayOfWeek
// from today (today itself counts if dayOfWeek === today)
function nextOccurrenceISO(dayOfWeek) {
  if (dayOfWeek === null || dayOfWeek === undefined) return null
  const today = new Date()
  const daysUntil = (dayOfWeek - today.getDay() + 7) % 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntil)
  return next.toISOString().split('T')[0]
}

function DayPicker({ label, value, onChange, exclude }) {
  return (
    <div className="shop-day-picker">
      <span className="shop-day-picker__label">{label}</span>
      <div className="shop-day-picker__days">
        {DAYS.map((day, idx) => (
          <button
            key={idx}
            className={[
              'shop-day-btn',
              value === idx ? 'shop-day-btn--selected' : '',
              exclude === idx ? 'shop-day-btn--disabled' : '',
            ].join(' ')}
            onClick={() => exclude !== idx && onChange(value === idx ? null : idx)}
            disabled={exclude === idx}
            title={exclude === idx ? 'Already selected as the other shop day' : day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}

function ShopScheduleView({ preferences, onUpdate }) {
  const isTwiceWeekly = preferences.shopSchedule === 'twice-weekly'

  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        How often do you plan to grocery shop?
      </p>
      <div className="settings-option-cards">
        {SHOP_SCHEDULES.map((opt) => (
          <button
            key={opt.id}
            className={`settings-option-card settings-option-card--row ${preferences.shopSchedule === opt.id ? 'settings-option-card--selected' : ''}`}
            onClick={() => {
              const switchingToBiweekly = opt.id === 'biweekly' && preferences.shopSchedule !== 'biweekly'
              onUpdate({
                shopSchedule: opt.id,
                ...(opt.id !== 'twice-weekly' ? { shopDay2: null } : {}),
                // Anchor the biweekly cycle to the next upcoming shopDay when first enabling
                ...(switchingToBiweekly ? { shopCycleRef: nextOccurrenceISO(preferences.shopDay) } : {}),
              })
            }}
          >
            <span className="settings-option-card__label">{opt.label}</span>
            <span className="settings-option-card__desc">{opt.desc}</span>
          </button>
        ))}
      </div>

      <div className="shop-day-section">
        <DayPicker
          label={isTwiceWeekly ? 'First shop day' : 'Shop day'}
          value={preferences.shopDay ?? null}
          onChange={(val) => onUpdate({
            shopDay: val,
            // Re-anchor biweekly cycle when the primary shop day changes
            ...(preferences.shopSchedule === 'biweekly' ? { shopCycleRef: nextOccurrenceISO(val) } : {}),
          })}
          exclude={isTwiceWeekly ? (preferences.shopDay2 ?? null) : null}
        />
        {isTwiceWeekly && (
          <DayPicker
            label="Second shop day"
            value={preferences.shopDay2 ?? null}
            onChange={(val) => onUpdate({ shopDay2: val })}
            exclude={preferences.shopDay ?? null}
          />
        )}
      </div>
    </div>
  )
}

// ─── Sub-view: Edit Substitution Mode ────────────────────────────────────────

function EditSubstitutionView({ preferences, onUpdate }) {
  const options = [
    { id: 'strict',  label: 'Strict',  desc: 'Most technical — minimal substitutions, closest to the original recipe' },
    { id: 'regular', label: 'Regular', desc: 'Flexible and intuitive — sensible swaps when needed (default)' },
    { id: 'lenient', label: 'Lenient', desc: 'Lowest waste — highest variance in flavor, including omissions' },
  ]
  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        Controls how many substitution options are shown on recipe pages when "Show Substitutions" is on.
      </p>
      <div className="settings-option-cards">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={`settings-option-card settings-option-card--row ${preferences.substitutionMode === opt.id ? 'settings-option-card--selected' : ''}`}
            onClick={() => onUpdate({ substitutionMode: opt.id })}
          >
            <span className="settings-option-card__label">{opt.label}</span>
            <span className="settings-option-card__desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sub-view: Edit Shortcut Mode ─────────────────────────────────────────────

function EditShortcutView({ preferences, onUpdate }) {
  const [onOff, visibility] = (preferences.shortcutMode ?? 'off-visible').split('-')
  const isOn = onOff === 'on'

  function setActive(active) {
    onUpdate({ shortcutMode: `${active ? 'on' : 'off'}-${visibility}` })
  }

  const options = [
    { id: 'on',  label: 'On by default',  desc: 'Shortcut mode is active whenever you open a recipe' },
    { id: 'off', label: 'Off by default', desc: 'Shortcut mode is inactive; toggle it per-recipe if needed' },
  ]
  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        Sets whether shortcut mode is on or off by default when viewing recipes.
        The "Show Shortcut Mode" toggle controls whether the option is visible on recipe pages at all.
      </p>
      <div className="settings-option-cards">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={`settings-option-card settings-option-card--row ${isOn === (opt.id === 'on') ? 'settings-option-card--selected' : ''}`}
            onClick={() => setActive(opt.id === 'on')}
          >
            <span className="settings-option-card__label">{opt.label}</span>
            <span className="settings-option-card__desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sub-view: Dietary Restrictions ──────────────────────────────────────────

const DIETARY_MODES = Object.entries(DIETARY_MODE_LABELS).map(([id, label]) => ({ id, label }))

function DietaryView({ preferences, onUpdate }) {
  const activeModes = preferences.dietaryModes ?? []
  const allergyList = preferences.allergyIngredients ?? []

  const [allergyInput, setAllergyInput] = useState('')

  function toggleMode(modeId) {
    const next = activeModes.includes(modeId)
      ? activeModes.filter((m) => m !== modeId)
      : [...activeModes, modeId]
    onUpdate({ dietaryModes: next })
  }

  function addAllergy() {
    const val = allergyInput.trim()
    if (!val) return
    // Avoid duplicates (case-insensitive)
    const already = allergyList.some((a) => a.toLowerCase() === val.toLowerCase())
    if (!already) {
      onUpdate({ allergyIngredients: [...allergyList, val] })
    }
    setAllergyInput('')
  }

  function removeAllergy(idx) {
    onUpdate({ allergyIngredients: allergyList.filter((_, i) => i !== idx) })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addAllergy() }
  }

  return (
    <div className="settings-subview__body">

      {/* ── Dietary Modes ── */}
      <p className="settings-subview__desc">
        Select one or more dietary restrictions. Recipes will show the appropriate
        ingredient substitutes, and your grocery list will automatically swap items.
      </p>

      <div className="settings-option-cards">
        {DIETARY_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`settings-option-card settings-option-card--row ${activeModes.includes(mode.id) ? 'settings-option-card--selected' : ''}`}
            onClick={() => toggleMode(mode.id)}
          >
            <span className="settings-option-card__label">{mode.label}</span>
            {activeModes.includes(mode.id) && (
              <span className="settings-option-card__check">✓</span>
            )}
          </button>
        ))}
        {activeModes.length > 0 && (
          <button
            className="settings-option-card settings-option-card--row settings-option-card--clear"
            onClick={() => onUpdate({ dietaryModes: [] })}
          >
            <span className="settings-option-card__label">Clear all</span>
          </button>
        )}
      </div>

      {/* ── Allergy List ── */}
      <div className="dietary-allergy-section">
        <h3 className="dietary-allergy-section__title">Ingredient Allergies</h3>
        <p className="settings-subview__desc">
          Enter specific ingredient allergies. Recipes containing non-omittable
          allergens will be hidden from recipe lists. Omittable allergens are
          automatically excluded when viewing a recipe.
        </p>

        {/* Tag list */}
        {allergyList.length > 0 && (
          <div className="allergy-tags">
            {allergyList.map((item, i) => (
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

        {/* Input */}
        <div className="allergy-input-row">
          <input
            className="form-input"
            type="text"
            placeholder="e.g. mushrooms, peanuts…"
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

// ─── Settings Row Helpers ─────────────────────────────────────────────────────

function ToggleRow({ label, checked, onToggle }) {
  return (
    <div className="settings-row">
      <span className="settings-row__label">{label}</span>
      <button
        className={`toggle ${checked ? 'toggle--on' : 'toggle--off'}`}
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
      >
        <span className="toggle__knob" />
      </button>
    </div>
  )
}

function ToggleEditRow({ label, checked, onToggle, onEdit }) {
  return (
    <div className="settings-row">
      <span className="settings-row__label">{label}</span>
      <div className="settings-row__controls">
        <button className="settings-edit-btn" onClick={onEdit}>Edit</button>
        <button
          className={`toggle ${checked ? 'toggle--on' : 'toggle--off'}`}
          onClick={onToggle}
          role="switch"
          aria-checked={checked}
        >
          <span className="toggle__knob" />
        </button>
      </div>
    </div>
  )
}

function ActionRow({ label, danger, onClick }) {
  return (
    <div className="settings-row">
      <span className={`settings-row__label${danger ? ' settings-row__label--danger' : ''}`}>{label}</span>
      <button
        className={`settings-action-btn${danger ? ' settings-action-btn--danger' : ''}`}
        onClick={onClick}
      >
        {danger ? 'Reset' : 'Edit →'}
      </button>
    </div>
  )
}

function DrillRow({ label, onClick }) {
  return (
    <div className="settings-row settings-row--drill" onClick={onClick}>
      <span className="settings-row__label">{label}</span>
      <span className="settings-row__chevron">›</span>
    </div>
  )
}

// ─── Sub-view: Revert Data ────────────────────────────────────────────────────

const REVERT_OPTIONS = [
  {
    id:    'revertRecipes',
    label: 'Revert Recipes',
    desc:  'Reset all recipes back to the original default list. Any recipes you added or edited will be lost.',
  },
  {
    id:    'revertInventory',
    label: 'Revert Household Inventory',
    desc:  'Reset household goods back to the original default list. Any items you added or edited will be lost.',
  },
  {
    id:    'revertPreferences',
    label: 'Revert Preferences',
    desc:  'Reset all app settings back to defaults. Your meal plan data and saved preferences will be cleared.',
  },
  {
    id:    'revertAll',
    label: 'Revert Everything',
    desc:  'Reset all recipes, household inventory, and preferences to defaults. All customizations will be lost.',
    strong: true,
  },
]

function RevertDataView({ onUpdate }) {
  const [confirming, setConfirming] = useState(null)

  function handleConfirm(id) {
    onUpdate({ _action: id })
    setConfirming(null)
  }

  return (
    <div className="settings-subview__body">
      <p className="settings-subview__desc">
        Resetting data cannot be undone. Choose what you'd like to reset to defaults.
      </p>
      <div className="revert-options">
        {REVERT_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`revert-option${opt.strong ? ' revert-option--strong' : ''}`}
          >
            <div className="revert-option__text">
              <span className="revert-option__label">{opt.label}</span>
              <span className="revert-option__desc">{opt.desc}</span>
            </div>
            {confirming === opt.id ? (
              <div className="revert-option__confirm">
                <span className="revert-option__confirm-text">Are you sure?</span>
                <button
                  className="settings-action-btn settings-action-btn--danger"
                  onClick={() => handleConfirm(opt.id)}
                >
                  Confirm
                </button>
                <button
                  className="settings-action-btn"
                  onClick={() => setConfirming(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="settings-action-btn settings-action-btn--danger"
                onClick={() => setConfirming(opt.id)}
              >
                Reset
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sub-view: Glossary ───────────────────────────────────────────────────────

function GlossaryView() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return GLOSSARY
    return GLOSSARY.filter(
      (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    )
  }, [search])

  // Group alphabetically
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((entry) => {
      const letter = entry.term[0].toUpperCase()
      if (!map[letter]) map[letter] = []
      map[letter].push(entry)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="settings-subview__body glossary-view">
      <p className="settings-subview__desc">
        Definitions for common cooking and baking techniques. Enable Beginner Mode to see
        highlighted terms while cooking.
      </p>
      <input
        className="glossary-search"
        type="text"
        placeholder="Search terms…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {grouped.length === 0 && (
        <p className="glossary-empty">No matching terms found.</p>
      )}
      {grouped.map(([letter, entries]) => (
        <div key={letter} className="glossary-group">
          <span className="glossary-group__letter">{letter}</span>
          {entries.map((entry) => (
            <div key={entry.term} className="glossary-entry">
              <span className="glossary-entry__term">{entry.term}</span>
              <p className="glossary-entry__def">{entry.definition}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Main SettingsMenu ────────────────────────────────────────────────────────

const VIEW_TITLES = {
  main:            'Settings',
  householdSize:   'Household Size',
  cookingPriority: 'Cooking Priority',
  planMode:        'Planned Cooking',
  shopSchedule:    'Shopping Schedule',
  editSubstitution:'Substitution Mode',
  editShortcut:    'Shortcut Mode',
  dietary:         'Diet & Allergies',
  revertData:      'Reset to Defaults',
  glossary:        'Cooking Glossary',
}

export default function SettingsMenu({ isOpen, onClose, preferences, onUpdate }) {
  const [view, setView] = useState('main')
  const [notifBlocked, setNotifBlocked] = useState(false)

  if (!isOpen) return null

  const isShortcutVisible = (preferences.shortcutMode ?? 'off-visible').endsWith('visible')

  function handleClose() {
    setView('main')
    setNotifBlocked(false)
    onClose()
  }

  function toggleShortcutVisibility() {
    const [onOff] = (preferences.shortcutMode ?? 'off-visible').split('-')
    onUpdate({ shortcutMode: `${onOff}-${isShortcutVisible ? 'hidden' : 'visible'}` })
  }

  async function handleNotificationsToggle() {
    if (preferences.notifications) {
      onUpdate({ notifications: false })
      setNotifBlocked(false)
      return
    }
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      onUpdate({ notifications: true })
      setNotifBlocked(false)
    } else if (permission === 'denied') {
      setNotifBlocked(true)
    } else if (permission === 'unsupported') {
      setNotifBlocked(true)
    }
    // 'default' = user dismissed the prompt without choosing; do nothing
  }

  const isSubView = view !== 'main'

  return (
    <div className="settings-overlay" onClick={handleClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-panel__header">
          {isSubView ? (
            <button className="settings-back-btn" onClick={() => setView('main')}>← Back</button>
          ) : (
            <h2>{VIEW_TITLES[view]}</h2>
          )}
          {isSubView && <h2 className="settings-panel__subview-title">{VIEW_TITLES[view]}</h2>}
          <button className="settings-panel__close" onClick={handleClose}>✕</button>
        </div>

        {/* Sub-views */}
        {view === 'householdSize'   && <HouseholdSizeView   preferences={preferences} onUpdate={onUpdate} />}
        {view === 'cookingPriority' && <CookingPriorityView preferences={preferences} onUpdate={onUpdate} />}
        {view === 'planMode'        && <PlanModeView        preferences={preferences} onUpdate={onUpdate} />}
        {view === 'shopSchedule'    && <ShopScheduleView    preferences={preferences} onUpdate={onUpdate} />}
        {view === 'editSubstitution'&& <EditSubstitutionView preferences={preferences} onUpdate={onUpdate} />}
        {view === 'editShortcut'    && <EditShortcutView    preferences={preferences} onUpdate={onUpdate} />}
        {view === 'dietary'         && <DietaryView         preferences={preferences} onUpdate={onUpdate} />}
        {view === 'revertData'      && <RevertDataView      onUpdate={onUpdate} />}
        {view === 'glossary'        && <GlossaryView />}

        {/* Main view */}
        {view === 'main' && (
          <div className="settings-panel__body">

            <div className="settings-section">
              <h3 className="settings-section__title">General</h3>
              <DrillRow label="Household Size"   onClick={() => setView('householdSize')} />
              <DrillRow label="Cooking Priority" onClick={() => setView('cookingPriority')} />
              <DrillRow
                label={
                  (preferences.dietaryModes?.length || preferences.allergyIngredients?.length)
                    ? `Diet & Allergies ${[
                        preferences.dietaryModes?.length
                          ? `(${preferences.dietaryModes.map((m) => DIETARY_MODE_LABELS[m]).join(', ')})`
                          : '',
                        preferences.allergyIngredients?.length
                          ? `(${preferences.allergyIngredients.length} allerg${preferences.allergyIngredients.length === 1 ? 'y' : 'ies'})`
                          : '',
                      ].filter(Boolean).join(' ')}`
                    : 'Diet & Allergies'
                }
                onClick={() => setView('dietary')}
              />
              <DrillRow label="Shopping Schedule" onClick={() => setView('shopSchedule')} />
              <ToggleRow
                label="Wholesale Shopping"
                checked={preferences.wholesale ?? false}
                onToggle={() => onUpdate({ wholesale: !preferences.wholesale })}
              />
            </div>

            <div className="settings-section">
              <h3 className="settings-section__title">Customize</h3>
              <ActionRow label="Customize Recipes"   onClick={() => onUpdate({ _action: 'customizeRecipes' })} />
              <ActionRow label="Customize Inventory" onClick={() => onUpdate({ _action: 'customizeInventory' })} />
            </div>

            <div className="settings-section">
              <h3 className="settings-section__title">Cooking Guide</h3>
              <div className="settings-row">
                <span className="settings-row__label">Glossary</span>
                <button className="settings-action-btn" onClick={() => setView('glossary')}>View →</button>
              </div>
              <ToggleRow
                label="Beginner Mode"
                checked={preferences.glossaryBeginnerMode ?? false}
                onToggle={() => onUpdate({ glossaryBeginnerMode: !(preferences.glossaryBeginnerMode ?? false) })}
              />
            </div>

            <div className="settings-section">
              <h3 className="settings-section__title">Display & Mode</h3>
              <ToggleRow
                label="Metric Units"
                checked={preferences.metricUnits ?? false}
                onToggle={() => onUpdate({ metricUnits: !preferences.metricUnits })}
              />
              <ToggleRow
                label="Show Low Waste Step"
                checked={preferences.showLowWaste ?? false}
                onToggle={() => onUpdate({ showLowWaste: !preferences.showLowWaste })}
              />
              <ToggleEditRow
                label="Show Substitutions"
                checked={preferences.showSubstitutions ?? false}
                onToggle={() => onUpdate({ showSubstitutions: !preferences.showSubstitutions })}
                onEdit={() => setView('editSubstitution')}
              />
              <ToggleEditRow
                label="Show Shortcut Mode"
                checked={isShortcutVisible}
                onToggle={toggleShortcutVisibility}
                onEdit={() => setView('editShortcut')}
              />
              <DrillRow label="Planned Cooking" onClick={() => setView('planMode')} />
              <ToggleRow
                label="Notifications"
                checked={preferences.notifications ?? false}
                onToggle={handleNotificationsToggle}
              />
              {notifBlocked && (
                <p className="settings-notif-blocked">
                  Notifications are blocked by your browser. Enable them in your browser's site settings, then try again.
                </p>
              )}
              {!notifBlocked && getNotificationPermission() === 'denied' && preferences.notifications && (
                <p className="settings-notif-blocked">
                  Notifications are blocked by your browser. Enable them in site settings.
                </p>
              )}
            </div>

            <div className="settings-section">
              <h3 className="settings-section__title">Data</h3>
              <DrillRow label="Reset to Defaults" onClick={() => setView('revertData')} />
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
