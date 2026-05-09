import React, { useState } from 'react'

const SUBSTITUTION_LEVELS = ['Strict', 'Regular', 'Lenient']

export default function MiniSettings({ preferences, onUpdate, hideShortcut = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const shortcutMode = preferences?.shortcutMode ?? 'off-visible'
  const showShortcut = !hideShortcut && shortcutMode.endsWith('visible')
  const shortcutIsOn = shortcutMode.startsWith('on')
  const showSubstitutions = preferences?.showSubstitutions ?? false

  if (!showShortcut && !showSubstitutions) return null

  function toggleShortcut() {
    const [, visibility] = shortcutMode.split('-')
    onUpdate({ shortcutMode: shortcutIsOn ? `off-${visibility}` : `on-${visibility}` })
  }

  function setSubstitutionMode(level) {
    onUpdate({ substitutionMode: level.toLowerCase() })
  }

  const currentSubLevel = preferences?.substitutionMode
    ? preferences.substitutionMode.charAt(0).toUpperCase() + preferences.substitutionMode.slice(1)
    : 'Regular'

  return (
    <div className="mini-settings">
      <button
        className="mini-settings__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Quick Settings"
      >
        ⚙
      </button>

      {isOpen && (
        <div className="mini-settings__panel">
          {showShortcut && (
            <div className="settings-row settings-row--mini">
              <span className="settings-row__label">Shortcut Mode</span>
              <button
                className={`toggle ${shortcutIsOn ? 'toggle--on' : 'toggle--off'}`}
                onClick={toggleShortcut}
                role="switch"
                aria-checked={shortcutIsOn}
              >
                <span className="toggle__knob" />
              </button>
            </div>
          )}

          {showSubstitutions && (
            <div className="settings-row settings-row--mini">
              <span className="settings-row__label">Substitutions</span>
              <div className="segmented-control">
                {SUBSTITUTION_LEVELS.map((level) => (
                  <button
                    key={level}
                    className={`segmented-control__option ${
                      currentSubLevel === level ? 'segmented-control__option--active' : ''
                    }`}
                    onClick={() => setSubstitutionMode(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
