import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WeekCalendar from '../components/WeekCalendar'
import SettingsMenu from '../components/SettingsMenu'
import { getPreferences, savePreferences, revertPreferencesToDefaults } from '../db/preferencesDB'
import { getRecipes, revertRecipesToDefaults } from '../db/recipesDB'
import { revertIngredientsToDefaults } from '../db/ingredientsDB'
import { revertHouseholdGoodsToDefaults } from '../db/householdGoodsDB'

const MENU_ITEMS = [
  {
    id: 'lowWaste',
    step: null,
    label: 'Use Up Ingredients',
    description: 'Search recipes by what you already have',
    path: '/low-waste',
    optional: true,
    icon: '🌿',
  },
  {
    id: 'mealPlanning',
    step: 1,
    label: 'Meal Planning',
    description: 'Choose recipes and plan your week',
    path: '/meal-planning',
    icon: '📋',
  },
  {
    id: 'restock',
    step: 2,
    label: 'Restock List',
    description: 'Review household goods that need restocking',
    path: '/restock',
    icon: '🏠',
  },
  {
    id: 'shop',
    step: 3,
    label: 'Shop',
    description: 'View and check off your grocery list',
    path: '/shop',
    icon: '🛒',
  },
  {
    id: 'cook',
    step: 4,
    label: 'Cook',
    description: 'Step-by-step cooking guidance',
    path: '/cook',
    icon: '🍳',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState(getPreferences)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Re-read from localStorage on every mount so navigating back always shows
  // the latest meal plan data saved by other pages.
  useEffect(() => {
    setPreferences(getPreferences())
  }, [])

  const recipesMap = useMemo(() => {
    const list = getRecipes()
    return Object.fromEntries(list.map((r) => [r.id, r]))
  }, [])

  // Build the display data for WeekCalendar.
  // Planned mode: use mealsByDay (meals are assigned to specific days).
  // Unplanned/mealprep: distribute weekMeals across non-shop days in order
  // so the calendar gives a visual sense of what's planned this week.
  const calendarMealsByDay = useMemo(() => {
    if (preferences.planMode === 'planned') {
      return preferences.mealsByDay ?? {}
    }
    const meals = [
      ...(preferences.weekMeals  ?? []),
      ...(preferences.weekMeals2 ?? []),
    ]
    if (meals.length === 0) return {}

    const shopDay = preferences.shopDay ?? null
    const nonShopDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== shopDay)

    const result = {}
    meals.forEach((meal, i) => {
      const dayIdx = nonShopDays[i % nonShopDays.length]
      if (!result[dayIdx]) result[dayIdx] = []
      result[dayIdx].push(meal)
    })
    return result
  }, [preferences.planMode, preferences.mealsByDay, preferences.weekMeals, preferences.weekMeals2, preferences.shopDay])

  function handlePreferenceUpdate(changes) {
    // Ignore internal action keys — those trigger navigation handled elsewhere
    if (changes._action) {
      handleSettingsAction(changes._action)
      return
    }
    const updated = { ...preferences, ...changes }
    setPreferences(updated)
    savePreferences(updated)
  }

  function handleSettingsAction(action) {
    if (action === 'customizeRecipes')   navigate('/recipe-library?mode=customize')
    if (action === 'customizeInventory') navigate('/inventory-library?mode=customize')

    if (action === 'revertRecipes') {
      revertRecipesToDefaults()
      revertIngredientsToDefaults()
    }

    if (action === 'revertInventory') {
      revertHouseholdGoodsToDefaults()
    }

    if (action === 'revertPreferences') {
      revertPreferencesToDefaults()
      setPreferences(getPreferences())
    }

    if (action === 'revertAll') {
      revertRecipesToDefaults()
      revertIngredientsToDefaults()
      revertHouseholdGoodsToDefaults()
      revertPreferencesToDefaults()
      setPreferences(getPreferences())
    }
  }

  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.optional || preferences.showLowWaste
  )

  return (
    <div className="page home-page">
      <header className="home-header">
        <h1 className="home-header__title">Grocery Planner</h1>
        <button
          className="settings-trigger"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          ⚙
        </button>
      </header>

      <section className="home-calendar">
        <WeekCalendar
          shopDay={preferences.shopDay ?? null}
          mealsByDay={calendarMealsByDay}
          recipesMap={recipesMap}
        />
      </section>

      <nav className="home-menu">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`menu-card ${item.optional ? 'menu-card--optional' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-card__icon">{item.icon}</span>
            <div className="menu-card__text">
              <span className="menu-card__step">
                {item.step ? `Step ${item.step}` : 'Optional'}
              </span>
              <span className="menu-card__label">{item.label}</span>
              <span className="menu-card__desc">{item.description}</span>
            </div>
            <span className="menu-card__arrow">›</span>
          </button>
        ))}
      </nav>

      <SettingsMenu
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferences={preferences}
        onUpdate={handlePreferenceUpdate}
      />
    </div>
  )
}
