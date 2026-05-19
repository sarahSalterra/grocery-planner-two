import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import { getRecipes } from '../db/recipesDB'
import { getIngredients } from '../db/ingredientsDB'
import { CUISINES } from '../db/data/filterOptions'
import CookPromptModal from '../notifications/CookPromptModal'
import { getAllergyOmitIds, getDietarySubstitutes, getStackedSubOptions, getShortcutFallbackSub, recipeNeedsAutoShortcut, isDietaryOmittedIngredient } from '../utils/dietaryUtils'
import { scaleRecipe, formatMinutes, getTotalTime, getTotalActiveTime, convertToMetric } from '../utils/recipeUtils'
import { GLOSSARY_MAP, GLOSSARY_TERMS_SORTED } from '../db/data/glossary'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SORT_ORDERS = {
  difficulty:      { easy: 0, moderate: 1, difficult: 2 },
  priceLevel:      { cheap: 0, mid: 1, expensive: 2 },
  timeRequirement: { short: 0, medium: 1, long: 2 },
}

// ─── Cook Recipe Modal ────────────────────────────────────────────────────────
// browseMode = true: step checkboxes hidden, Mark Complete just closes the view

function CookRecipeModal({ recipe, preferences, ingredientsMap, allergyOmitIds, onCancel, onComplete, browseMode, initialShortcut }) {
  const shortcutIsOn    = preferences.shortcutMode?.startsWith('on')    ?? false
  const shortcutVisible = preferences.shortcutMode?.includes('visible') ?? true
  const shortcutAllowed = (preferences.shortcutMode ?? 'off-visible') !== 'off-hidden'

  // Auto-shortcut: open in shortcut mode if the recipe contains a dietary/
  // allergy-incompatible ingredient that has a safe shortcut alternative.
  // Skipped when shortcut mode is fully disabled ('off-hidden').
  const autoShortcut    = shortcutAllowed
    ? recipeNeedsAutoShortcut(
        recipe, ingredientsMap,
        preferences.dietaryModes ?? [],
        preferences.allergyIngredients ?? [],
      )
    : false
  // If the meal was planned in shortcut mode (or auto-shortcut applies), open already in shortcut mode
  const [showShortcut,  setShowShortcut]  = useState((initialShortcut ?? shortcutIsOn) || autoShortcut)
  const [showSubs,      setShowSubs]      = useState(preferences.showSubstitutions ?? false)
  const [stepsChecked,  setStepsChecked]  = useState(new Set())
  const [activeTooltip, setActiveTooltip] = useState(null) // { term, definition } | null

  // Beginner mode: highlight glossary terms in step text
  const isBeginnerMode = preferences.glossaryBeginnerMode ?? false

  // Regex built once from glossary terms (longest first to avoid partial matches)
  const glossaryRegex = useMemo(() => {
    if (!isBeginnerMode) return null
    const escaped = GLOSSARY_TERMS_SORTED.map((t) =>
      t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  }, [isBeginnerMode])

  // Split a step text string into plain strings and clickable <span> elements
  function renderAnnotatedText(text) {
    if (!isBeginnerMode || !glossaryRegex || !text) return text
    const parts = []
    let lastIndex = 0
    glossaryRegex.lastIndex = 0
    let match
    while ((match = glossaryRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
      const word  = match[1]
      const entry = GLOSSARY_MAP[word.toLowerCase()]
      if (entry) {
        const captured = word
        parts.push(
          <button
            key={match.index}
            className={`glossary-term${activeTooltip?.term === entry.term ? ' glossary-term--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setActiveTooltip((prev) =>
                prev?.term === entry.term ? null : { term: entry.term, definition: entry.definition }
              )
            }}
          >
            {captured}
          </button>
        )
      } else {
        parts.push(word)
      }
      lastIndex = glossaryRegex.lastIndex
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts.length > 0 ? parts : text
  }

  const subMode = preferences.substitutionMode ?? 'regular'

  const dietaryModes = preferences.dietaryModes ?? []

  // Scale recipe to the user's household size preference
  const scaled = useMemo(
    () => scaleRecipe(recipe, preferences.recipeSize ?? 'single'),
    [recipe, preferences.recipeSize]
  )

  const hasAnyShortcut =
    recipe.shortcutReplaces ||
    (recipe.steps ?? []).some((s) => s.shortcutText && s.shortcutText !== 'no-shortcut') ||
    (recipe.ingredients ?? []).some((i) => i.shortcutSubstitute && i.shortcutSubstitute !== 'none')

  // Time summary
  const timePhases   = recipe.timeToComplete ?? []
  const totalTime    = getTotalTime(timePhases)
  const activeTime   = getTotalActiveTime(timePhases)
  const hasPassive   = activeTime < totalTime

  function toggleStep(i) {
    setStepsChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const allStepsDone = stepsChecked.size === (recipe.steps ?? []).length

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onCancel}>← Back</button>
          <h2 className="modal-title">{recipe.name}</h2>
        </div>

        {/* Meta badges */}
        <div className="modal-meta">
          <span className="recipe-badge recipe-badge--cuisine">{recipe.cuisine}</span>
          <span className="recipe-badge recipe-badge--difficulty">{recipe.difficulty}</span>
          <span className="recipe-badge recipe-badge--time">{recipe.timeRequirement}</span>
          <span className="recipe-badge recipe-badge--price">{recipe.priceLevel}</span>
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
            <div className="modal-info-servings">
              🍽 {scaled.servings} {scaled.servings === 1 ? 'serving' : 'servings'}
            </div>
          </div>
        )}

        {/* Shortcut banner */}
        {showShortcut && recipe.shortcutReplaces && (
          <div className="modal-shortcut-note">⚡ Shortcut: {recipe.shortcutReplaces}</div>
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
                const data     = ingredientsMap[ing.ingredientId]
                const metric   = preferences.metricUnits ? convertToMetric(ing.quantity, ing.unit) : null
                const dispQty  = metric ? metric.quantity : ing.quantity
                const dispUnit = metric ? metric.unit     : ing.unit
                const scSub    = ing.shortcutSubstitute
                const isOmit   = showShortcut && scSub === 'omit'
                const isAllergyOmit  = allergyOmitIds?.has(ing.ingredientId) ?? false
                const dietarySubs    = getDietarySubstitutes(data, dietaryModes)
                const dietarySub     = dietarySubs.length > 0 ? dietarySubs.join(' / ') : null

                // Shortcut fallback: ingredient is dietary-incompatible or a critical
                // allergen, but this recipe provides a safe shortcut alternative.
                // Suppressed when shortcut mode is fully disabled ('off-hidden').
                const allergyList    = preferences.allergyIngredients ?? []
                const scFallback     = shortcutAllowed
                  ? getShortcutFallbackSub(data, dietaryModes, allergyList, ing, ingredientsMap)
                  : null

                // Dietary omit: ingredient is incompatible and shortcut mode is
                // disabled, so the ingredient is simply dropped from the recipe.
                const isDietaryOmit  = !shortcutAllowed && isDietaryOmittedIngredient(data, dietaryModes)

                // Only apply omit styling when there is no shortcut fallback to show instead
                const effectiveOmit  = isOmit || (isAllergyOmit && !scFallback) || isDietaryOmit
                // hasSCSub: suppress if scFallback is already showing the same shortcut
                const hasSCSub = showShortcut && scSub && scSub !== 'none' && scSub !== 'omit' && !scFallback

                const modeSubText = (() => {
                  if (!showSubs || !data) return null
                  const dietarySet = new Set([...dietarySubs, ...(scFallback ? [scFallback] : [])])
                  const opts = getStackedSubOptions(data, subMode).filter((s) => !dietarySet.has(s))
                  return opts.length > 0 ? opts.join(' / ') : null
                })()

                return (
                  <li key={i} className={`view-ing ${effectiveOmit ? 'view-ing--omit' : ''}`}>
                    <span className="view-ing__qty">{dispQty} {dispUnit}</span>
                    <div className="view-ing__right">
                      <span className="view-ing__name">
                        <span className={(dietarySub || scFallback) && !effectiveOmit ? 'view-ing__name--struck' : ''}>
                          {data?.name ?? ing.ingredientId}
                        </span>
                        {dietarySub && !effectiveOmit && !scFallback && (
                          <span className="view-ing__dietary"> → {dietarySub}</span>
                        )}
                        {scFallback && !effectiveOmit && (
                          <span className="view-ing__dietary view-ing__dietary--fallback">
                            {' → '}{scFallback}
                            {!showShortcut && (
                              <span className="view-ing__fallback-note"> (safe alt · or omit)</span>
                            )}
                          </span>
                        )}
                        {hasSCSub && !dietarySub && !effectiveOmit && (
                          <span className="view-ing__sc"> → {scSub}</span>
                        )}
                        {effectiveOmit && (
                          <span className="view-ing__sc view-ing__sc--omit">
                            {isAllergyOmit ? ' (allergy — omit)' : isDietaryOmit ? ' (dietary — omit)' : ' (omit)'}
                          </span>
                        )}
                      </span>
                      {modeSubText && !effectiveOmit && (
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
            <h3 className="modal-section__title">
              {browseMode ? 'Steps' : `Steps — ${stepsChecked.size} / ${recipe.steps.length} done`}
            </h3>
            <ol className="cook-step-list">
              {recipe.steps.map((step, i) => {
                const useShortcut = showShortcut && step.shortcutText && step.shortcutText !== 'no-shortcut'
                const isDone      = stepsChecked.has(i)
                return (
                  <li
                    key={i}
                    className={`cook-step ${isDone ? 'cook-step--done' : ''} ${browseMode ? 'cook-step--browse' : ''}`}
                    onClick={() => !browseMode && toggleStep(i)}
                  >
                    {browseMode ? (
                      <span className="view-step__num">{i + 1}</span>
                    ) : (
                      <span className={`cook-step__box ${isDone ? 'cook-step__box--on' : ''}`}>
                        {isDone ? '✓' : ''}
                      </span>
                    )}
                    <div className="cook-step__content">
                      <span className="cook-step__name">{step.name}</span>
                      <p className="cook-step__text">
                        {renderAnnotatedText(useShortcut ? step.shortcutText : step.text)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

        </div>

        {/* Glossary tooltip — bottom sheet */}
        {activeTooltip && (
          <div
            className="glossary-tooltip-backdrop"
            onClick={() => setActiveTooltip(null)}
          >
            <div
              className="glossary-tooltip"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glossary-tooltip__header">
                <span className="glossary-tooltip__term">{activeTooltip.term}</span>
                <button
                  className="glossary-tooltip__close"
                  onClick={() => setActiveTooltip(null)}
                >
                  ✕
                </button>
              </div>
              <p className="glossary-tooltip__def">{activeTooltip.definition}</p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="cook-modal-footer">
          <button className="btn btn--ghost" onClick={onCancel}>
            {browseMode ? 'Close' : 'Cancel'}
          </button>
          <button
            className={`btn btn--primary ${!browseMode && !allStepsDone ? 'cook-btn--muted' : ''}`}
            onClick={onComplete}
          >
            {browseMode
              ? 'Close'
              : allStepsDone
                ? '✓ Mark as Complete'
                : 'Mark as Complete'
            }
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Recipe Library Browse (shown when no meals are planned) ──────────────────

function RecipeLibraryBrowse({ recipes, preferences, ingredientsMap, onBack }) {
  const [viewingRecipe, setViewingRecipe] = useState(null)
  const [filtersOpen,   setFiltersOpen]   = useState(false)
  const [cuisineFilter, setCuisineFilter] = useState('')
  const [sortBy,        setSortBy]        = useState(null)
  const [sortDir,       setSortDir]       = useState('asc')
  const [mealprepFilter, setMealprepFilter] = useState(false)

  const displayed = useMemo(() => {
    let list = [...recipes]
    if (cuisineFilter)  list = list.filter((r) => r.cuisine === cuisineFilter)
    if (mealprepFilter) list = list.filter((r) => r.mealprepIdeal === 'yes')
    if (sortBy) {
      const order = SORT_ORDERS[sortBy]
      list.sort((a, b) => {
        const av = order[a[sortBy]] ?? 0
        const bv = order[b[sortBy]] ?? 0
        return sortDir === 'asc' ? av - bv : bv - av
      })
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [recipes, cuisineFilter, mealprepFilter, sortBy, sortDir])

  function handleSort(field) {
    if (sortBy === field) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortBy(null); setSortDir('asc') }
    } else {
      setSortBy(field); setSortDir('asc')
    }
  }

  const hasFilters = cuisineFilter || mealprepFilter || sortBy

  return (
    <div className="cook-lib-browse">

      {/* Browse header */}
      <div className="cook-lib-browse__header">
        <button className="library-back-btn" onClick={onBack}>← Back</button>
        <h2 className="cook-lib-browse__title">Recipe Library</h2>
      </div>

      {/* Filter bar */}
      <div className="library-filter-bar">
        <button
          className={`filter-toggle-btn ${hasFilters ? 'filter-toggle-btn--active' : ''}`}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {hasFilters ? '● Filters' : 'Filters'} {filtersOpen ? '▲' : '▼'}
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
              <span className="filter-label">Sort:</span>
              {[
                { field: 'difficulty',      label: 'Difficulty' },
                { field: 'priceLevel',      label: 'Price' },
                { field: 'timeRequirement', label: 'Time' },
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
              {hasFilters && (
                <button
                  className="filter-chip filter-chip--clear"
                  onClick={() => { setCuisineFilter(''); setSortBy(null); setSortDir('asc'); setMealprepFilter(false) }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe list */}
      <div className="recipe-list">
        {displayed.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-card__info">
              <span className="recipe-card__name">{recipe.name}</span>
              <div className="recipe-card__badges">
                <span className="recipe-badge recipe-badge--cuisine">{recipe.cuisine}</span>
                <span className="recipe-badge recipe-badge--difficulty">{recipe.difficulty}</span>
                <span className="recipe-badge recipe-badge--time">{recipe.timeRequirement}</span>
              </div>
            </div>
            <button
              className="recipe-card__view-btn"
              onClick={() => setViewingRecipe(recipe)}
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* Cook modal in browse mode */}
      {viewingRecipe && (
        <CookRecipeModal
          recipe={viewingRecipe}
          preferences={preferences}
          ingredientsMap={ingredientsMap}
          allergyOmitIds={getAllergyOmitIds(viewingRecipe, ingredientsMap, preferences.allergyIngredients ?? [])}
          browseMode
          onCancel={() => setViewingRecipe(null)}
          onComplete={() => setViewingRecipe(null)}
        />
      )}
    </div>
  )
}

// ─── Main Cook Component ──────────────────────────────────────────────────────

export default function Cook() {
  const navigate     = useNavigate()
  const location     = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [preferences, setPreferencesState] = useState(getPreferences)

  // ── Cook prompt modal (from notification tap) ─────────────────────────────
  // Show when ?cookPrompt=1 is in the URL. Dismissed by cleaning the param.
  const showCookPrompt = searchParams.get('cookPrompt') === '1'

  function closeCookPrompt() {
    setSearchParams({}, { replace: true })
  }

  function handleCookPromptComplete(selectedIds) {
    // The selected recipes are already visible in the Cook page list.
    // Just close the prompt so the user can tap the recipe they want to start.
    closeCookPrompt()
  }

  const recipes     = useMemo(getRecipes, [])
  const ingredients = useMemo(getIngredients, [])

  const recipesMap     = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r])),     [recipes])
  const ingredientsMap = useMemo(() => Object.fromEntries(ingredients.map((i) => [i.id, i])), [ingredients])

  const planMode  = preferences.planMode ?? 'unplanned'
  const isPlanned = planMode === 'planned'
  const today     = new Date().getDay()

  const cookedIds = useMemo(
    () => new Set(preferences.cookedRecipeIds ?? []),
    [preferences.cookedRecipeIds]
  )

  // ── View state ────────────────────────────────────────────────────────────
  const [showAllWeek,       setShowAllWeek]       = useState(false)
  const [activeRecipeId,    setActiveRecipeId]    = useState(null)  // recipe open in modal
  const [activeMealShortcut,setActiveMealShortcut]= useState(false) // shortcut flag for open meal
  const [resumeId,          setResumeId]          = useState(null)  // last uncompleted → shows "Continue"
  const [browsingLib,       setBrowsingLib]        = useState(false)

  // ── Planned meals ─────────────────────────────────────────────────────────
  // All meals from the entire plan (deduped by recipeId)
  const allPlannedMeals = useMemo(() => {
    let raw
    if (isPlanned) {
      raw = Object.values(preferences.mealsByDay ?? {}).flat()
    } else {
      raw = [...(preferences.weekMeals ?? []), ...(preferences.weekMeals2 ?? [])]
    }
    // Deduplicate: same recipe may appear on multiple days; show once
    const seen = new Set()
    return raw.filter((m) => {
      if (seen.has(m.recipeId)) return false
      seen.add(m.recipeId)
      return true
    })
  }, [isPlanned, preferences])

  // Today's meals only (planned mode)
  const todaysMeals = useMemo(() => {
    if (!isPlanned) return []
    const raw = preferences.mealsByDay?.[today] ?? []
    const seen = new Set()
    return raw.filter((m) => {
      if (seen.has(m.recipeId)) return false
      seen.add(m.recipeId)
      return true
    })
  }, [isPlanned, preferences, today])

  // Which meals to show depending on toggle
  const displayedMeals = isPlanned && !showAllWeek ? todaysMeals : allPlannedMeals

  // Remove already-cooked recipes from the display
  const activeMeals = displayedMeals.filter((m) => !cookedIds.has(m.recipeId))

  const hasAnyPlanned  = allPlannedMeals.length > 0
  const allCurrentDone = activeMeals.length === 0 && displayedMeals.length > 0

  // ── Recipe actions ────────────────────────────────────────────────────────
  function openRecipe(id, useShortcut = false) {
    if (resumeId && resumeId !== id) setResumeId(null) // different recipe clears Continue
    setActiveRecipeId(id)
    setActiveMealShortcut(useShortcut)
  }

  function cancelRecipe() {
    setResumeId(activeRecipeId) // keep this recipe as "Continue"
    setActiveRecipeId(null)
  }

  function completeRecipe(id) {
    const updated = {
      ...preferences,
      cookedRecipeIds: [...(preferences.cookedRecipeIds ?? []), id],
    }
    setPreferencesState(updated)
    savePreferences(updated)
    setActiveRecipeId(null)
    setResumeId(null)
  }

  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferencesState(updated)
    savePreferences(updated)
  }

  const activeRecipe = activeRecipeId ? recipesMap[activeRecipeId] : null

  // ── Subtitle ──────────────────────────────────────────────────────────────
  const subtitle = isPlanned
    ? (showAllWeek ? 'All recipes this week' : `Today — ${DAYS_FULL[today]}`)
    : (planMode === 'mealprep' ? "This week's meal prep" : "This week's meals")

  return (
    <div className="page step-page cook-page">

      {/* ── Header ── */}
      <div className="step-page__header">
        <button className="step-back-btn" onClick={() => navigate('/')}>← Main Menu</button>
        <div className="step-page__header-row">
          <h1 className="step-page__title">🍳 Step 4 — Cook</h1>
          <MiniSettings preferences={preferences} onUpdate={handlePreferenceUpdate} hideShortcut />
        </div>
        <p className="step-page__subtitle">{subtitle}</p>
      </div>

      <div className="step-page__body">

        {browsingLib ? (

          /* ── Empty-state recipe library ── */
          <RecipeLibraryBrowse
            recipes={recipes}
            preferences={preferences}
            ingredientsMap={ingredientsMap}
            onBack={() => setBrowsingLib(false)}
          />

        ) : !hasAnyPlanned ? (

          /* ── No meals planned at all ── */
          <div className="cook-empty">
            <p className="cook-empty__msg">
              You don't have any recipes planned for this week.
            </p>
            <button
              className="btn btn--primary cook-empty__lib-btn"
              onClick={() => setBrowsingLib(true)}
            >
              View Recipe Library
            </button>
          </div>

        ) : (
          <>
            {/* ── Today / This Week toggle (planned mode only) ── */}
            {isPlanned && (
              <div className="cook-week-toggle">
                <button
                  className={`cook-week-btn ${!showAllWeek ? 'cook-week-btn--active' : ''}`}
                  onClick={() => setShowAllWeek(false)}
                >
                  Today
                </button>
                <button
                  className={`cook-week-btn ${showAllWeek ? 'cook-week-btn--active' : ''}`}
                  onClick={() => setShowAllWeek(true)}
                >
                  This Week
                </button>
              </div>
            )}

            {allCurrentDone ? (

              /* ── All meals for the current view done ── */
              <div className="cook-all-done">
                <span className="cook-all-done__icon">✓</span>
                <p className="cook-all-done__msg">
                  {!isPlanned || showAllWeek
                    ? "All meals for the week are complete!"
                    : "All meals for today are complete!"}
                </p>
                {isPlanned && !showAllWeek && (
                  <button
                    className="btn btn--ghost cook-all-done__btn"
                    onClick={() => setShowAllWeek(true)}
                  >
                    See all this week's meals
                  </button>
                )}
              </div>

            ) : (

              /* ── Active meal list ── */
              <ul className="cook-meal-list">
                {activeMeals.map((meal, idx) => {
                  const recipe           = recipesMap[meal.recipeId]
                  if (!recipe) return null
                  const isResume          = resumeId === meal.recipeId
                  const shortcutModeAllowed = (preferences.shortcutMode ?? 'off-visible') !== 'off-hidden'
                  const effectiveShortcut = (meal.useShortcut ?? false) || (shortcutModeAllowed && recipeNeedsAutoShortcut(
                    recipe, ingredientsMap,
                    preferences.dietaryModes ?? [],
                    preferences.allergyIngredients ?? [],
                  ))

                  return (
                    <li key={`${meal.recipeId}_${idx}`} className="cook-meal-card">
                      <div className="cook-meal-card__info">
                        <span className="cook-meal-card__name">{recipe.name}</span>
                        {meal.sides?.length > 0 && (
                          <span className="cook-meal-card__sides">
                            + {meal.sides.map((id) => recipesMap[id]?.name ?? id).join(', ')}
                          </span>
                        )}
                        <div className="cook-meal-card__badges">
                          {effectiveShortcut && (
                            <span className="recipe-badge recipe-badge--shortcut">⚡ Shortcut</span>
                          )}
                          <span className="recipe-badge recipe-badge--difficulty">{recipe.difficulty}</span>
                          <span className="recipe-badge recipe-badge--time">{recipe.timeRequirement}</span>
                        </div>
                      </div>
                      <button
                        className={`cook-meal-card__btn ${isResume ? 'cook-meal-card__btn--resume' : ''}`}
                        onClick={() => openRecipe(meal.recipeId, effectiveShortcut)}
                      >
                        {isResume ? 'Continue' : 'Cook'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {/* ── Cook recipe modal ── */}
      {activeRecipe && (
        <CookRecipeModal
          recipe={activeRecipe}
          preferences={preferences}
          ingredientsMap={ingredientsMap}
          allergyOmitIds={getAllergyOmitIds(activeRecipe, ingredientsMap, preferences.allergyIngredients ?? [])}
          initialShortcut={activeMealShortcut}
          browseMode={false}
          onCancel={cancelRecipe}
          onComplete={() => completeRecipe(activeRecipeId)}
        />
      )}

      {/* ── Cook prompt modal (notification deep-link) ── */}
      {showCookPrompt && !activeRecipe && (
        <CookPromptModal
          preferences={preferences}
          recipesMap={recipesMap}
          onComplete={handleCookPromptComplete}
          onDismiss={closeCookPrompt}
        />
      )}

      <StepNav currentPath={location.pathname} preferences={preferences} />
    </div>
  )
}
