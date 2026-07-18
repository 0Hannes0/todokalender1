import { useState } from 'react'
import { ColorPicker } from '../ui/ColorPicker'
import { DEFAULT_TODO_COLOR } from '../../constants/colors'

export function TodoForm({ onAdd }) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState(DEFAULT_TODO_COLOR)
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label, color)
    setLabel('')
    setColor(DEFAULT_TODO_COLOR)
    setPickerOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2">
        {/* Color dot toggle */}
        <button
          type="button"
          onClick={() => setPickerOpen(v => !v)}
          aria-label="Farbe wählen"
          className="w-5 h-5 rounded-full flex-shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-charcoal/40"
          style={{ backgroundColor: color }}
        />

        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Neue Aufgabe…"
          className="flex-1 bg-transparent text-sm text-charcoal placeholder-muted focus:outline-none"
          maxLength={120}
        />

        <button
          type="submit"
          disabled={!label.trim()}
          aria-label="Aufgabe hinzufügen"
          className="text-sage hover:text-sage-dark disabled:text-muted disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {pickerOpen && (
        <div className="bg-cream rounded-xl px-3 py-2">
          <ColorPicker selected={color} onSelect={c => { setColor(c); setPickerOpen(false) }} />
        </div>
      )}
    </form>
  )
}
