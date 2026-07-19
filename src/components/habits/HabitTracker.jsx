import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { toMonthKey } from '../../utils/dateHelpers'
import { getDaysInMonth, getDay, format } from 'date-fns'
import { de } from 'date-fns/locale'

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

function HabitGrid({ habit, monthKey, currentDate, log, onToggle, onDelete }) {
  const daysInMonth = getDaysInMonth(currentDate)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDay = isCurrentMonth ? today.getDate() : null

  // Monday-first offset: getDay returns 0=Sun, convert to 0=Mon
  const firstDow = getDay(new Date(year, month, 1))
  const offset = firstDow === 0 ? 6 : firstDow - 1

  const doneCount = Object.values(log).filter(Boolean).length

  // Build grid cells: offset empties + days
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-surface rounded-2xl px-3 pt-3 pb-3 group">
      {/* Habit header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg leading-none">{habit.emoji}</span>
        <span className="text-[13px] font-medium text-text flex-1">{habit.label}</span>
        <span className="text-[11px] text-text-3">{doneCount}/{daysInMonth}</span>
        <button onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:outline-none w-6 h-6 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[9px] font-medium text-text-4">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center py-0.5">
            {day ? (
              <button
                onClick={() => onToggle(day)}
                className="flex flex-col items-center gap-0 focus:outline-none active:scale-90 transition-transform"
              >
                <span className={`text-[8px] leading-none mb-0.5 ${day === todayDay ? 'text-accent font-bold' : 'text-text-4'}`}>{day}</span>
                <svg width="14" height="13" viewBox="0 0 18 17" fill="none">
                  <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
                    stroke={day === todayDay ? '#8b1a4a' : '#8b1a4a'}
                    strokeWidth={day === todayDay ? '2' : '1.5'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={log[day] ? '#8b1a4a' : 'transparent'}
                  />
                </svg>
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function HabitTracker() {
  const { state, habits: { getHabits, addHabit, deleteHabit, toggleDay, getLog } } = useApp()
  const { currentDate } = state
  const monthKey = toMonthKey(currentDate)
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: de })
  const habits = getHabits(monthKey)

  const [showAdd, setShowAdd] = useState(false)
  const [newEmoji, setNewEmoji] = useState('💧')
  const [newLabel, setNewLabel] = useState('')
  const [customEmoji, setCustomEmoji] = useState('')

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

  return (
    <div className="absolute inset-0 bg-bg flex flex-col">
      {/* Header */}
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

      {/* Add form */}
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

      {/* Habit list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-4">
            <span className="text-4xl">🌱</span>
            <p className="text-[13px]">Noch keine Habits — füge einen hinzu!</p>
          </div>
        ) : (
          habits.map(habit => (
            <HabitGrid
              key={habit.id}
              habit={habit}
              monthKey={monthKey}
              currentDate={currentDate}
              log={getLog(monthKey, habit.id)}
              onToggle={day => toggleDay(monthKey, habit.id, day)}
              onDelete={() => deleteHabit(monthKey, habit.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
