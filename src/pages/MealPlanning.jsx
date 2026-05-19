import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getRecipes } from '../db/recipesDB'
import { getIngredients } from '../db/ingredientsDB'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { CUISINES } from '../db/data/filterOptions'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { isRecipeAllergyExcluded, getAllergyOmitIds, getDietarySubstitutes, getShortcutFallbackSub, recipeNeedsAutoShortcut, isDietaryOmittedIngredient, DIETARY_MODE_LABELS, DIETARY_MODE_FIELD, getStackedSubOptions, isDietaryFieldIncompatible } from '../utils/dietaryUtils'
import { convertToMetric, formatMinutes, getTotalTime, getTotalActiveTime, scaleRecipe, parseQtyStr } from '../utils/recipeUtils'
import { buildGroceryList } from '../utils/groceryUtils'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SORT_ORDERS = {
  difficulty:      { easy: 0, moderate: 1, difficult: 2 },
  priceLevel:      { cheap: 0, mid: 1, expensive: 2 },
  timeRequirement: { short: 0, medium: 1, long: 2 },
  // caloriesPerServing is numeric — no mapping needed; handled in sort logic
}

const PRIORITY_TO_BADGE = {
  cheapest:    (r) => r.priceLevel         ? { label: r.priceLevel,                      type: 'price'      } : null,
  quickest:    (r) => r.timeRequirement    ? { label: r.timeRequirement,                 type: 'time'       } : null,
  easiest:     (r) => r.difficulty         ? { label: r.difficulty,                      type: 'difficulty' } : null,
  exploration: (r) => r.cuisine            ? { label: r.cuisine,                         type: 'cuisine'    } : null,
  frequency:   (r) => r.mealprepIdeal === 'yes' ? { label: 'Meal Prep ✓',               type: 'mealprep'   } : null,
  'low-waste': ()  => null,
  healthy:     (r) => r.caloriesPerServing ? { label: `${r.caloriesPerServing} cal`,     type: 'calories'   } : null,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns 7 day indices starting from shopDay (shopDay appears first)
function orderedDays(shopDay) {
  if (shopDay === null || shopDay === undefined) return [0, 1, 2, 3, 4, 5, 6]
  return Array.from({ length: 7 }, (_, i) => (shopDay + i) % 7)
}

function defaultSortFromPriorities(ranked) {
  const top = ranked?.[0]
  if (top === 'cheapest') return { field: 'priceLevel',         dir: 'asc' }
  if (top === 'easiest')  return { field: 'difficulty',         dir: 'asc' }
  if (top === 'quickest') return { field: 'timeRequirement',    dir: 'asc' }
  if (top === 'healthy')  return { field: 'caloriesPerServing', dir: 'asc' }
  return null
}

// ─── Recipe View Modal ────────────────────────────────────────────────────────

function RecipeViewModal({ recipe, preferences, ingredientsMap, allergyOmitIds, onClose, onSelect }) {
  const shortcutIsOnByDefault = preferences.shortcutMode?.startsWith('on') ?? false
  const shortcutVisible       = preferences.shortcutMode?.includes('visible') ?? true
  // Auto-shortcut is only applied when the shortcut feature is available to the
  // user. When shortcut mode is fully disabled ('off-hidden'), fall back to
  // normal dietary-omit / recipe-hidden logic instead.
  const shortcutAllowed       = (preferences.shortcutMode ?? 'off-visible') !== 'off-hidden'

  // Auto-shortcut: open in shortcut mode if the recipe contains an ingredient
  // that is dietary/allergy-incompatible but has a safe shortcut alternative.
  const autoShortcut  = shortcutAllowed
    ? recipeNeedsAutoShortcut(
        recipe, ingredientsMap,
        preferences.dietaryModes ?? [],
        preferences.allergyIngredients ?? [],
      )
    : false
  const [showShortcut, setShowShortcut] = useState(shortcutIsOnByDefault || autoShortcut)
  const [showSubs, setShowSubs]         = useState(preferences.showSubstitutions ?? false)

  const hasStepShortcuts = recipe.steps.some(
    (s) => s.shortcutText && s.shortcutText !== 'no-shortcut'
  )
  const hasIngShortcuts = recipe.ingredients.some(
    (i) => i.shortcutSubstitute && i.shortcutSubstitute !== 'none'
  )
  const hasAnyShortcut = hasStepShortcuts || hasIngShortcuts || recipe.shortcutReplaces

  const subMode = preferences.substitutionMode ?? 'regular'

  const dietaryModes = preferences.dietaryModes ?? []

  // Scale recipe to household size (same logic as Cook page)
  const scaled = useMemo(
    () => scaleRecipe(recipe, preferences.recipeSize ?? 'single'),
    [recipe, preferences.recipeSize]
  )

  const timePhases = recipe.timeToComplete ?? []
  const totalTime  = getTotalTime(timePhases)
  const activeTime = getTotalActiveTime(timePhases)
  const hasPassive = activeTime < totalTime

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>← Back</button>
          <h2 className="modal-title">{recipe.name}</h2>
          <button className="btn btn--primary modal-select-btn" onClick={() => onSelect(recipe, showShortcut)}>
            + Select{showShortcut ? ' ⚡' : ''}
          </button>
        </div>

        {/* Meta badges */}
        <div className="modal-meta">
          <span className="recipe-badge recipe-badge--cuisine">{recipe.cuisine}</span>
          <span className="recipe-badge recipe-badge--difficulty">{recipe.difficulty}</span>
          <span className="recipe-badge recipe-badge--time">{recipe.timeRequirement}</span>
          <span className="recipe-badge recipe-badge--price">{recipe.priceLevel}</span>
          {recipe.dishType !== 'main' && (
            <span className="recipe-badge recipe-badge--mealprep">{recipe.dishType}</span>
          )}
        </div>

        {/* Time & Servings */}
        {timePhases.length > 0 && (
          <div className="modal-info-row">
            <div className="modal-info-time">
              <span className="modal-info-time__total">
                ⏱ {formatMinutes(totalTime)}
              </span>
              {hasPassive && (
                <span className="modal-info-time__active">
                  ({formatMinutes(activeTime)} active)
                </span>
              )}
              <span className="modal-info-time__breakdown">
                {timePhases.map((p, i) => (
                  <span key={i} className={`modal-info-phase modal-info-phase--${p.phase}`}>
                    {p.phase.charAt(0).toUpperCase() + p.phase.slice(1)}: {formatMinutes(p.minutes)}
                  </span>
                ))}
              </span>
            </div>
            {scaled.servings && (
              <div className="modal-info-servings">
                🍽 {scaled.servings} {scaled.servings === 1 ? 'serving' : 'servings'}
                {recipe.caloriesPerServing && (
                  <span className="modal-info-calories">~{recipe.caloriesPerServing} cal/serving</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shortcut summary banner */}
        {showShortcut && recipe.shortcutReplaces && (
          <div className="modal-shortcut-note">
            ⚡ Shortcut: {recipe.shortcutReplaces}
          </div>
        )}

        {/* Mode toggles */}
        <div className="modal-toggles">
          {hasAnyShortcut && shortcutVisible && (
            <div className="modal-toggle-row">
              <span className="modal-toggle-label">Shortcut Mode</span>
              <button
                className={`toggle ${showShortcut ? 'toggle--on' : ''}`}
                onClick={() => setShowShortcut((v) => !v)}
                role="switch"
                aria-checked={showShortcut}
              >
                <span className="toggle__knob" />
              </button>
            </div>
          )}
          <div className="modal-toggle-row">
            <span className="modal-toggle-label">Show Substitutions</span>
            <button
              className={`toggle ${showSubs ? 'toggle--on' : ''}`}
              onClick={() => setShowSubs((v) => !v)}
              role="switch"
              aria-checked={showSubs}
            >
              <span className="toggle__knob" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="modal-body">

          {/* Ingredients */}
          <div className="modal-section">
            <h3 className="modal-section__title">Ingredients</h3>
            <ul className="view-ing-list">
              {scaled.ingredients.map((ing, i) => {
                const data           = ingredientsMap[ing.ingredientId]
                const scSub          = ing.shortcutSubstitute
                const isAllergyOmit  = allergyOmitIds?.has(ing.ingredientId) ?? false
                const isShortcutOmit = showShortcut && scSub === 'omit'

                // Dietary substitutes: collect all unique subs from every active mode
                const dietarySubs    = getDietarySubstitutes(data, dietaryModes)
                const dietarySub     = dietarySubs.length > 0 ? dietarySubs.join(' / ') : null

                // Shortcut fallback: ingredient is dietary-incompatible or a critical
                // allergen, but this recipe provides a safe shortcut alternative.
                // Suppressed when shortcut mode is fully disabled ('off-hidden').
                const allergyList    = preferences.allergyIngredients ?? []
                const scFallback     = shortcutAllowed
                  ? getShortcutFallbackSub(data, dietaryModes, allergyList, ing, ingredientsMap)
                  : null

                // Dietary omit: ingredient is incompatible with the active diet and
                // shortcut mode is disabled, so it is simply dropped from the recipe.
                const isDietaryOmit  = !shortcutAllowed && isDietaryOmittedIngredient(data, dietaryModes)

                // When a fallback exists, don't apply omit styling for the allergy case
                const isOmit         = isShortcutOmit || (isAllergyOmit && !scFallback) || isDietaryOmit
                const hasSCSub       = !isOmit && showShortcut && scSub && scSub !== 'none' && scSub !== 'omit' && !scFallback
                const showDietarySub = !!dietarySub && !isOmit && !scFallback

                const modeSubText = (() => {
                  if (!showSubs || !data) return null
                  const dietarySet = new Set([...dietarySubs, ...(scFallback ? [scFallback] : [])])
                  const opts = getStackedSubOptions(data, subMode).filter((s) => !dietarySet.has(s))
                  return opts.length > 0 ? opts.join(' / ') : null
                })()

                // Metric conversion
                const metric   = preferences.metricUnits ? convertToMetric(ing.quantity, ing.unit) : null
                const dispQty  = metric ? metric.quantity : ing.quantity
                const dispUnit = metric ? metric.unit     : ing.unit

                return (
                  <li key={i} className={`view-ing ${isOmit ? 'view-ing--omit' : ''}`}>
                    <span className="view-ing__qty">{dispQty} {dispUnit}</span>
                    <div className="view-ing__right">
                      <span className="view-ing__name">
                        <span className={(showDietarySub || scFallback) && !isOmit ? 'view-ing__name--struck' : ''}>
                          {data?.name ?? ing.ingredientId}
                        </span>
                        {showDietarySub && (
                          <span className="view-ing__dietary"> → {dietarySub}</span>
                        )}
                        {scFallback && !isOmit && (
                          <span className="view-ing__dietary view-ing__dietary--fallback">
                            {' → '}{scFallback}
                            {!showShortcut && (
                              <span className="view-ing__fallback-note"> (safe alt · or omit)</span>
                            )}
                          </span>
                        )}
                        {hasSCSub && !showDietarySub && (
                          <span className="view-ing__sc"> → {scSub}</span>
                        )}
                        {isOmit && (
                          <span className="view-ing__sc view-ing__sc--omit">
                            {isAllergyOmit ? ' (allergy — omit)' : isDietaryOmit ? ' (dietary — omit)' : ' (omit)'}
                          </span>
                        )}
                      </span>
                      {modeSubText && !isOmit && (
                        <span className="view-ing__sub-note">
                          alt ({subMode}): {modeSubText}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Steps */}
          <div className="modal-section">
            <h3 className="modal-section__title">Steps</h3>
            <ol className="view-step-list">
              {recipe.steps.map((step, i) => {
                const useShortcut = showShortcut && step.shortcutText && step.shortcutText !== 'no-shortcut'
                return (
                  <li key={i} className="view-step">
                    <span className="view-step__num">{i + 1}</span>
                    <div className="view-step__content">
                      <span className="view-step__name">{step.name}</span>
                      <p className="view-step__text">{useShortcut ? step.shortcutText : step.text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Side Picker Modal ────────────────────────────────────────────────────────

function SidePickerModal({ mainRecipe, sideOptions, onConfirm, onCancel, preferences, ingredientsMap }) {
  const [selected,    setSelected]    = useState([])
  const [viewingSide, setViewingSide] = useState(null)

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const sideAllergyOmitIds = viewingSide
    ? getAllergyOmitIds(viewingSide, ingredientsMap, preferences?.allergyIngredients ?? [])
    : null

  return (
    <>
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-panel modal-panel--sm" onClick={(e) => e.stopPropagation()}>

          <div className="modal-header">
            <h2 className="modal-title">Add sides?</h2>
            <button className="modal-close-btn modal-close-btn--icon" onClick={onCancel}>✕</button>
          </div>

          <div className="modal-body modal-body--padded">
            <p className="modal-desc">
              Recommended sides for <strong>{mainRecipe.name}</strong>:
            </p>

            <div className="side-picker-list">
              {sideOptions.map((side) => {
                const isSelected       = selected.includes(side.id)
                const hasRecipeContent = (side.steps?.length > 0) || (side.ingredients?.length > 0)
                return (
                  <div
                    key={side.id}
                    className={`side-picker-card ${isSelected ? 'side-picker-card--selected' : ''}`}
                  >
                    <button className="side-picker-card__toggle" onClick={() => toggle(side.id)}>
                      <span className="side-picker-card__check">
                        {isSelected ? '✓' : '○'}
                      </span>
                      <span className="side-picker-card__name">{side.name}</span>
                    </button>
                    {hasRecipeContent && (
                      <button
                        className="side-picker-card__view-btn"
                        onClick={() => setViewingSide(side)}
                      >
                        View
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => onConfirm([])}>
                Skip sides
              </button>
              <button className="btn btn--primary" onClick={() => onConfirm(selected)}>
                Add to Week
              </button>
            </div>
          </div>

        </div>
      </div>

      {viewingSide && preferences && ingredientsMap && (
        <RecipeViewModal
          recipe={viewingSide}
          preferences={preferences}
          ingredientsMap={ingredientsMap}
          allergyOmitIds={sideAllergyOmitIds}
          onClose={() => setViewingSide(null)}
          onSelect={(r) => { toggle(r.id); setViewingSide(null) }}
        />
      )}
    </>
  )
}

// ─── Check Available Ingredients Modal ───────────────────────────────────────
// Items: [{ ingredientId, name, qty, unit }]
// onComplete(checkedIds): called with ingredient IDs the user confirmed they have

function CheckIngredientsModal({ items, onComplete, onSkip }) {
  const [checked, setChecked] = useState(new Set())

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="modal-overlay" onClick={onSkip}>
      <div className="modal-panel modal-panel--check" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">Check Your Pantry</h2>
          <button className="modal-close-btn modal-close-btn--icon" onClick={onSkip} title="Skip">✕</button>
        </div>

        <div className="check-ing-body">
          <p className="check-ing-desc">
            These ingredients from your selected recipes are on your common ingredients list.
            Check off any you already have enough of — they'll be left off your grocery list.
          </p>

          <ul className="check-ing-list">
            {items.map((item) => {
              const isChecked = checked.has(item.ingredientId)
              const qtyStr    = item.qty % 1 === 0 ? item.qty : item.qty.toFixed(2)
              return (
                <li
                  key={item.ingredientId}
                  className={`check-ing-item ${isChecked ? 'check-ing-item--checked' : ''}`}
                  onClick={() => toggle(item.ingredientId)}
                >
                  <span className={`check-ing-box ${isChecked ? 'check-ing-box--on' : ''}`}>
                    {isChecked ? '✓' : ''}
                  </span>
                  <div className="check-ing-info">
                    <span className="check-ing-name">{item.name}</span>
                    <span className="check-ing-qty">
                      need: {item.atLeast ? 'at least ' : ''}{qtyStr} {item.unit}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="check-ing-footer">
          <button className="btn btn--ghost" onClick={onSkip}>
            Skip
          </button>
          <button
            className="btn btn--primary"
            onClick={() => onComplete([...checked])}
          >
            Continue →
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Planned Calendar ─────────────────────────────────────────────────────────

function PlannedCalendar({ mealsByDay, recipesMap, shopDay, selectedDay, onSelectDay, onRemoveMeal, onMoveMeal, weekCount }) {
  const days = orderedDays(shopDay)

  // ── Drag state (local, not persisted) ─────────────────────────────────────
  const [dragSrc,  setDragSrc]  = useState(null) // { slotKey, mealIdx }
  const [dragOver, setDragOver] = useState(null) // slotKey being hovered

  function handleDragStart(e, slotKey, mealIdx) {
    e.dataTransfer.effectAllowed = 'move'
    setDragSrc({ slotKey, mealIdx })
  }

  function handleDragEnd() {
    setDragSrc(null)
    setDragOver(null)
  }

  function handleDragOver(e, slotKey, isShopDay) {
    if (isShopDay || !dragSrc) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(slotKey)
  }

  function handleDragLeave() {
    setDragOver(null)
  }

  function handleDrop(e, slotKey, isShopDay) {
    e.preventDefault()
    if (isShopDay || !dragSrc) { setDragSrc(null); setDragOver(null); return }
    onMoveMeal?.(dragSrc.slotKey, dragSrc.mealIdx, slotKey)
    setDragSrc(null)
    setDragOver(null)
  }

  function renderWeek(weekOffset) {
    return days.map((dayIdx) => {
      const isShopDay  = dayIdx === shopDay && weekOffset === 0
      const slotKey    = dayIdx + weekOffset * 7
      const isSelected = slotKey === selectedDay
      const isDragOver = slotKey === dragOver
      const meals      = mealsByDay[slotKey] ?? []

      return (
        <div
          key={slotKey}
          className={[
            'mp-cal-day',
            isShopDay  ? 'mp-cal-day--shop'     : '',
            isSelected ? 'mp-cal-day--selected'  : '',
            isDragOver ? 'mp-cal-day--dragover'  : '',
          ].join(' ')}
          onClick={() => !isShopDay && onSelectDay(slotKey)}
          onDragOver={(e) => handleDragOver(e, slotKey, isShopDay)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, slotKey, isShopDay)}
        >
          <span className="mp-cal-day__label">
            {DAYS_SHORT[dayIdx]}
            {isShopDay && <span className="mp-cal-shop-icon"> 🛒</span>}
          </span>
          {weekCount > 1 && <span className="mp-cal-week-tag">W{weekOffset + 1}</span>}

          <div className="mp-cal-day__meals">
            {isShopDay ? (
              <span className="mp-cal-shop-text">Shop</span>
            ) : meals.length === 0 ? (
              <span className="mp-cal-empty">—</span>
            ) : (
              meals.map((meal, idx) => {
                const recipe    = recipesMap[meal.recipeId]
                const isDragged = dragSrc?.slotKey === slotKey && dragSrc?.mealIdx === idx
                return (
                  <div
                    key={idx}
                    className={`mp-meal-chip ${isDragged ? 'mp-meal-chip--dragging' : ''}`}
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, slotKey, idx) }}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="mp-meal-chip__name">{recipe?.name ?? meal.recipeId}</span>
                    {meal.sides?.length > 0 && (
                      <span className="mp-meal-chip__sides">+{meal.sides.length}</span>
                    )}
                    <button
                      className="mp-meal-chip__remove"
                      onClick={(e) => { e.stopPropagation(); onRemoveMeal(slotKey, idx) }}
                      title="Remove meal"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {!isShopDay && (
            <span className={`mp-cal-hint ${isSelected ? 'mp-cal-hint--active' : ''}`}>
              {isDragOver ? '⬇ drop' : isSelected ? '✦ adding' : 'tap'}
            </span>
          )}
        </div>
      )
    })
  }

  return (
    <div className="mp-planned-cal">
      <div className="mp-cal-grid">
        {renderWeek(0)}
        {weekCount > 1 && renderWeek(1)}
      </div>
    </div>
  )
}

// ─── Unplanned / Mealprep Calendar ───────────────────────────────────────────
// Shop day appears as a single standalone column; the remaining 6 days share
// one undivided area where recipe tiles flow freely in multiple columns.

function UnplannedCalendar({ weekMeals, recipesMap, shopDay, onRemoveMeal, label }) {
  const days     = orderedDays(shopDay)           // 7 indices starting with shopDay
  const shopIdx  = days[0]                        // = shopDay (or 0 if null)
  const restDays = days.slice(1)                  // the 6 non-shop days

  return (
    <div className="mp-unplanned-cal">
      {label && <div className="mp-week-label">{label}</div>}

      <div className="mp-unplanned-grid">

        {/* ── Shop day column ── */}
        <div className="mp-cal-day mp-cal-day--shop mp-unplanned-shop-col">
          <span className="mp-cal-day__label">
            {DAYS_SHORT[shopIdx]}
            <span className="mp-cal-shop-icon"> 🛒</span>
          </span>
          <span className="mp-cal-shop-text">Shop</span>
        </div>

        {/* ── Rest of week ── */}
        <div className="mp-unplanned-rest">
          {/* Day-name headers — reference only, no dividers */}
          <div className="mp-unplanned-day-headers">
            {restDays.map((d) => (
              <span key={d} className="mp-unplanned-day-label">{DAYS_SHORT[d]}</span>
            ))}
          </div>

          {/* Undivided recipe tile area */}
          <div className="mp-unplanned-meals">
            {weekMeals.length === 0 ? (
              <span className="mp-empty-notice">
                No meals planned yet — select from the recipes below
              </span>
            ) : (
              weekMeals.map((meal, idx) => {
                const recipe = recipesMap[meal.recipeId]
                return (
                  <div key={idx} className="mp-meal-tile">
                    <div className="mp-meal-tile__info">
                      <span className="mp-meal-tile__name">{recipe?.name ?? meal.recipeId}</span>
                      {meal.sides?.length > 0 && (
                        <span className="mp-meal-tile__sides">
                          + {meal.sides.map((id) => recipesMap[id]?.name ?? id).join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      className="mp-meal-tile__remove"
                      onClick={() => onRemoveMeal(idx)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MealPlanning() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // ── One-time initialisation: process any pendingMeals from Low Waste ──────
  const [initData] = useState(() => {
    const prefs   = getPreferences()
    const pending = prefs.pendingMeals ?? []

    if (pending.length === 0) {
      return {
        prefs,
        mealsByDay: prefs.mealsByDay ?? {},
        weekMeals:  prefs.weekMeals  ?? [],
        weekMeals2: prefs.weekMeals2 ?? [],
      }
    }

    const allRecipes  = getRecipes()
    const recipesById = Object.fromEntries(allRecipes.map((r) => [r.id, r]))
    const shopDayVal  = prefs.shopDay  ?? null
    const isPlannedNow = prefs.planMode === 'planned'

    let newByDay      = { ...(prefs.mealsByDay ?? {}) }
    let newWeekMeals  = [...(prefs.weekMeals   ?? [])]

    if (isPlannedNow) {
      // Days ordered starting from shopDay; exclude shopDay itself
      const days = orderedDays(shopDayVal).filter((d) => d !== shopDayVal)
      let mainDayOffset = 0

      for (const meal of pending) {
        const recipe = recipesById[meal.recipeId]
        if (!recipe) continue
        if (recipe.dishType === 'main') {
          const slot = days[mainDayOffset % Math.max(days.length, 1)]
          newByDay[slot] = [...(newByDay[slot] ?? []), meal]
          mainDayOffset++
        } else {
          const firstSlot = days[0]
          if (firstSlot !== undefined) {
            newByDay[firstSlot] = [...(newByDay[firstSlot] ?? []), meal]
          }
        }
      }
    } else {
      newWeekMeals = [...newWeekMeals, ...pending]
    }

    const basePrefs = {
      ...prefs,
      pendingMeals: [],
      mealsByDay:   newByDay,
      weekMeals:    newWeekMeals,
    }
    // Rebuild the grocery list immediately so Shop reflects the correct state
    // (including any use-up ingredient exclusions set by LowWaste).
    const sections = buildGroceryList(basePrefs)
    const updatedPrefs = {
      ...basePrefs,
      groceryListSections: sections,
      shoppingListCleared: false,
    }
    savePreferences(updatedPrefs)

    return {
      prefs:      updatedPrefs,
      mealsByDay: newByDay,
      weekMeals:  newWeekMeals,
      weekMeals2: prefs.weekMeals2 ?? [],
    }
  })

  const [preferences, setPreferencesState] = useState(initData.prefs)
  const recipes     = useMemo(getRecipes, [])
  const ingredients = useMemo(getIngredients, [])

  const planMode     = preferences.planMode     ?? 'unplanned'
  const shopDay      = preferences.shopDay      ?? null
  const shopSchedule = preferences.shopSchedule ?? 'weekly'
  const isPlanned    = planMode === 'planned'
  const isBiweekly   = shopSchedule === 'biweekly'
  const weekCount    = isBiweekly ? 2 : 1

  // ── Meal state ────────────────────────────────────────────────────────────
  // Planned:   mealsByDay[0-6] = week1 days, mealsByDay[7-13] = week2 (biweekly)
  // Unplanned: weekMeals = week1 list, weekMeals2 = week2 (biweekly)
  const [mealsByDay, setMealsByDay] = useState(initData.mealsByDay)
  const [weekMeals,  setWeekMeals]  = useState(initData.weekMeals)
  const [weekMeals2, setWeekMeals2] = useState(initData.weekMeals2)

  // Selected calendar slot (planned mode). Key = 0-6 (wk1) or 7-13 (wk2 biweekly)
  const [selectedSlot, setSelectedSlot] = useState(() => {
    if (!isPlanned) return null
    const days = orderedDays(shopDay)
    // Default to first non-shop day
    const first = days.find((d) => d !== shopDay)
    return first ?? 1
  })

  // ── UI state ──────────────────────────────────────────────────────────────
  const [viewingRecipe,   setViewingRecipe]   = useState(null)
  const [pendingRecipe,   setPendingRecipe]   = useState(null) // { recipe, sideOptions }
  const [checkIngItems,   setCheckIngItems]   = useState(null) // array of pantry-check items, or null

  // ── Filter / sort state ───────────────────────────────────────────────────
  const initSort = useMemo(
    () => defaultSortFromPriorities(preferences.prioritiesRanked),
    [preferences.prioritiesRanked]
  )

  const [dishGroup,       setDishGroup]       = useState('mains')
  const [filtersOpen,     setFiltersOpen]     = useState(false)
  const [cuisineFilter,   setCuisineFilter]   = useState('')
  const [mealprepFilter,  setMealprepFilter]  = useState(false)
  const [multiTaskFilter, setMultiTaskFilter] = useState(false)
  const [sortBy,          setSortBy]          = useState(initSort?.field ?? null)
  const [sortDir,         setSortDir]         = useState(initSort?.dir   ?? 'asc')

  // ── Lookups ───────────────────────────────────────────────────────────────
  const recipesMap = useMemo(
    () => Object.fromEntries(recipes.map((r) => [r.id, r])),
    [recipes]
  )
  const ingredientsMap = useMemo(
    () => Object.fromEntries(ingredients.map((i) => [i.id, i])),
    [ingredients]
  )

  const badgePriorities = useMemo(() => {
    const ranked = preferences.prioritiesRanked ?? []
    return ranked.filter((p) => p !== 'low-waste').slice(0, 3)
  }, [preferences.prioritiesRanked])

  function getBadges(recipe) {
    const badges = []
    for (const p of badgePriorities) {
      const b = PRIORITY_TO_BADGE[p]?.(recipe)
      if (b) badges.push(b)
      if (badges.length >= 3) break
    }
    return badges
  }

  // ── Allergy helpers ───────────────────────────────────────────────────────
  const allergyList = preferences.allergyIngredients ?? []

  function recipeAllergyOmitIds(recipe) {
    return getAllergyOmitIds(recipe, ingredientsMap, allergyList)
  }

  // ── Filtered & sorted recipe list ─────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...recipes]
    // Allergy exclusion: hide recipes with non-omittable allergens
    if (allergyList.length) {
      list = list.filter((r) => !isRecipeAllergyExcluded(r, ingredientsMap, allergyList))
    }
    if (dishGroup === 'mains')  list = list.filter((r) => r.dishType === 'main')
    if (dishGroup === 'extras') list = list.filter((r) => r.dishType !== 'main')
    if (cuisineFilter)          list = list.filter((r) => r.cuisine === cuisineFilter)
    if (mealprepFilter)         list = list.filter((r) => r.mealprepIdeal === 'yes')
    if (multiTaskFilter)        list = list.filter((r) => r.multiTasking !== 'unlikely')

    if (sortBy) {
      const order = SORT_ORDERS[sortBy]
      list.sort((a, b) => {
        // Numeric fields (e.g. caloriesPerServing) are sorted directly
        const av = order ? (order[a[sortBy]] ?? 999) : (a[sortBy] ?? 999)
        const bv = order ? (order[b[sortBy]] ?? 999) : (b[sortBy] ?? 999)
        return sortDir === 'asc' ? av - bv : bv - av
      })
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [recipes, ingredientsMap, allergyList, dishGroup, cuisineFilter, mealprepFilter, multiTaskFilter, sortBy, sortDir])

  // ── Persist helpers ───────────────────────────────────────────────────────
  function persistMeals(byDay, wk1, wk2) {
    // Preserve checkedAvailableIngredients — it carries the exclusions set by
    // LowWaste (use-up ingredients) and the pantry check step.  Both are
    // deliberate user actions and should remain in effect until the user
    // explicitly redoes the pantry check (which overwrites this field).
    const base = {
      ...preferences,
      mealsByDay:  byDay,
      weekMeals:   wk1,
      weekMeals2:  wk2,
    }
    const sections = buildGroceryList(base)
    // Keep only shoppingChecked keys that still exist in the new list so the
    // progress state doesn't include stale or removed items.
    const validKeys = new Set(sections.flatMap((s) => s.items.map((i) => i.key)))
    const updated = {
      ...base,
      groceryListSections: sections,
      shoppingChecked: (preferences.shoppingChecked ?? []).filter((k) => validKeys.has(k)),
      shoppingListCleared: false,
    }
    setPreferencesState(updated)
    savePreferences(updated)
  }

  // ── Select recipe flow ────────────────────────────────────────────────────
  function handleSelectRecipe(recipe, useShortcut = preferences.shortcutMode?.startsWith('on') ?? false) {
    setViewingRecipe(null)
    if (recipe.dishType === 'main' && recipe.recommendedSides?.length > 0) {
      const sides = recipe.recommendedSides.map((id) => recipesMap[id]).filter(Boolean)
      if (sides.length > 0) {
        setPendingRecipe({ recipe, sideOptions: sides, useShortcut })
        return
      }
    }
    commitMeal(recipe, [], useShortcut)
  }

  function handleSidesConfirm(sides) {
    if (!pendingRecipe) return
    commitMeal(pendingRecipe.recipe, sides, pendingRecipe.useShortcut ?? false)
    setPendingRecipe(null)
  }

  function commitMeal(recipe, sides, useShortcut = false) {
    const meal = { recipeId: recipe.id, sides, ...(useShortcut ? { useShortcut: true } : {}) }
    if (isPlanned) {
      if (selectedSlot === null) return
      const updatedByDay = {
        ...mealsByDay,
        [selectedSlot]: [...(mealsByDay[selectedSlot] ?? []), meal],
      }
      setMealsByDay(updatedByDay)
      persistMeals(updatedByDay, weekMeals, weekMeals2)
    } else {
      const updated = [...weekMeals, meal]
      setWeekMeals(updated)
      persistMeals(mealsByDay, updated, weekMeals2)
    }
  }

  // ── Remove meal ───────────────────────────────────────────────────────────
  function removePlannedMeal(slotKey, mealIdx) {
    const updatedByDay = {
      ...mealsByDay,
      [slotKey]: (mealsByDay[slotKey] ?? []).filter((_, i) => i !== mealIdx),
    }
    setMealsByDay(updatedByDay)
    persistMeals(updatedByDay, weekMeals, weekMeals2)
  }

  // ── Move meal (drag & drop between planned-calendar days) ────────────────
  function movePlannedMeal(fromSlot, mealIdx, toSlot) {
    if (fromSlot === toSlot) return
    const sourceMeals = mealsByDay[fromSlot] ?? []
    const meal = sourceMeals[mealIdx]
    if (!meal) return
    const updatedByDay = {
      ...mealsByDay,
      [fromSlot]: sourceMeals.filter((_, i) => i !== mealIdx),
      [toSlot]:   [...(mealsByDay[toSlot] ?? []), meal],
    }
    setMealsByDay(updatedByDay)
    persistMeals(updatedByDay, weekMeals, weekMeals2)
  }

  function removeWeekMeal(idx, isWeek2 = false) {
    if (isWeek2) {
      const updated = weekMeals2.filter((_, i) => i !== idx)
      setWeekMeals2(updated)
      persistMeals(mealsByDay, weekMeals, updated)
    } else {
      const updated = weekMeals.filter((_, i) => i !== idx)
      setWeekMeals(updated)
      persistMeals(mealsByDay, updated, weekMeals2)
    }
  }

  // ── Preference update (for MiniSettings) ─────────────────────────────────
  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferencesState(updated)
    savePreferences(updated)
  }

  // ── Compute common-ingredient pantry check items ───────────────────────────
  // Returns items that (a) are needed by selected recipes and (b) are in
  // commonIngredients, with dietary substitutions applied:
  //   - If a recipe ingredient has a dietary substitute, the ORIGINAL is never
  //     prompted (the user will not buy it). The SUBSTITUTE's ID is looked up by
  //     name; if it is in commonIngredients that substitute is prompted instead.
  //   - If the substitute is not in commonIngredients it goes straight to the
  //     grocery list — no pantry prompt.
  //   - Ingredients with no dietary substitute are handled as before.
  function computeCheckItems() {
    const common = new Set(preferences.commonIngredients ?? [])
    if (common.size === 0) return []

    const dietaryModes = preferences.dietaryModes ?? []

    // Name → id lookup so we can resolve substitute names to ingredient IDs
    const nameToId = {}
    for (const [id, ing] of Object.entries(ingredientsMap)) {
      nameToId[ing.name.toLowerCase()] = id
    }

    // Collect all selected meals with their per-recipe shortcut flag
    const selectedMeals = [] // [{ recipeId, useShortcut }]
    if (isPlanned) {
      Object.values(mealsByDay).forEach((dayMeals) =>
        dayMeals.forEach((m) => {
          selectedMeals.push({ recipeId: m.recipeId, useShortcut: m.useShortcut ?? false })
          m.sides?.forEach((id) => selectedMeals.push({ recipeId: id, useShortcut: false }))
        })
      )
    } else {
      ;[...weekMeals, ...weekMeals2].forEach((m) => {
        selectedMeals.push({ recipeId: m.recipeId, useShortcut: m.useShortcut ?? false })
        m.sides?.forEach((id) => selectedMeals.push({ recipeId: id, useShortcut: false }))
      })
    }

    if (selectedMeals.length === 0) return []

    // Aggregate needed quantities per ingredient+unit, respecting shortcut
    // omissions, dietary substitutions, and household-size scaling
    const recipeSize = preferences.recipeSize ?? 'single'
    const allergyListForCheck = preferences.allergyIngredients ?? []
    const shortcutAllowed = (preferences.shortcutMode ?? 'off-visible') !== 'off-hidden'
    const agg = {} // key: ingredientId
    for (const { recipeId, useShortcut } of selectedMeals) {
      const recipe = recipesMap[recipeId]
      if (!recipe) continue
      // Respect auto-shortcut: if the recipe has a safe shortcut for a
      // restricted ingredient, treat the whole recipe as shortcut mode.
      const effectiveShortcut = useShortcut || (shortcutAllowed && recipeNeedsAutoShortcut(recipe, ingredientsMap, dietaryModes, allergyListForCheck))
      const scaled = scaleRecipe(recipe, recipeSize)
      scaled.ingredients.forEach((ing) => {
        // Shortcut mode: skip original ingredients that have a shortcut version
        if (effectiveShortcut && ing.shortcutSubstitute && ing.shortcutSubstitute !== 'none') return

        const data = ingredientsMap[ing.ingredientId]

        const parsedQty = parseQtyStr(ing.quantity)

        // ── Dietary substitution handling ─────────────────────────────────────
        if (dietaryModes.length > 0) {
          const subs = getDietarySubstitutes(data, dietaryModes)
          if (subs.length > 0) {
            // The original ingredient is being replaced — never prompt for it.
            // Only prompt for the FIRST substitute that has an exact ID match in
            // commonIngredients. Using the first prevents multiple pantry entries
            // for the same original ingredient when several modes each suggest a
            // different substitute.
            for (const subName of subs) {
              const subId = nameToId[subName.toLowerCase()]
              if (!subId || !common.has(subId)) continue
              const subData = ingredientsMap[subId]
              if (!agg[subId]) {
                agg[subId] = { ingredientId: subId, name: subData?.name ?? subName, qty: parsedQty, unit: ing.unit, atLeast: false }
              } else if (agg[subId].unit === ing.unit) {
                agg[subId].qty += parsedQty
              } else {
                agg[subId].atLeast = true
              }
              break // one substitute per original ingredient
            }
            return // Don't fall through to the original-ingredient check
          }

          // Any active mode declares this ingredient incompatible (omit/none) —
          // it won't appear on the grocery list so don't include it in the pantry check.
          const hasIncompatibleMode = dietaryModes.some((mode) => {
            const field = DIETARY_MODE_FIELD[mode]
            if (!field) return false
            const v = data?.[field]
            return isDietaryFieldIncompatible(v)
          })
          if (hasIncompatibleMode) return
        }

        // ── No dietary substitution — check the original ingredient ───────────
        if (!common.has(ing.ingredientId)) return
        if (!agg[ing.ingredientId]) {
          agg[ing.ingredientId] = { ingredientId: ing.ingredientId, name: data?.name ?? ing.ingredientId, qty: parsedQty, unit: ing.unit, atLeast: false }
        } else if (agg[ing.ingredientId].unit === ing.unit) {
          agg[ing.ingredientId].qty += parsedQty
        } else {
          agg[ing.ingredientId].atLeast = true
        }
      })
    }

    return Object.values(agg)
  }

  // ── Next-step handler ─────────────────────────────────────────────────────
  function handleNext() {
    const items = computeCheckItems()
    if (items.length > 0) {
      setCheckIngItems(items)
    } else {
      navigate('/restock')
    }
  }

  // ── Check modal complete ──────────────────────────────────────────────────
  function handleCheckComplete(checkedKeys) {
    // checkedKeys are ingredientId strings (ingredient IDs use hyphens, not underscores,
    // so split('_')[0] safely returns the full ID even for multi-word IDs)
    const checkedIngredientIds = new Set(checkedKeys.map((k) => k.split('_')[0]))

    // The pantry-check modal only showed a scoped set of items (checkIngItems).
    // We must NOT wipe unrelated exclusions (e.g. LowWaste use-up ingredients).
    // Strategy: start from the existing set, then apply the modal's results only
    // for IDs that were actually presented in the modal.
    const pantryScope = new Set((checkIngItems ?? []).map((item) => item.ingredientId))
    const merged = new Set(preferences.checkedAvailableIngredients ?? [])
    for (const id of pantryScope) {
      if (checkedIngredientIds.has(id)) {
        merged.add(id)      // user confirmed they have it → exclude from list
      } else {
        merged.delete(id)   // user said they need it → include in list
      }
    }

    const withCheck = { ...preferences, checkedAvailableIngredients: [...merged] }
    // Rebuild sections so confirmed-as-have ingredients are excluded from the list
    const sections = buildGroceryList(withCheck)
    const validKeys = new Set(sections.flatMap((s) => s.items.map((i) => i.key)))
    const updated = {
      ...withCheck,
      groceryListSections: sections,
      shoppingChecked: (preferences.shoppingChecked ?? []).filter((k) => validKeys.has(k)),
      shoppingListCleared: false,
    }
    setPreferencesState(updated)
    savePreferences(updated)
    setCheckIngItems(null)
    navigate('/restock')
  }

  function handleCheckSkip() {
    setCheckIngItems(null)
    navigate('/restock')
  }

  // ── Sort toggle ───────────────────────────────────────────────────────────
  function handleSort(field) {
    if (sortBy === field) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortBy(null); setSortDir('asc') }
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const hasActiveFilters = cuisineFilter || mealprepFilter || multiTaskFilter || sortBy

  // ── Slot label for "Adding to" indicator ──────────────────────────────────
  const slotLabel = selectedSlot !== null
    ? DAYS_FULL[selectedSlot % 7] + (isBiweekly ? ` (W${Math.floor(selectedSlot / 7) + 1})` : '')
    : null

  return (
    <div className="page step-page mp-page">

      {/* ── Header ── */}
      <div className="step-page__header">
        <button className="step-back-btn" onClick={() => navigate('/')}>← Main Menu</button>
        <div className="step-page__header-row">
          <h1 className="step-page__title">🍽️ Step 1 — Meal Planning</h1>
          <MiniSettings preferences={preferences} onUpdate={handlePreferenceUpdate} hideShortcut />
        </div>
        <p className="step-page__subtitle">Browse your recipe library and build your week.</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Weekly Calendar
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mp-section">
        <div className="mp-section-head">
          <h2 className="mp-section-title">Your Week{isBiweekly ? 's' : ''}</h2>
          {isPlanned && slotLabel && (
            <span className="mp-adding-to">
              Adding to: <strong>{slotLabel}</strong>
            </span>
          )}
        </div>

        {isPlanned ? (
          <PlannedCalendar
            mealsByDay={mealsByDay}
            recipesMap={recipesMap}
            shopDay={shopDay}
            selectedDay={selectedSlot}
            onSelectDay={setSelectedSlot}
            onRemoveMeal={removePlannedMeal}
            onMoveMeal={movePlannedMeal}
            weekCount={weekCount}
          />
        ) : (
          <>
            <UnplannedCalendar
              weekMeals={weekMeals}
              recipesMap={recipesMap}
              shopDay={shopDay}
              onRemoveMeal={(idx) => removeWeekMeal(idx, false)}
              label={isBiweekly ? 'Week 1' : null}
            />
            {isBiweekly && (
              <UnplannedCalendar
                weekMeals={weekMeals2}
                recipesMap={recipesMap}
                shopDay={shopDay}
                onRemoveMeal={(idx) => removeWeekMeal(idx, true)}
                label="Week 2"
              />
            )}
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Recipe Browser
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mp-section mp-section--recipes">
        <div className="mp-section-head">
          <h2 className="mp-section-title">Recipes</h2>
        </div>

        {/* Dish type group toggle */}
        <div className="mp-dish-toggle">
          {[
            { id: 'mains',  label: 'Mains Only' },
            { id: 'extras', label: 'Extras' },
            { id: 'all',    label: 'All' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={`mp-dish-btn ${dishGroup === opt.id ? 'mp-dish-btn--active' : ''}`}
              onClick={() => setDishGroup(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="library-filter-bar">
          <button
            className={`filter-toggle-btn ${hasActiveFilters ? 'filter-toggle-btn--active' : ''}`}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {hasActiveFilters ? '● Filters' : 'Filters'} {filtersOpen ? '▲' : '▼'}
          </button>

          {filtersOpen && (
            <div className="filter-panel">
              <div className="filter-row">
                <select
                  className="filter-select"
                  value={cuisineFilter}
                  onChange={(e) => setCuisineFilter(e.target.value)}
                >
                  <option value="">All Cuisines</option>
                  {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="filter-row">
                <span className="filter-label">Sort by:</span>
                {[
                  { field: 'difficulty',         label: 'Difficulty' },
                  { field: 'priceLevel',         label: 'Price' },
                  { field: 'timeRequirement',    label: 'Time' },
                  { field: 'caloriesPerServing', label: 'Calories' },
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    className={`sort-btn ${sortBy === field ? 'sort-btn--active' : ''}`}
                    onClick={() => handleSort(field)}
                  >
                    {sortBy === field ? `${label} ${sortDir === 'asc' ? '↑' : '↓'}` : label}
                  </button>
                ))}
              </div>

              <div className="filter-row">
                <button
                  className={`filter-chip ${mealprepFilter ? 'filter-chip--on' : ''}`}
                  onClick={() => setMealprepFilter((f) => !f)}
                >
                  Meal Prep Friendly
                </button>
                <button
                  className={`filter-chip ${multiTaskFilter ? 'filter-chip--on' : ''}`}
                  onClick={() => setMultiTaskFilter((f) => !f)}
                >
                  Multi-Taskable
                </button>
                {hasActiveFilters && (
                  <button
                    className="filter-chip filter-chip--clear"
                    onClick={() => {
                      setCuisineFilter('')
                      setSortBy(initSort?.field ?? null)
                      setSortDir(initSort?.dir ?? 'asc')
                      setMealprepFilter(false)
                      setMultiTaskFilter(false)
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Allergy filter notice */}
        {allergyList.length > 0 && (
          <p className="allergy-filter-notice">
            🚫 Recipes with non-omittable allergens ({allergyList.join(', ')}) are hidden.
          </p>
        )}

        {/* Recipe list */}
        <div className="recipe-list">
          {displayed.length === 0 ? (
            <p className="recipe-list__empty">No recipes match the current filters.</p>
          ) : (
            displayed.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-card__info">
                  <span className="recipe-card__name">{recipe.name}</span>
                  <div className="recipe-card__badges">
                    {getBadges(recipe).map((badge, i) => (
                      <span key={i} className={`recipe-badge recipe-badge--${badge.type}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="recipe-card__mp-btns">
                  <button
                    className="recipe-card__view-btn"
                    onClick={() => setViewingRecipe(recipe)}
                  >
                    View
                  </button>
                  <button
                    className="recipe-card__select-btn"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    + Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Recipe View Modal ── */}
      {viewingRecipe && (
        <RecipeViewModal
          recipe={viewingRecipe}
          preferences={preferences}
          ingredientsMap={ingredientsMap}
          allergyOmitIds={recipeAllergyOmitIds(viewingRecipe)}
          onClose={() => setViewingRecipe(null)}
          onSelect={(r, useShortcut) => { setViewingRecipe(null); handleSelectRecipe(r, useShortcut) }}
        />
      )}

      {/* ── Side Picker Modal ── */}
      {pendingRecipe && (
        <SidePickerModal
          mainRecipe={pendingRecipe.recipe}
          sideOptions={pendingRecipe.sideOptions}
          onConfirm={handleSidesConfirm}
          onCancel={() => setPendingRecipe(null)}
          preferences={preferences}
          ingredientsMap={ingredientsMap}
        />
      )}

      {/* ── Check Available Ingredients Modal ── */}
      {checkIngItems && (
        <CheckIngredientsModal
          items={checkIngItems}
          onComplete={handleCheckComplete}
          onSkip={handleCheckSkip}
        />
      )}

      {/* ── Step Navigation ── */}
      <StepNav
        currentPath={location.pathname}
        preferences={preferences}
        onNext={handleNext}
      />

    </div>
  )
}
