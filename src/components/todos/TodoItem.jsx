import { useState } from 'react'

export function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(todo.label)
  const [editNotes, setEditNotes] = useState(todo.notes || '')
  const [editColor, setEditColor] = useState(todo.color)

  function saveEdit() {
    if (editLabel.trim()) {
      onUpdate(todo.id, { label: editLabel.trim(), notes: editNotes, color: editColor })
    }
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
    if (e.key === 'Escape') { setEditing(false); setEditLabel(todo.label); setEditNotes(todo.notes || ''); setEditColor(todo.color) }
  }

  return (
    <div className={`rounded-xl transition-colors ${todo.completed ? 'opacity-50' : ''} ${editing ? 'bg-surface-2 ring-1 ring-accent-mid' : 'hover:bg-surface-2 active:bg-surface-2'}`}>
      <div className="flex items-center gap-2.5 px-2 py-2.5">
        {/* Checkbox */}
        <button onClick={() => onToggle(todo.id)}
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none"
          style={{ borderColor: todo.color, backgroundColor: todo.completed ? todo.color : 'transparent' }}>
          {todo.completed && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Label — tap to edit */}
        <button onClick={() => !todo.completed && setEditing(e => !e)}
          className={`flex-1 text-[13px] text-left focus:outline-none ${todo.completed ? 'line-through text-text-3 cursor-default' : 'text-text'}`}>
          {todo.label}
          {todo.notes && !editing && (
            <span className="block text-[11px] text-text-3 truncate mt-0.5">{todo.notes}</span>
          )}
        </button>

        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.color }} />

        {/* Delete */}
        <button onClick={() => onDelete(todo.id)} aria-label="Löschen"
          className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:opacity-100 focus:outline-none w-8 h-8 flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

        {/* Edit panel */}
      {editing && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <label className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center cursor-pointer">
              <span className="w-6 h-6 rounded-full ring-1 ring-black/10" style={{ backgroundColor: editColor }} />
              <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" aria-label="Farbe" />
            </label>
            <input
              autoFocus
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Aufgabe"
              className="flex-1 bg-surface border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-text focus:outline-none focus:border-accent-mid"
              maxLength={120}
            />
          </div>
          <textarea
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Notiz (optional)"
            rows={2}
            className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid resize-none"
            maxLength={500}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setEditLabel(todo.label); setEditNotes(todo.notes || ''); setEditColor(todo.color) }}
              className="text-[12px] text-text-3 px-3 py-1.5 rounded-lg hover:bg-surface-3 transition-colors">
              Abbrechen
            </button>
            <button onClick={saveEdit}
              className="text-[12px] text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent-2 transition-colors">
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
