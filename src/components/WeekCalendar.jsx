import React from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// mealsByDay values may be:
//   - an array of strings (legacy)
//   - an array of { recipeId, sides } objects (planned mode)
// Pass recipesMap to resolve recipeId → display name.
export default function WeekCalendar({ shopDay = null, mealsByDay = {}, recipesMap = {} }) {
  const today      = new Date()
  const todayIndex = today.getDay()

  return (
    <div className="week-calendar">
      {DAYS.map((day, i) => {
        const isToday   = i === todayIndex
        const isShopDay = i === shopDay
        const rawMeals  = mealsByDay[i] || []

        // Normalise to display strings
        const mealNames = rawMeals.map((m) =>
          typeof m === 'string' ? m : (recipesMap[m.recipeId]?.name ?? m.recipeId)
        )

        return (
          <div
            key={day}
            className={[
              'calendar-day',
              isToday   ? 'calendar-day--today' : '',
              isShopDay ? 'calendar-day--shop'  : '',
            ].join(' ')}
          >
            <span className="calendar-day__label">{day}</span>
            {isShopDay && (
              <span className="calendar-day__badge calendar-day__badge--shop">🛒</span>
            )}
            <div className="calendar-day__meals">
              {mealNames.length > 0
                ? mealNames.map((name, idx) => (
                    <span key={idx} className="calendar-day__meal">{name}</span>
                  ))
                : <span className="calendar-day__empty">—</span>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
