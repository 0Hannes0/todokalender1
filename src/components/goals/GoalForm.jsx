import { useState } from 'react'

export function GoalForm({ onAdd }) {
  const [label, setLabel] = useState('')
  function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label)
    setLabel('')
  }
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2 mt-2 border border-border focus-within:border-accent-mid transition-colors">
      <input type="text" value={label} onChange={e => setLabel(e.target.value)}
        placeholder="Ziel hinzufügen…"
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
