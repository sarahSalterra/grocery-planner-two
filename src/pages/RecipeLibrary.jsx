import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRecipes } from '../db/recipesDB'
import { getIngredients } from '../db/ingredientsDB'
import { getPreferences } from '../db/preferencesDB'
import { CUISINES, DISH_TYPES } from '../db/data/filterOptions'
import { isRecipeAllergyExcluded } from '../utils/dietaryUtils'

// ─── Badge System ──────────────────────────────────────────────────────────────
// Maps each user priority to the recipe field and display type for its badge.
// "low-waste" has no badge; returns null to be skipped.

const PRIORITY_TO_BADGE = {
  'cheapest':    (r) => r.priceLevel      ? { label: r.priceLevel,      type: 'price'      } : null,
  'quickest':    (r) => r.timeRequirement ? { label: r.timeRequirement, type: 'time'       } : null,
  'easiest':     (r) => r.difficulty      ? { label: r.difficulty,      type: 'difficulty' } : null,
  'exploration': (r) => r.cuisine         ? { label: r.cuisine,         type: 'cuisine'    } : null,
  'frequency':   (r) => r.mealprepIdeal === 'yes' ? { label: 'Meal Prep ✓', type: 'mealprep' } : null,
  'low-waste':   ()  => null,
}

// ─── Sort Order Maps ───────────────────────────────────────────────────────────

const SORT_ORDERS = {
  difficulty:      { easy: 0, moderate: 1, difficult: 2 },
  priceLevel:      { cheap: 0, mid: 1, expensive: 2 },
  timeRequirement: { short: 0, medium: 1, long: 2 },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecipeLibrary() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'customize'
  const isCustomize = mode === 'customize'

  const preferences    = useMemo(getPreferences, [])
  const [recipes, setRecipes] = useState(getRecipes)
  const ingredients    = useMemo(getIngredients, [])
  const ingredientsMap = useMemo(() => Object.fromEntries(ingredients.map((i) => [i.id, i])), [ingredients])
  const allergyList    = preferences.allergyIngredients ?? []
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Filter state ─────────────────────────────────────────────────────────
  const [cuisineFilter, setCuisineFilter]   = useState('')
  const [dishTypeFilter, setDishTypeFilter] = useState('')
  const [sortBy, setSortBy]                 = useState(null)
  const [sortDir, setSortDir]               = useState('asc')
  const [mealprepFilter, setMealprepFilter] = useState(false)
  const [multiTaskFilter, setMultiTaskFilter] = useState(false)

  // ── Badge priorities ──────────────────────────────────────────────────────
  // Take top-3 from prioritiesRanked, skip low-waste
  const badgePriorities = useMemo(() => {
    const ranked = preferences.prioritiesRanked ?? []
    return ranked.filter((p) => p !== 'low-waste').slice(0, 3)
  }, [preferences.prioritiesRanked])

  function getBadges(recipe) {
    const badges = []
    for (const priority of badgePriorities) {
      const badge = PRIORITY_TO_BADGE[priority]?.(recipe)
      if (badge) badges.push(badge)
      if (badges.length >= 3) break
    }
    return badges
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...recipes]
    if (allergyList.length) {
      list = list.filter((r) => !isRecipeAllergyExcluded(r, ingredientsMap, allergyList))
    }
    if (cuisineFilter)   list = list.filter((r) => r.cuisine === cuisineFilter)
    if (dishTypeFilter)  list = list.filter((r) => r.dishType === dishTypeFilter)
    if (mealprepFilter)  list = list.filter((r) => r.mealprepIdeal === 'yes')
    if (multiTaskFilter) list = list.filter((r) => r.multiTasking !== 'unlikely')
    if (sortBy) {
      const order = SORT_ORDERS[sortBy]
      list.sort((a, b) => {
        const av = order[a[sortBy]] ?? 0
        const bv = order[b[sortBy]] ?? 0
        return sortDir === 'asc' ? av - bv : bv - av
      })
    }
    return list
  }, [recipes, cuisineFilter, dishTypeFilter, mealprepFilter, multiTaskFilter, sortBy, sortDir])

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

  function sortLabel(field, label) {
    if (sortBy !== field) return label
    return `${label} ${sortDir === 'asc' ? '↑' : '↓'}`
  }

  const hasActiveFilters = cuisineFilter || dishTypeFilter || mealprepFilter || multiTaskFilter || sortBy

  return (
    <div className="page library-page">

      {/* Header */}
      <div className="library-header">
        <button className="library-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="library-header__title">Recipes</h1>
        {isCustomize && (
          <button
            className="btn btn--primary library-add-btn"
            onClick={() => navigate('/recipe-library/new')}
          >
            + Add
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="library-filter-bar">
        <button
          className={`filter-toggle-btn ${filtersOpen ? 'filter-toggle-btn--open' : ''} ${hasActiveFilters ? 'filter-toggle-btn--active' : ''}`}
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
              <select
                className="filter-select"
                value={dishTypeFilter}
                onChange={(e) => setDishTypeFilter(e.target.value)}
              >
                <option value="">All Dish Types</option>
                {DISH_TYPES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <span className="filter-label">Sort by:</span>
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
                  {sortLabel(field, label)}
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
                    setDishTypeFilter('')
                    setSortBy(null)
                    setSortDir('asc')
                    setMealprepFilter(false)
                    setMultiTaskFilter(false)
                  }}
                >
                  Clear All
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
              {isCustomize && (
                <button
                  className="recipe-card__edit-btn"
                  onClick={() => navigate(`/recipe-library/${recipe.id}/edit`)}
                >
                  Edit
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
