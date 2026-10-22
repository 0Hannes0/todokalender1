import { useState } from 'react'
import { SwipeToDelete } from '../ui/SwipeToDelete'

export function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(todo.label)
  const [editNotes, setEditNotes] = useState(todo.notes || '')
  const [editColor, setEditColor] = useState(todo.color)
  const [editReminderEnabled, setEditReminderEnabled] = useState(todo.reminderEnabled || false)
  const [editReminderTime, setEditReminderTime] = useState(todo.reminderTime || '')

  function saveEdit() {
    if (editLabel.trim()) {
      onUpdate(todo.id, {
        label: editLabel.trim(),
        notes: editNotes,
        color: editColor,
        reminderEnabled: editReminderEnabled,
        reminderTime: editReminderEnabled ? editReminderTime : '',
      })
    }
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
    if (e.key === 'Escape') {
      setEditing(false)
      setEditLabel(todo.label)
      setEditNotes(todo.notes || '')
      setEditColor(todo.color)
      setEditReminderEnabled(todo.reminderEnabled || false)
      setEditReminderTime(todo.reminderTime || '')
    }
  }

  return (
    <SwipeToDelete onDelete={() => onDelete(todo.id)}>
    <div className={`rounded-xl transition-colors ${todo.completed ? 'opacity-50' : ''} ${editing ? 'bg-surface-2 ring-1 ring-accent-mid' : 'hover:bg-surface-2 active:bg-surface-2'}`}>
      <div className="flex items-center gap-2.5 px-2 py-2.5">
        {/* Checkbox */}
        <button onClick={() => onToggle(todo.id)}
          className="w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none">
          <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
              stroke={todo.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={todo.completed ? todo.color : 'transparent'}
            />
          </svg>
        </button>

        {/* Label — tap to edit */}
        <button onClick={() => !todo.completed && setEditing(e => !e)}
          className={`flex-1 text-[13px] text-left focus:outline-none ${todo.completed ? 'line-through text-text-3 cursor-default' : 'text-text'}`}>
          {todo.label}
          {todo.notes && !editing && (
            <span className="block text-[11px] text-text-3 truncate mt-0.5">{todo.notes}</span>
          )}
        </button>

        {todo.reminderEnabled && todo.reminderTime && !editing && (
          <span className="text-[10px] text-text-3 flex-shrink-0" title={`Erinnerung: ${todo.reminderTime}`}>🔔</span>
        )}

        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.color }} />
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
            onChange={e => { setEditNotes(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
            onKeyDown={handleKeyDown}
            placeholder="Notiz (optional)"
            rows={3}
            className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid resize-none overflow-hidden"
          />
          {/* Erinnerung */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditReminderEnabled(v => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${editReminderEnabled ? 'bg-accent' : 'bg-surface-3'}`}
              aria-label="Erinnerung aktivieren"
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editReminderEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className="text-[12px] text-text-3 flex-1">Erinnerung 15 Min. vorher</span>
            {editReminderEnabled && (
              <input
                type="time"
                value={editReminderTime}
                onChange={e => setEditReminderTime(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2 py-1 text-[12px] text-text focus:outline-none focus:border-accent-mid"
                aria-label="Erinnerungszeit"
              />
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setEditLabel(todo.label); setEditNotes(todo.notes || ''); setEditColor(todo.color); setEditReminderEnabled(todo.reminderEnabled || false); setEditReminderTime(todo.reminderTime || '') }}
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
    </SwipeToDelete>
  )
}
