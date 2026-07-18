import { useState } from 'react'

const DEFAULT_COLOR = '#8b1a4a'

export function TodoForm({ onAdd }) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)

  function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label, color)
    setLabel('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2 border border-border focus-within:border-accent-mid transition-colors">
      <label className="relative flex-shrink-0 cursor-pointer">
        <div className="w-4 h-4 rounded-full ring-1 ring-black/10 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" aria-label="Farbe" />
      </label>
      <input type="text" value={label} onChange={e => setLabel(e.target.value)}
        placeholder="Aufgabe hinzufügen…"
        className="flex-1 bg-transparent text-[13px] text-text placeholder-text-4 focus:outline-none" maxLength={120} />
      <button type="submit" disabled={!label.trim()} aria-label="Hinzufügen"
        className="text-accent disabled:text-text-4 disabled:cursor-not-allowed transition-colors focus:outline-none flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </form>
  )
}
