import React, { useState, useMemo } from 'react'
import { scheduleNotification } from './notificationService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function fmtHours(h) {
  if (h === Math.floor(h)) return `${h}`
  const mins = Math.round((h % 1) * 60)
  const hrs  = Math.floor(h)
  if (hrs === 0) return `${mins} min`
  return `${hrs} hr ${mins} min`
}

// ─── Page 1: Recipe Selector ──────────────────────────────────────────────────

function RecipeSelector({ allMeals, todaysMeals, recipesMap, startInPlannedView, onContinue, onDismiss }) {
  const [isPlannedView, setIsPlannedView] = useState(startInPlannedView)

  // Pre-select today's meals in planned view, nothing in unplanned view
  const [selected, setSelected] = useState(
    () => new Set(startInPlannedView ? todaysMeals.map((m) => m.recipeId) : [])
  )

  const displayedMeals = isPlannedView ? todaysMeals : allMeals

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSwitchToAll() {
    setIsPlannedView(false)
    setSelected(new Set())
  }

  return (
    <div className="cook-prompt-page">
      <h2 className="cook-prompt__title">
        {isPlannedView ? "Ready to Cook Today?" : "What are you cooking today?"}
      </h2>
      <p className="cook-prompt__desc">
        {isPlannedView
          ? "These meals are planned for today. Select the ones you'll be making."
          : "Select the recipe(s) from this week that you'd like to cook today."}
      </p>

      {displayedMeals.length === 0 ? (
        <p className="cook-prompt__empty">
          {isPlannedView
            ? "No meals planned for today."
            : "No uncompleted recipes this week."}
        </p>
      ) : (
        <ul className="cook-prompt-list">
          {displayedMeals.map((meal) => {
            const recipe     = recipesMap[meal.recipeId]
            if (!recipe) return null
            const isSelected = selected.has(meal.recipeId)
            return (
              <li
                key={meal.recipeId}
                className={`cook-prompt-item ${isSelected ? 'cook-prompt-item--selected' : ''}`}
                onClick={() => toggle(meal.recipeId)}
              >
                <span className={`cook-prompt-check ${isSelected ? 'cook-prompt-check--on' : ''}`}>
                  {isSelected ? '✓' : ''}
                </span>
                <div className="cook-prompt-item__info">
                  <span className="cook-prompt-item__name">{recipe.name}</span>
                  <div className="cook-prompt-item__badges">
                    <span className="recipe-badge recipe-badge--difficulty">{recipe.difficulty}</span>
                    <span className="recipe-badge recipe-badge--time">{recipe.timeRequirement}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {isPlannedView && (
        <button className="cook-prompt__switch-btn" onClick={handleSwitchToAll}>
          Make Something Else
        </button>
      )}

      <div className="cook-prompt__actions">
        <button className="btn btn--ghost" onClick={onDismiss}>
          Nothing Today
        </button>
        <button
          className="btn btn--primary"
          disabled={selected.size === 0}
          onClick={() => onContinue([...selected])}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Page 2: Thaw Reminder ────────────────────────────────────────────────────

function ThawReminder({ onContinue, onBack }) {
  const [choice, setChoice] = useState(null) // 'none' | 'now' | 'remind'
  const [hours,  setHours]  = useState('')

  const canContinue =
    choice === 'none' ||
    choice === 'now'  ||
    (choice === 'remind' && parseFloat(hours) > 0)

  function handleContinue() {
    if (choice === 'remind') {
      const h = parseFloat(hours)
      if (!isNaN(h) && h > 0) {
        scheduleNotification({
          id:          'thaw-reminder',
          targetTime:  Date.now() + h * 3600 * 1000,
          title:       'Time to Thaw! 🧊',
          body:        "Don't forget to take your ingredients out to thaw before cooking.",
          data:        { url: '/cook' },
        })
      }
    }
    onContinue()
  }

  return (
    <div className="cook-prompt-page">
      <h2 className="cook-prompt__title">Ingredients to Thaw?</h2>
      <p className="cook-prompt__desc">
        Do you have any ingredients that need to be thawed or brought to room temperature before cooking?
      </p>

      <div className="cook-prompt-options">
        <button
          className={`cook-prompt-option ${choice === 'none' ? 'cook-prompt-option--selected' : ''}`}
          onClick={() => setChoice('none')}
        >
          No ingredients to thaw
        </button>

        <button
          className={`cook-prompt-option ${choice === 'now' ? 'cook-prompt-option--selected' : ''}`}
          onClick={() => setChoice('now')}
        >
          Yes, I'll thaw them now
        </button>

        <div
          className={`cook-prompt-option cook-prompt-option--input ${choice === 'remind' ? 'cook-prompt-option--selected' : ''}`}
          onClick={() => setChoice('remind')}
        >
          <span>Yes, remind me to thaw in</span>
          <input
            type="number"
            className="cook-prompt-hours"
            value={hours}
            min="0.25"
            step="0.25"
            placeholder="?"
            onClick={(e) => { e.stopPropagation(); setChoice('remind') }}
            onChange={(e) => { setHours(e.target.value); setChoice('remind') }}
          />
          <span>hours</span>
        </div>
      </div>

      <div className="cook-prompt__actions">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Page 3: Recipe Time Reminder (conditional) ───────────────────────────────

function RecipeTimeReminder({ timings, recipeName, onContinue, onBack }) {
  // Group by type and sum hours
  const groups = useMemo(() => {
    const map = {}
    timings.forEach((t) => {
      if (!map[t.type]) map[t.type] = { type: t.type, hours: 0 }
      map[t.type].hours += t.hours
    })
    return Object.values(map)
  }, [timings])

  const [groupIdx, setGroupIdx] = useState(0)
  const [choice,   setChoice]   = useState(null) // 'now' | 'remind'
  const [hours,    setHours]    = useState('')

  const current     = groups[groupIdx]
  const isLastGroup = groupIdx === groups.length - 1

  const canContinue = choice === 'now' || (choice === 'remind' && parseFloat(hours) > 0)

  function handleContinue() {
    if (choice === 'remind') {
      const h = parseFloat(hours)
      if (!isNaN(h) && h > 0) {
        scheduleNotification({
          id:         `recipe-time-${current.type}`,
          targetTime: Date.now() + h * 3600 * 1000,
          title:      `Time to Start ${capitalize(current.type)}! ⏱`,
          body:       `It's time to start the ${current.type} step${recipeName ? ` for ${recipeName}` : ''}.`,
          data:       { url: '/cook' },
        })
      }
    }

    if (!isLastGroup) {
      setGroupIdx((i) => i + 1)
      setChoice(null)
      setHours('')
    } else {
      onContinue()
    }
  }

  const totalHoursLabel = fmtHours(current.hours)

  return (
    <div className="cook-prompt-page">
      <h2 className="cook-prompt__title">Time-Sensitive Step</h2>
      <p className="cook-prompt__desc">
        This recipe requires{' '}
        <strong>{totalHoursLabel} of {current.type} time</strong>.
        When would you like to start that process?
      </p>

      <div className="cook-prompt-options">
        <button
          className={`cook-prompt-option ${choice === 'now' ? 'cook-prompt-option--selected' : ''}`}
          onClick={() => setChoice('now')}
        >
          I'll start it now
        </button>

        <div
          className={`cook-prompt-option cook-prompt-option--input ${choice === 'remind' ? 'cook-prompt-option--selected' : ''}`}
          onClick={() => setChoice('remind')}
        >
          <span>Remind me in</span>
          <input
            type="number"
            className="cook-prompt-hours"
            value={hours}
            min="0.25"
            step="0.25"
            placeholder="?"
            onClick={(e) => { e.stopPropagation(); setChoice('remind') }}
            onChange={(e) => { setHours(e.target.value); setChoice('remind') }}
          />
          <span>hours</span>
        </div>
      </div>

      <div className="cook-prompt__actions">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {isLastGroup ? 'Done ✓' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({ page, hasTimePage }) {
  const pages = ['select', 'thaw', ...(hasTimePage ? ['time'] : [])]
  return (
    <div className="cook-prompt__progress">
      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && <div className="cook-prompt__progress-line" />}
          <div
            className={[
              'cook-prompt__progress-dot',
              page === p ? 'cook-prompt__progress-dot--active' : '',
              pages.indexOf(page) > i ? 'cook-prompt__progress-dot--done' : '',
            ].join(' ')}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

/**
 * Multi-page cook prompt shown when the user arrives via a cook notification.
 *
 * Props:
 *   preferences  – current user preferences object
 *   recipesMap   – { [id]: recipe } lookup
 *   onComplete   – (selectedRecipeIds: string[]) => void  – called when flow is done
 *   onDismiss    – () => void  – user chose "Nothing Today" or pressed ✕
 */
export default function CookPromptModal({ preferences, recipesMap, onComplete, onDismiss }) {
  const planMode      = preferences.planMode ?? 'unplanned'
  const isPlannedMode = planMode === 'planned'
  const todayDow      = new Date().getDay()
  const cooked        = useMemo(
    () => new Set(preferences.cookedRecipeIds ?? []),
    [preferences.cookedRecipeIds]
  )

  // All uncompleted week meals (deduplicated by recipeId)
  const allMeals = useMemo(() => {
    let raw
    if (isPlannedMode) {
      raw = Object.values(preferences.mealsByDay ?? {}).flat()
    } else {
      raw = [...(preferences.weekMeals ?? []), ...(preferences.weekMeals2 ?? [])]
    }
    const seen = new Set()
    return raw.filter((m) => {
      if (cooked.has(m.recipeId) || seen.has(m.recipeId)) return false
      seen.add(m.recipeId)
      return true
    })
  }, [isPlannedMode, preferences, cooked])

  // Today's planned meals only (planned mode)
  const todaysMeals = useMemo(() => {
    if (!isPlannedMode) return []
    const raw  = preferences.mealsByDay?.[todayDow] ?? []
    const seen = new Set()
    return raw.filter((m) => {
      if (cooked.has(m.recipeId) || seen.has(m.recipeId)) return false
      seen.add(m.recipeId)
      return true
    })
  }, [isPlannedMode, preferences, todayDow, cooked])

  // Start in planned view if user is in planned mode and has today's meals
  const startInPlannedView = isPlannedMode && todaysMeals.length > 0

  const [page,        setPage]        = useState('select')
  const [selectedIds, setSelectedIds] = useState([])

  // Gather special timings for whatever the user selected
  const specialTimings = useMemo(
    () => selectedIds.flatMap((id) => recipesMap[id]?.specialTimings ?? []),
    [selectedIds, recipesMap]
  )

  const mainRecipeName =
    selectedIds.length === 1 ? (recipesMap[selectedIds[0]]?.name ?? null) : null

  function handleSelectContinue(ids) {
    setSelectedIds(ids)
    setPage('thaw')
  }

  function handleThawContinue() {
    if (specialTimings.length > 0) {
      setPage('time')
    } else {
      onComplete(selectedIds)
    }
  }

  function handleTimeContinue() {
    onComplete(selectedIds)
  }

  return (
    <div className="modal-overlay" onClick={page === 'select' ? onDismiss : undefined}>
      <div
        className="modal-panel cook-prompt-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header bar ── */}
        <div className="cook-prompt__header">
          <ProgressDots page={page} hasTimePage={specialTimings.length > 0 || page === 'time'} />
          <button
            className="modal-close-btn modal-close-btn--icon"
            onClick={onDismiss}
            title="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* ── Pages ── */}
        {page === 'select' && (
          <RecipeSelector
            allMeals={allMeals}
            todaysMeals={todaysMeals}
            recipesMap={recipesMap}
            startInPlannedView={startInPlannedView}
            onContinue={handleSelectContinue}
            onDismiss={onDismiss}
          />
        )}

        {page === 'thaw' && (
          <ThawReminder
            onContinue={handleThawContinue}
            onBack={() => setPage('select')}
          />
        )}

        {page === 'time' && (
          <RecipeTimeReminder
            timings={specialTimings}
            recipeName={mainRecipeName}
            onContinue={handleTimeContinue}
            onBack={() => setPage('thaw')}
          />
        )}
      </div>
    </div>
  )
}
