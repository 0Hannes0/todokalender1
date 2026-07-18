import { useState } from 'react'

export function GoalForm({ onAdd }) {
  const [label, setLabel] = useState('')
  const [targetCount, setTargetCount] = useState('')
  const [keyword, setKeyword] = useState('')
  const [expanded, setExpanded] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return
    onAdd(label, targetCount || null, keyword || null)
    setLabel('')
    setTargetCount('')
    setKeyword('')
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 border border-border rounded-xl overflow-hidden focus-within:border-accent-mid transition-colors">
      <div className="flex items-center gap-2 bg-surface-2 px-3 py-2">
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
          placeholder="Ziel hinzufügen…"
          className="flex-1 bg-transparent text-[13px] text-text placeholder-text-4 focus:outline-none" maxLength={120} />
        <button type="button" onClick={() => setExpanded(v => !v)}
          title="Zähler konfigurieren"
          className={`transition-colors focus:outline-none flex-shrink-0 ${expanded ? 'text-accent' : 'text-text-4 hover:text-text-3'}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M7 4.5v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="submit" disabled={!label.trim()} aria-label="Hinzufügen"
          className="text-accent disabled:text-text-4 disabled:cursor-not-allowed transition-colors focus:outline-none flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="bg-surface px-3 py-2 flex gap-2 border-t border-border">
          <input
            type="number"
            min="1"
            max="9999"
            value={targetCount}
            onChange={e => setTargetCount(e.target.value)}
            placeholder="Anzahl (z.B. 30)"
            className="w-28 bg-surface-2 border border-border rounded-lg px-2 py-1 text-[12px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid"
          />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Stichwort (z.B. tiktok)"
            className="flex-1 bg-surface-2 border border-border rounded-lg px-2 py-1 text-[12px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid"
            maxLength={40}
          />
        </div>
      )}
    </form>
  )
}
