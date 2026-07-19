import { useState, useMemo } from 'react'
import { useApp } from '../../store/AppContext'
import { toMonthKey } from '../../utils/dateHelpers'
import { getDaysInMonth, format } from 'date-fns'
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

function HeartCheck({ checked, onClick, small }) {
  const size = small ? 16 : 20
  return (
    <button onClick={onClick} className="flex items-center justify-center focus:outline-none active:scale-90 transition-transform">
      <svg width={size} height={size} viewBox="0 0 18 17" fill="none">
        <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
          stroke="#8b1a4a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={checked ? '#8b1a4a' : 'transparent'}
        />
      </svg>
    </button>
  )
}

export function HabitTracker() {
  const { state, habits: { getHabits, addHabit, deleteHabit, toggleDay, getLog } } = useApp()
  const { currentDate } = state
  const monthKey = toMonthKey(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: de })
  const habits = getHabits(monthKey)

  const [showAdd, setShowAdd] = useState(false)
  const [newEmoji, setNewEmoji] = useState('💧')
  const [newLabel, setNewLabel] = useState('')
  const [customEmoji, setCustomEmoji] = useState('')

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

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
            {showAdd
              ? <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: 'rotate(45deg)', transformOrigin: '7px 7px' }}/>
              : <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            }
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
                className={`text-xl px-1 py-0.5 rounded-lg transition-colors ${newEmoji === p.emoji && !customEmoji ? 'bg-accent-soft ring-1 ring-accent-mid' : 'hover:bg-surface-2'}`}>
                {p.emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
              placeholder="🌟" maxLength={2}
              className="w-12 text-center bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-[15px] focus:outline-none focus:border-accent-mid" />
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="Habit Name…" maxLength={30}
              className="flex-1 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-[13px] text-text placeholder-text-4 focus:outline-none focus:border-accent-mid" />
            <button type="submit" disabled={!newLabel.trim()}
              className="bg-accent text-white text-[12px] font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-2 transition-colors">
              +
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto px-2 py-3">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-4">
            <span className="text-4xl">🌱</span>
            <p className="text-[13px]">Noch keine Habits — füge einen hinzu!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: `${Math.max(320, daysInMonth * 28 + 100)}px` }}>
              <thead>
                <tr>
                  <th className="text-left text-[11px] text-text-3 font-medium pb-2 pl-2 w-24 sticky left-0 bg-bg z-10">Habit</th>
                  {days.map(d => (
                    <th key={d} className="text-center text-[10px] text-text-4 font-normal pb-2 w-7">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const log = getLog(monthKey, habit.id)
                  const doneCount = Object.values(log).filter(Boolean).length
                  return (
                    <tr key={habit.id} className="group">
                      <td className="sticky left-0 bg-bg z-10 py-1.5 pl-2 pr-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base flex-shrink-0">{habit.emoji}</span>
                          <span className="text-[11px] text-text-2 truncate">{habit.label}</span>
                          <span className="text-[10px] text-text-4 ml-auto flex-shrink-0">{doneCount}</span>
                          <button onClick={() => deleteHabit(monthKey, habit.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:outline-none ml-1 flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </td>
                      {days.map(d => (
                        <td key={d} className="text-center py-1.5">
                          <div className="flex items-center justify-center">
                            <HeartCheck
                              checked={!!log[d]}
                              onClick={() => toggleDay(monthKey, habit.id, d)}
                              small
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
