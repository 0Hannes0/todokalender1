import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { toMonthKey } from '../../utils/dateHelpers'
import { getDaysInMonth, getDay, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { SwipeToDelete } from '../ui/SwipeToDelete'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PRESET_HABITS = [
  { emoji: '💧', label: 'Wasser' },
  { emoji: '🏃', label: 'Sport' },
  { emoji: '📚', label: 'Lesen' },
  { emoji: '🧘', label: 'Meditation' },
  { emoji: '😴', label: 'Schlafen' },
  { emoji: '🥗', label: 'Gesund essen' },
  { emoji: '✍️', label: 'Schreiben' },
  { emoji: '🎵', label: 'Musik' },
]

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function HabitGrid({ habit, monthKey, currentDate, log, onToggle, onUpdate, dragHandleProps, isDragging }) {
  const [editing, setEditing] = useState(false)
  const [editEmoji, setEditEmoji] = useState(habit.emoji)
  const [editLabel, setEditLabel] = useState(habit.label)
  const daysInMonth = getDaysInMonth(currentDate)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDay = isCurrentMonth ? today.getDate() : null
  const firstDow = getDay(new Date(year, month, 1))
  const offset = firstDow === 0 ? 6 : firstDow - 1
  const doneCount = Object.values(log).filter(Boolean).length

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className={`bg-surface rounded-2xl px-3 pt-3 pb-3 transition-shadow ${isDragging ? 'shadow-2xl' : ''}`}>
      {editing ? (
        <div className="flex items-center gap-2 mb-2">
          <input value={editEmoji} onChange={e => setEditEmoji(e.target.value)} maxLength={2}
            className="w-9 text-center bg-surface-2 border border-border rounded-lg py-1 text-[15px] focus:outline-none focus:border-accent-mid" />
          <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)} maxLength={30}
            className="flex-1 bg-surface-2 border border-border rounded-lg px-2 py-1 text-[13px] text-text focus:outline-none focus:border-accent-mid"
            onKeyDown={e => { if (e.key === 'Enter') { onUpdate(editEmoji, editLabel); setEditing(false) } if (e.key === 'Escape') setEditing(false) }} />
          <button onClick={() => { onUpdate(editEmoji, editLabel); setEditing(false) }}
            className="text-[11px] text-white bg-accent px-2 py-1 rounded-lg">✓</button>
          <button onClick={() => setEditing(false)}
            className="text-[11px] text-text-3 px-2 py-1 rounded-lg hover:bg-surface-2">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          {/* Drag handle */}
          <button
            {...dragHandleProps}
            className="flex-shrink-0 p-1 -ml-1 touch-none focus:outline-none"
            aria-label="Verschieben"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="4.5" cy="3" r="1.2" fill="currentColor" className="text-text-4"/>
              <circle cx="9.5" cy="3" r="1.2" fill="currentColor" className="text-text-4"/>
              <circle cx="4.5" cy="7" r="1.2" fill="currentColor" className="text-text-4"/>
              <circle cx="9.5" cy="7" r="1.2" fill="currentColor" className="text-text-4"/>
              <circle cx="4.5" cy="11" r="1.2" fill="currentColor" className="text-text-4"/>
              <circle cx="9.5" cy="11" r="1.2" fill="currentColor" className="text-text-4"/>
            </svg>
          </button>
          <button onClick={() => { setEditEmoji(habit.emoji); setEditLabel(habit.label); setEditing(true) }}
            className="flex items-center gap-2 flex-1 min-w-0 text-left focus:outline-none">
            <span className="text-lg leading-none">{habit.emoji}</span>
            <span className="text-[13px] font-medium text-text truncate">{habit.label}</span>
          </button>
          <span className="text-[11px] text-text-3 flex-shrink-0">{doneCount}/{daysInMonth}</span>
        </div>
      )}

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-medium text-text-3">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center py-0.5">
            {day ? (
              <button onClick={() => onToggle(day)}
                className="flex flex-col items-center gap-0 focus:outline-none active:scale-90 transition-transform">
                <span className={`text-[8px] leading-none mb-0.5 ${day === todayDay ? 'text-accent font-bold' : 'text-text-3'}`}>{day}</span>
                <svg width="14" height="13" viewBox="0 0 18 17" fill="none">
                  <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
                    stroke="#8b1a4a" strokeWidth={day === todayDay ? '2' : '1.5'}
                    strokeLinecap="round" strokeLinejoin="round"
                    fill={log[day] ? '#8b1a4a' : 'transparent'} />
                </svg>
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function SortableHabit({ habit, monthKey, currentDate, log, onToggle, onUpdate, onDelete, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SwipeToDelete onDelete={onDelete} disabled={isDragging}>
        <HabitGrid
          habit={habit}
          monthKey={monthKey}
          currentDate={currentDate}
          log={log}
          onToggle={onToggle}
          onUpdate={onUpdate}
          isDragging={isDragging}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      </SwipeToDelete>
    </div>
  )
}

export function HabitTracker() {
  const { state, habits: { getHabits, addHabit, deleteHabit, updateHabit, toggleDay, getLog, reorderHabits } } = useApp()
  const { currentDate } = state
  const monthKey = toMonthKey(currentDate)
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: de })
  const habits = getHabits(monthKey)

  const [showAdd, setShowAdd] = useState(false)
  const [newEmoji, setNewEmoji] = useState('💧')
  const [newLabel, setNewLabel] = useState('')
  const [customEmoji, setCustomEmoji] = useState('')
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleAdd(e) {
    e.preventDefault()
    const emoji = customEmoji.trim() || newEmoji
    const label = newLabel.trim()
    if (!label) return
    addHabit(monthKey, emoji, label)
    setNewLabel('')
    setCustomEmoji('')
    setShowAdd(false)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = habits.findIndex(h => h.id === active.id)
    const newIndex = habits.findIndex(h => h.id === over.id)
    reorderHabits(monthKey, oldIndex, newIndex)
  }

  return (
    <div className="absolute inset-0 bg-bg flex flex-col">
      <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center justify-between border-b border-border bg-surface">
        <div>
          <p className="text-[11px] font-medium text-text-3 uppercase tracking-wider">Habit Tracker</p>
          <p className="text-base font-semibold text-text">{monthLabel}</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus:outline-none ${showAdd ? 'bg-accent text-white' : 'bg-surface-3 text-text-3 hover:text-accent'}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              style={showAdd ? { transform: 'rotate(45deg)', transformOrigin: '7px 7px' } : {}} />
          </svg>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex-shrink-0 px-4 py-3 bg-surface border-b border-border flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 mb-1">
            {PRESET_HABITS.map(p => (
              <button key={p.emoji} type="button"
                onClick={() => { setNewEmoji(p.emoji); setNewLabel(p.label); setCustomEmoji('') }}
                className={`text-xl px-1.5 py-0.5 rounded-lg transition-colors ${newEmoji === p.emoji && !customEmoji ? 'bg-accent-soft ring-1 ring-accent-mid' : 'hover:bg-surface-2'}`}>
                {p.emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
              placeholder="🌟" maxLength={2}
              className="w-12 text-center bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-[15px] focus:outline-none focus:border-accent-mid" />
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="Habit Name…" maxLength={30} autoFocus
              className="flex-1 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid" />
            <button type="submit" disabled={!newLabel.trim()}
              className="bg-accent text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-2 transition-colors">
              +
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 pb-6 flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-4">
            <span className="text-4xl">🌱</span>
            <p className="text-[13px]">Noch keine Habits — füge einen hinzu!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveId(e.active.id)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
              {habits.map(habit => (
                <SortableHabit
                  key={habit.id}
                  habit={habit}
                  monthKey={monthKey}
                  currentDate={currentDate}
                  log={getLog(monthKey, habit.id)}
                  onToggle={day => toggleDay(monthKey, habit.id, day)}
                  onUpdate={(emoji, label) => updateHabit(monthKey, habit.id, emoji, label)}
                  onDelete={() => deleteHabit(monthKey, habit.id)}
                  isDragging={activeId === habit.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
