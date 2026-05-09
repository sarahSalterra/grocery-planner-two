import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Error Boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '32px 24px', maxWidth: 480, margin: '0 auto', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#c0392b', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: '#555', marginBottom: 20, lineHeight: 1.5 }}>
            An error occurred on this page. Your data is safe — try going back to the main menu.
          </p>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: 6, fontSize: '0.78rem', overflowX: 'auto', color: '#333', marginBottom: 20 }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{ background: '#4a7c59', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            ← Back to Main Menu
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import LowWaste from './pages/LowWaste'
import MealPlanning from './pages/MealPlanning'
import RestockList from './pages/RestockList'
import Shop from './pages/Shop'
import Cook from './pages/Cook'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeForm from './pages/RecipeForm'
import InventoryLibrary from './pages/InventoryLibrary'
import { getPreferences } from './db/preferencesDB'
import { checkDailyNotifications, checkScheduledNotifications } from './notifications/notificationService'

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(null)

  useEffect(() => {
    const prefs = getPreferences()
    setHasOnboarded(prefs.hasOnboarded ?? false)
  }, [])

  // ── Service worker registration ────────────────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })
    }
  }, [])

  // ── Notification checks: on load and whenever the tab regains focus ────────
  useEffect(() => {
    function runChecks() {
      const prefs = getPreferences()
      checkScheduledNotifications()
      checkDailyNotifications(prefs)
    }

    runChecks()

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') runChecks()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  if (hasOnboarded === null) return null

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            hasOnboarded
              ? <Home />
              : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/onboarding"
          element={<Onboarding onComplete={() => setHasOnboarded(true)} />}
        />
        <Route path="/low-waste" element={<LowWaste />} />
        <Route path="/meal-planning" element={<MealPlanning />} />
        <Route path="/restock" element={<RestockList />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/recipe-library" element={<RecipeLibrary />} />
        <Route path="/recipe-library/new" element={<RecipeForm />} />
        <Route path="/recipe-library/:id/edit" element={<RecipeForm />} />
        <Route path="/inventory-library" element={<InventoryLibrary />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
