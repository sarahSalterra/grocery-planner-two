// ─── Grocery Planner Notification Service ─────────────────────────────────────
//
// Handles permission requests, showing notifications via the service worker,
// user-scheduled reminders ("remind me in X hours"), and daily automatic
// checks for cook-morning, shopping-day, and shop-eve notifications.
//
// All scheduled notifications are persisted in localStorage so they survive
// page refreshes. An in-session setTimeout is also set so notifications fire
// even if the user stays on the page for hours.

const SCHEDULED_KEY  = 'gp_scheduled_notifications'
const SENT_TODAY_KEY = 'gp_notifications_sent_today'

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied')  return 'denied'
  const result = await Notification.requestPermission()
  return result // 'granted' | 'denied' | 'default'
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'granted' | 'denied' | 'default'
}

// ─── Core: show a notification via the service worker registration ─────────────

async function showNotification(title, options = {}) {
  if (getNotificationPermission() !== 'granted') return
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, { icon: '/favicon.ico', ...options })
    } else {
      // Fallback for browsers without service worker support
      new Notification(title, options) // eslint-disable-line no-new
    }
  } catch (err) {
    console.warn('[Notifications] showNotification failed:', err)
  }
}

// ─── Scheduled notifications (user reminders: "remind me in X hours") ─────────

function _getScheduled() {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULED_KEY) ?? '[]')
  } catch { return [] }
}

function _saveScheduled(list) {
  try { localStorage.setItem(SCHEDULED_KEY, JSON.stringify(list)) } catch {}
}

async function _fireAndRemoveScheduled(id) {
  const list  = _getScheduled()
  const notif = list.find((n) => n.id === id)
  if (!notif) return // already fired or cancelled
  _saveScheduled(list.filter((n) => n.id !== id))
  await showNotification(notif.title, {
    body:             notif.body,
    icon:             notif.icon ?? '/favicon.ico',
    data:             notif.data ?? {},
    requireInteraction: false,
    tag:              notif.id,
  })
}

/**
 * Schedule a one-shot notification.
 * @param {{ id: string, targetTime: number, title: string, body: string, data?: object }} params
 */
export function scheduleNotification({ id, targetTime, title, body, data = {} }) {
  const list = _getScheduled().filter((n) => n.id !== id)
  list.push({ id, targetTime, title, body, data })
  _saveScheduled(list)

  const delay = targetTime - Date.now()
  if (delay > 0) {
    setTimeout(() => _fireAndRemoveScheduled(id), delay)
  } else {
    // Already due — fire immediately
    _fireAndRemoveScheduled(id)
  }
}

export function cancelScheduledNotification(id) {
  _saveScheduled(_getScheduled().filter((n) => n.id !== id))
}

/**
 * Call on app load / visibility-change to fire any past-due scheduled
 * notifications and re-register in-session timeouts for upcoming ones.
 */
export function checkScheduledNotifications() {
  const now  = Date.now()
  const list = _getScheduled()
  const remaining = []

  for (const notif of list) {
    if (notif.targetTime <= now) {
      _fireAndRemoveScheduled(notif.id)
    } else {
      remaining.push(notif)
      const delay = notif.targetTime - now
      setTimeout(() => _fireAndRemoveScheduled(notif.id), delay)
    }
  }
  _saveScheduled(remaining)
}

// ─── Advance reminders for passive recipe phases ──────────────────────────────
//
// When a recipe is saved to a planned day, call scheduleRecipeAdvanceReminders()
// with the recipe and the expected start-of-cooking timestamp. For each passive
// phase (rise, chill, marinate, rest) that is ≥ 15 minutes, a notification is
// scheduled to fire at the moment the user needs to begin that phase.
//
// Example — cinnamon rolls planned for 9 AM:
//   totalTime = 50 + 150 + 50 + 25 = 275 min
//   First rise starts at 275 min before 9 AM → notify at ~4:25 AM (start dough)
//   Second rise starts at 50+25 = 75 min before 9 AM → notify at ~7:45 AM
//
// Call cancelRecipeAdvanceReminders() when a recipe is removed from the plan.

const PASSIVE_REMINDER_PHASES = new Set(['rise', 'chill', 'marinate', 'rest'])

