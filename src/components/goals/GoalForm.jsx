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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2 mt-2">
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Neues Ziel…"
        className="flex-1 bg-transparent text-sm text-charcoal placeholder-muted focus:outline-none"
        maxLength={120}
      />
      <button
        type="submit"
        disabled={!label.trim()}
        aria-label="Ziel hinzufügen"
        className="text-rose hover:text-rose-dark disabled:text-muted disabled:cursor-not-allowed transition-colors focus:outline-none"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </form>
  )
}
