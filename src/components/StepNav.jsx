import React from 'react'
import { useNavigate } from 'react-router-dom'

const STEP_ORDER = [
  { path: '/low-waste',     label: 'Use Up Items',  optional: true },
  { path: '/meal-planning', label: 'Step 1: Meal Planning' },
  { path: '/restock',       label: 'Step 2: Restock List' },
  { path: '/shop',          label: 'Step 3: Shop' },
  { path: '/cook',          label: 'Step 4: Cook' },
]

// onNext / onPrev: optional overrides — if provided, they fire instead of default navigation.
// Useful for pages that need to do work (e.g. open a modal) before navigating away.
export default function StepNav({ currentPath, preferences, onNext, onPrev }) {
  const navigate = useNavigate()

  const visibleSteps = preferences?.showLowWaste
    ? STEP_ORDER
    : STEP_ORDER.filter((s) => !s.optional)

  const currentIndex = visibleSteps.findIndex((s) => s.path === currentPath)
  const prevStep = currentIndex > 0 ? visibleSteps[currentIndex - 1] : null
  const nextStep = currentIndex < visibleSteps.length - 1 ? visibleSteps[currentIndex + 1] : null

  function handlePrev() {
    if (onPrev) { onPrev(); return }
    if (prevStep) navigate(prevStep.path)
  }

  function handleNext() {
    if (onNext) { onNext(); return }
    if (nextStep) navigate(nextStep.path)
    else navigate('/')
  }

  return (
    <div className="step-nav">
      <button
        className="step-nav__btn step-nav__btn--prev"
        onClick={handlePrev}
        disabled={!prevStep && !onPrev}
      >
        ← {prevStep ? prevStep.label : 'Back'}
      </button>

      <span className="step-nav__indicator">
        {currentIndex + 1} / {visibleSteps.length}
      </span>

      <button
        className="step-nav__btn step-nav__btn--next"
        onClick={handleNext}
      >
        {nextStep ? `${nextStep.label} →` : 'Finish →'}
      </button>
    </div>
  )
}