function _formatPhaseMinutes(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

/**
 * Schedule advance-start notifications for all passive phases in a recipe.
 * @param {object} recipe           - Recipe object with timeToComplete array
 * @param {number} plannedCookTime  - Unix timestamp (ms) for planned cook start
 */
export function scheduleRecipeAdvanceReminders(recipe, plannedCookTime) {
  const phases = recipe.timeToComplete
  if (!Array.isArray(phases) || !plannedCookTime) return

  const totalMinutes = phases.reduce((s, p) => s + (p.minutes ?? 0), 0)
  let minutesFromStart = 0

  for (const phase of phases) {
    if (PASSIVE_REMINDER_PHASES.has(phase.phase) && (phase.minutes ?? 0) >= 15) {
      const minutesRemaining = totalMinutes - minutesFromStart
      const triggerTime = plannedCookTime - minutesRemaining * 60 * 1000
      const phaseLabel  = phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)
      const id = `recipe-advance-${recipe.id}-${phase.phase}-${minutesFromStart}`

      scheduleNotification({
        id,
        targetTime: triggerTime,
        title: `Start ${phaseLabel} — ${recipe.name}`,
        body:  `You need ${_formatPhaseMinutes(phase.minutes)} of ${phase.phase} time before cooking. Start now!`,
        data:  { recipeId: recipe.id, phase: phase.phase, url: '/cook' },
      })
    }
    minutesFromStart += phase.minutes ?? 0
  }
}

/**
 * Cancel all advance-start notifications that were scheduled for a recipe.
 * Call this when a recipe is removed from a planned day.
 * @param {string} recipeId
 * @param {Array}  timeToComplete - The recipe's timeToComplete array
 */
export function cancelRecipeAdvanceReminders(recipeId, timeToComplete) {
  if (!Array.isArray(timeToComplete)) return
  let minutesFromStart = 0
  for (const phase of timeToComplete) {
    if (PASSIVE_REMINDER_PHASES.has(phase.phase) && (phase.minutes ?? 0) >= 15) {
      cancelScheduledNotification(`recipe-advance-${recipeId}-${phase.phase}-${minutesFromStart}`)
    }
    minutesFromStart += phase.minutes ?? 0
  }
}

// ─── Daily notification state ─────────────────────────────────────────────────

function _getSentToday() {
  try {
    const raw   = JSON.parse(localStorage.getItem(SENT_TODAY_KEY) ?? '{}')
    const today = new Date().toDateString()
    if (raw.date !== today) return { date: today }
    return raw
  } catch { return { date: new Date().toDateString() } }
}

function _markSentToday(key) {
  const sent = _getSentToday()
  sent[key] = true
  try { localStorage.setItem(SENT_TODAY_KEY, JSON.stringify(sent)) } catch {}
}

// ─── Daily notification helpers ────────────────────────────────────────────────

function _hasUncookedMeals(preferences) {
  const cooked   = new Set(preferences.cookedRecipeIds ?? [])
  const planMode = preferences.planMode ?? 'unplanned'
  if (planMode === 'planned') {
    return Object.values(preferences.mealsByDay ?? {}).some(
      (dayMeals) => dayMeals.some((m) => !cooked.has(m.recipeId))
    )
  }
  return [...(preferences.weekMeals ?? []), ...(preferences.weekMeals2 ?? [])].some(
    (m) => !cooked.has(m.recipeId)
  )
}

function _hasMealsPlanned(preferences) {
  const planMode = preferences.planMode ?? 'unplanned'
  if (planMode === 'planned') {
    return Object.values(preferences.mealsByDay ?? {}).some((d) => d.length > 0)
  }
  return (preferences.weekMeals?.length ?? 0) + (preferences.weekMeals2?.length ?? 0) > 0
}

async function _fireCookMorningNotification(preferences, todayDow) {
  const planMode  = preferences.planMode ?? 'unplanned'
  const isPlanned = planMode === 'planned'
  const cooked    = new Set(preferences.cookedRecipeIds ?? [])

  let title = 'Cook Something Today? 🍳'
  let body  = 'You have recipes planned for this week. Want to make something today?'
  let url   = '/cook?cookPrompt=1'

  if (isPlanned) {
    const todayMeals = (preferences.mealsByDay?.[todayDow] ?? []).filter(
      (m) => !cooked.has(m.recipeId)
    )
    if (todayMeals.length > 0) {
      title = 'Ready to Cook Today? 🍳'
      body  = 'You have meals planned for today. Ready to get started?'
      url   = '/cook?cookPrompt=1&planned=1'
    }
  }

  await showNotification(title, {
    body,
    data: { url },
    requireInteraction: false,
    tag: 'cook-morning',
  })
}

async function _fireShopDayNotification(preferences) {
  const hasPlanned = _hasMealsPlanned(preferences)
  await showNotification("It's Shopping Day! 🛒", {
    body: hasPlanned
      ? "Your meals are already planned. Don't forget to check your restock list!"
      : 'Time to plan your meals and build your grocery list.',
    data: {
      url: hasPlanned ? '/restock' : '/meal-planning',
      actions: {
        plan:    { url: '/meal-planning' },
        restock: { url: '/restock' },
      },
    },
    actions: [
      { action: 'plan',    title: hasPlanned ? '✓ Meal Planning' : '📋 Plan Meals' },
      { action: 'restock', title: '🏠 Restock List' },
    ],
    requireInteraction: true,
    tag: 'shop-day',
  })
}

