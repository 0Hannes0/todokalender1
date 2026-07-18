import { useState } from 'react'

const DEFAULT_COLOR = '#c23b6a'

export function TodoForm({ onAdd }) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)

  function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label, color)
    setLabel('')
    setColor(DEFAULT_COLOR)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 bg-surface-3 rounded-xl px-3 py-2.5 border border-border focus-within:border-wine transition-colors">
        {/* Free color picker */}
        <label aria-label="Farbe wählen" className="relative flex-shrink-0 cursor-pointer">
          <div
            className="w-5 h-5 rounded-full ring-1 ring-white/10 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            aria-label="Farbe wählen"
          />
        </label>

        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Neue Aufgabe hinzufügen…"
          className="flex-1 bg-transparent text-sm text-text placeholder-text-muted focus:outline-none"
          maxLength={120}
        />

        <button
          type="submit"
          disabled={!label.trim()}
          aria-label="Hinzufügen"
          className="text-wine-bright hover:text-accent disabled:text-text-muted disabled:cursor-not-allowed transition-colors focus:outline-none flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </form>
  )
}
