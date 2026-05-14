import React, { useState, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getIngredients } from '../db/ingredientsDB'
import { getRecipes } from '../db/recipesDB'
import { getPreferences, savePreferences } from '../db/preferencesDB'
import StepNav from '../components/StepNav'
import MiniSettings from '../components/MiniSettings'
import { isRecipeAllergyExcluded } from '../utils/dietaryUtils'

const MAX_SUGGESTIONS = 8

// Mirrors the badge logic in MealPlanning so the two UIs stay consistent
const PRIORITY_TO_BADGE = {
  cheapest:    (r) => r.priceLevel        ? { label: r.priceLevel,      type: 'price'      } : null,
  quickest:    (r) => r.timeRequirement   ? { label: r.timeRequirement, type: 'time'       } : null,
  easiest:     (r) => r.difficulty        ? { label: r.difficulty,      type: 'difficulty' } : null,
  exploration: (r) => r.cuisine           ? { label: r.cuisine,         type: 'cuisine'    } : null,
  frequency:   (r) => r.mealprepIdeal === 'yes' ? { label: 'Meal Prep ✓', type: 'mealprep' } : null,
  'low-waste': ()  => null,
}

export default function LowWaste() {
  const navigate = useNavigate()
  const location = useLocation()

  const [preferences, setPreferences] = useState(getPreferences)
  const ingredients = useMemo(getIngredients, [])
  const recipes     = useMemo(getRecipes, [])

  // ── Search state ───────────────────────────────────────────────────────────
  const [query,                  setQuery]                  = useState('')
  const [selectedIngredients,    setSelectedIngredients]    = useState([]) // [{ id, name }]
  const [showSuggestions,        setShowSuggestions]        = useState(false)
  const [selectedRecipes,        setSelectedRecipes]        = useState(new Set()) // Set<recipeId>
  // 'have' = user has enough (excluded from grocery list); 'need' = user wants to restock
  const [ingredientAvailability, setIngredientAvailability] = useState({}) // { [ingredientId]: 'have'|'need' }
  const inputRef = useRef(null)

  function getAvailability(id) {
    return ingredientAvailability[id] ?? 'have'
  }

  function toggleAvailability(e, id) {
    e.stopPropagation()
    setIngredientAvailability((prev) => ({
      ...prev,
      [id]: prev[id] === 'need' ? 'have' : 'need',
    }))
  }

  // ── Autocomplete suggestions (fuzzy-ish: name contains query) ─────────────
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const already = new Set(selectedIngredients.map((i) => i.id))
    return ingredients
      .filter((ing) => ing.name.toLowerCase().includes(q) && !already.has(ing.id))
      .slice(0, MAX_SUGGESTIONS)
  }, [query, ingredients, selectedIngredients])

  // ── Recipes matching any selected ingredient ───────────────────────────────
  const selectedIngredientIds = useMemo(
    () => new Set(selectedIngredients.map((i) => i.id)),
    [selectedIngredients]
  )

  const ingredientsMap = useMemo(
    () => Object.fromEntries(ingredients.map((i) => [i.id, i])),
    [ingredients]
  )
  const allergyList = preferences.allergyIngredients ?? []

  const matchingRecipes = useMemo(() => {
    if (selectedIngredientIds.size === 0) return []
    return recipes.filter((recipe) => {
      if (allergyList.length && isRecipeAllergyExcluded(recipe, ingredientsMap, allergyList)) return false
      return (recipe.ingredients ?? []).some((ing) => selectedIngredientIds.has(ing.ingredientId))
    })
  }, [recipes, ingredientsMap, allergyList, selectedIngredientIds])

  // ── Priority badges (mirrors MealPlanning logic) ──────────────────────────
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

  // ── Actions ────────────────────────────────────────────────────────────────
  function selectIngredient(ing) {
    setSelectedIngredients((prev) => [...prev, ing])
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeIngredient(id) {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== id))
    // Drop selected recipes that would no longer match after removal
    const remaining = new Set(selectedIngredients.filter((i) => i.id !== id).map((i) => i.id))
    if (remaining.size === 0) {
      setSelectedRecipes(new Set())
      return
    }
    setSelectedRecipes((prev) => {
      const next = new Set()
      for (const rid of prev) {
        const recipe = recipes.find((r) => r.id === rid)
        if (recipe?.ingredients.some((ing) => remaining.has(ing.ingredientId))) {
          next.add(rid)
        }
      }
      return next
    })
  }

  function toggleRecipe(id) {
    setSelectedRecipes((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && suggestions.length > 0) selectIngredient(suggestions[0])
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  function handleContinue() {
    const meals = [...selectedRecipes].map((id) => ({ recipeId: id, sides: [] }))

    // Collect all use-up ingredient IDs referenced by the selected recipes
    const useUpIds = new Set()
    for (const recipeId of selectedRecipes) {
      const recipe = recipes.find((r) => r.id === recipeId)
      recipe?.ingredients
        .filter((ing) => selectedIngredientIds.has(ing.ingredientId))
        .forEach((ing) => useUpIds.add(ing.ingredientId))
    }

    // Sync checkedAvailableIngredients:
    //   'have' → ingredient is confirmed on hand, exclude from grocery list
    //   'need' → user wants to restock, ensure it appears in the grocery list
    const confirmed = new Set(preferences.checkedAvailableIngredients ?? [])
    for (const id of useUpIds) {
      if (getAvailability(id) === 'have') {
        confirmed.add(id)
      } else {
        confirmed.delete(id)
      }
    }

    const updated = {
      ...preferences,
      pendingMeals: meals,
      checkedAvailableIngredients: [...confirmed],
    }
    savePreferences(updated)
    navigate('/meal-planning')
  }

  function handlePreferenceUpdate(changes) {
    const updated = { ...preferences, ...changes }
    setPreferences(updated)
    savePreferences(updated)
  }

  const hasSearched   = selectedIngredients.length > 0
  const hasSelected   = selectedRecipes.size > 0

  return (
    <div className="page step-page low-waste-page">

      <div className="step-page__header">
        <button className="step-back-btn" onClick={() => navigate('/')}>← Main Menu</button>
        <div className="step-page__header-row">
          <h1 className="step-page__title">🌿 Use Up Ingredients</h1>
          <MiniSettings preferences={preferences} onUpdate={handlePreferenceUpdate} hideShortcut />
        </div>
        <p className="step-page__subtitle">
          Optional — find recipes using ingredients you already have on hand
        </p>
      </div>

      <div className="step-page__body">

        {/* ── Ingredient Search ── */}
        <section className="lw-search-section">
          <label className="lw-search-label">Add ingredients to search</label>

          {selectedIngredients.length > 0 && (
            <div className="lw-chips">
              {selectedIngredients.map((ing) => (
                <div key={ing.id} className="lw-chip">
                  <span className="lw-chip__name">{ing.name}</span>
                  <button
                    className="lw-chip__remove"
                    onClick={() => removeIngredient(ing.id)}
                    title={`Remove ${ing.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="lw-input-wrap">
            <input
              ref={inputRef}
              className="lw-input"
              type="text"
              placeholder="Type an ingredient…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              autoComplete="off"
            />
            {query && (
              <button
                className="lw-input-clear"
                onMouseDown={(e) => { e.preventDefault(); setQuery(''); inputRef.current?.focus() }}
                title="Clear"
              >
                ✕
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="lw-suggestions" role="listbox">
                {suggestions.map((ing) => (
                  <li
                    key={ing.id}
                    className="lw-suggestion"
                    role="option"
                    onMouseDown={() => selectIngredient(ing)}
                  >
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {query.trim() && suggestions.length === 0 && (
            <p className="lw-no-suggestions">No matching ingredients found</p>
          )}
        </section>

        {/* ── Matching Recipes ── */}
        {hasSearched && (
          <section className="lw-results-section">
            <div className="lw-results-header">
              <span className="lw-results-label">
                {matchingRecipes.length === 0
                  ? 'No recipes found — try different ingredients'
                  : `${matchingRecipes.length} recipe${matchingRecipes.length !== 1 ? 's' : ''} use these ingredients`}
              </span>
              {hasSelected && (
                <span className="lw-selected-count">{selectedRecipes.size} selected</span>
              )}
            </div>

            {matchingRecipes.length > 0 && (
              <ul className="lw-recipe-list">
                {matchingRecipes.map((recipe) => {
                  const isSelected = selectedRecipes.has(recipe.id)

                  const matchedIngredients = recipe.ingredients
                    .filter((ing) => selectedIngredientIds.has(ing.ingredientId))
                    .map((ing) => ({
                      id:       ing.ingredientId,
                      name:     selectedIngredients.find((si) => si.id === ing.ingredientId)?.name,
                      quantity: ing.quantity,
                      unit:     ing.unit,
                    }))
                    .filter((ing) => ing.name)

                  return (
                    <li
                      key={recipe.id}
                      className={`lw-recipe-card ${isSelected ? 'lw-recipe-card--selected' : ''}`}
                      onClick={() => toggleRecipe(recipe.id)}
                    >
                      <span className={`lw-recipe-check ${isSelected ? 'lw-recipe-check--on' : ''}`}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <div className="lw-recipe-info">
                        <span className="lw-recipe-name">{recipe.name}</span>

                        <ul className="lw-ing-list">
                          {matchedIngredients.map((ing) => {
                            const avail = getAvailability(ing.id)
                            const qtyLabel = [ing.quantity, ing.unit].filter(Boolean).join(' ')
                            return (
                              <li key={ing.id} className="lw-ing-row">
                                <span className="lw-ing-row__name">
                                  {ing.name}
                                  {qtyLabel && (
                                    <span className="lw-ing-row__qty"> — {qtyLabel}</span>
                                  )}
                                </span>
                                <button
                                  className={`lw-ing-toggle lw-ing-toggle--${avail}`}
                                  onClick={(e) => toggleAvailability(e, ing.id)}
                                  title={avail === 'have' ? 'Click if you need to buy more' : 'Click if you already have enough'}
                                >
                                  {avail === 'have' ? '✓ Have enough' : '+ Need more'}
                                </button>
                              </li>
                            )
                          })}
                        </ul>

                        <div className="lw-recipe-badges">
                          {recipe.dishType && (
                            <span className="recipe-badge recipe-badge--dish">{recipe.dishType}</span>
                          )}
                          {getBadges(recipe).map((b, i) => (
                            <span key={i} className={`recipe-badge recipe-badge--${b.type}`}>{b.label}</span>
                          ))}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {hasSelected && (
              <div className="lw-continue-bar">
                <span className="lw-continue-hint">
                  {selectedRecipes.size} recipe{selectedRecipes.size !== 1 ? 's' : ''} will be added to your week
                </span>
                <button className="btn btn--primary" onClick={handleContinue}>
                  Continue to Meal Planning →
                </button>
              </div>
            )}
          </section>
        )}

        {!hasSearched && (
          <div className="lw-empty-hint">
            <p>Start typing an ingredient above to find recipes that use it.</p>
            <p>You can add multiple ingredients to broaden your search.</p>
          </div>
        )}

      </div>

      <StepNav
        currentPath={location.pathname}
        preferences={preferences}
        onNext={handleContinue}
      />
    </div>
  )
}