async function _fireShopEveNotification(preferences) {
  const hasPlanned = _hasMealsPlanned(preferences)
  const body = hasPlanned
    ? "Tomorrow is shopping day! Your meals are planned — check your household inventory for anything that needs restocking."
    : "Tomorrow is shopping day! Time to plan your meals and check your household inventory."

  await showNotification('Shop Day Tomorrow 🛒', {
    body: preferences.showLowWaste
      ? body + " Check your kitchen for items to use up before you go."
      : body,
    data: {
      url: hasPlanned ? '/restock' : '/meal-planning',
      actions: {
        plan:    { url: '/meal-planning' },
        restock: { url: '/restock' },
        ...(preferences.showLowWaste ? { lowWaste: { url: '/low-waste' } } : {}),
      },
    },
    actions: [
      { action: 'plan',    title: hasPlanned ? '✓ Meal Planning' : '📋 Plan Meals' },
      { action: 'restock', title: '🏠 Check Inventory' },
      ...(preferences.showLowWaste ? [{ action: 'lowWaste', title: '🌿 Low Waste' }] : []),
    ],
    requireInteraction: true,
    tag: 'shop-eve',
  })
}

// ─── Biweekly parity check ────────────────────────────────────────────────────
//
// Returns true if today falls in a "shopping week" relative to shopCycleRef.
// Week 0 (the ref week), week 2, week 4, … are shopping weeks.
// Week 1, week 3, … are rest weeks.

function _isBiweeklyShopWeek(preferences) {
  const ref = preferences.shopCycleRef
  if (!ref) return false
  const refMs   = new Date(ref).setHours(0, 0, 0, 0)
  const todayMs = new Date().setHours(0, 0, 0, 0)
  const daysDiff  = Math.round((todayMs - refMs) / 86400000)
  const weeksDiff = Math.floor(daysDiff / 7)
  return weeksDiff % 2 === 0
}

// ─── Public: check and fire daily notifications ───────────────────────────────

/**
 * Run on app load and on visibility change.
 * Fires whichever daily notifications are due that haven't been sent today.
 *
 * Handles all three schedule modes:
 *   weekly       — fires on shopDay / eve of shopDay every week
 *   twice-weekly — fires on shopDay AND shopDay2 / their eves each week
 *   biweekly     — fires on shopDay / eve only on alternating weeks
 *                  (parity anchored by shopCycleRef, set when biweekly is configured)
 */
export async function checkDailyNotifications(preferences) {
  if (!preferences.notifications) return
  if (getNotificationPermission() !== 'granted') return

  const now          = new Date()
  const hour         = now.getHours()
  const todayDow     = now.getDay()       // 0 = Sunday
  const tmrwDow      = (todayDow + 1) % 7
  const shopSchedule = preferences.shopSchedule ?? 'weekly'
  const shopDay      = preferences.shopDay  ?? null
  const shopDay2     = preferences.shopDay2 ?? null
  const sent         = _getSentToday()

  // For biweekly, determine whether this week is a shopping week
  const biweeklyActive = shopSchedule !== 'biweekly' || _isBiweeklyShopWeek(preferences)

  // Collect which named shop-day slots are "today" or "tomorrow"
  const isShopToday = (
    (shopDay  !== null && todayDow === shopDay  && (shopSchedule !== 'biweekly' || biweeklyActive)) ||
    (shopDay2 !== null && todayDow === shopDay2 && shopSchedule === 'twice-weekly')
  )
  const isShopTomorrow = (
    (shopDay  !== null && tmrwDow === shopDay  && (shopSchedule !== 'biweekly' || biweeklyActive)) ||
    (shopDay2 !== null && tmrwDow === shopDay2 && shopSchedule === 'twice-weekly')
  )

  // ── Cook morning notification: 8 AM+, not on a shop day, has uncooked meals ─
  if (hour >= 8 && !sent.cookMorning && !isShopToday) {
    if (_hasUncookedMeals(preferences)) {
      _markSentToday('cookMorning')
      await _fireCookMorningNotification(preferences, todayDow)
    }
  }

  // ── Shopping day morning notification: 8 AM+ on a shop day ──────────────
  if (isShopToday && hour >= 8 && !sent.shopDay) {
    _markSentToday('shopDay')
    await _fireShopDayNotification(preferences)
  }

  // ── Evening before a shopping day: 7 PM+ ─────────────────────────────────
  // Fires for ALL users with notifications enabled (not gated on showLowWaste).
  // Reminds to plan meals + check inventory; adds low-waste hint when relevant.
  if (isShopTomorrow && hour >= 19 && !sent.shopEve) {
    _markSentToday('shopEve')
    await _fireShopEveNotification(preferences)
  }
}
