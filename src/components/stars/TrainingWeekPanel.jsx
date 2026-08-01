import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

/**
 * TrainingWeekPanel — shows Kraft + Pilates sessions, add form, Joker/Ausnahme toggles.
 *
 * Props:
 *   weekKey   {string}
 *   weekDays  {string[]} - ISO date strings for Mon–Sun (for the date picker)
 *   training  {object}   - weekData.training
 *   isLocked  {boolean}
 */
export function TrainingWeekPanel({ weekKey, weekDays = [], training = {}, isLocked }) {
  const { stars: starsApi } = useApp()

  const kraft = training.kraft || []
  const pilates = training.pilates || []
  const jokerUsed = !!training.jokerUsed
  const ausnahme = !!training.ausnahme

  const [adding, setAdding] = useState(null) // 'kraft' | 'pilates' | null
  const [addDate, setAddDate] = useState(weekDays[0] || '')
  const [addMin, setAddMin] = useState('')

  function handleAdd() {
    if (!addDate || !addMin) return
    starsApi.addTrainingSession(weekKey, adding, addDate, Number(addMin))
    setAdding(null)
    setAddMin('')
    setAddDate(weekDays[0] || '')
  }

  function formatSessionDate(isoDate) {
    const d = new Date(isoDate + 'T12:00:00')
    return format(d, 'EEE d. MMM', { locale: de })
  }

  const kraftRequired = ausnahme ? 0 : (jokerUsed ? 2 : 3)
  const pilatesRequired = ausnahme ? 5 : (jokerUsed ? 3 : 2)
  const kraftValid = kraft.filter(s => s.minuten >= 30).length
  const pilatesValid = pilates.filter(s => s.minuten >= 30).length

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Training diese Woche</h3>
        {jokerUsed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">Joker aktiv</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Krafttraining section */}
        <SessionSection
          emoji="💪"
          label="Krafttraining"
          required={kraftRequired}
          valid={kraftValid}
          sessions={kraft}
          type="kraft"
          isLocked={isLocked}
          ausnahme={ausnahme}
          weekDays={weekDays}
          onRemove={(i) => starsApi.removeTrainingSession(weekKey, 'kraft', i)}
          onAdd={() => { setAdding('kraft'); setAddDate(weekDays[0] || '') }}
          formatDate={formatSessionDate}
        />

        {/* Pilates section */}
        <SessionSection
          emoji="🧘"
          label={ausnahme ? 'Pilates/Yoga (Ausnahme: 5×)' : 'Pilates / Yoga'}
          required={pilatesRequired}
          valid={pilatesValid}
          sessions={pilates}
          type="pilates"
          isLocked={isLocked}
          ausnahme={ausnahme}
          weekDays={weekDays}
          onRemove={(i) => starsApi.removeTrainingSession(weekKey, 'pilates', i)}
          onAdd={() => { setAdding('pilates'); setAddDate(weekDays[0] || '') }}
          formatDate={formatSessionDate}
        />

        {/* Add form */}
        {adding && !isLocked && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-bg border border-accent/20">
            <p className="text-xs font-medium text-accent">
              {adding === 'kraft' ? '💪 Krafttraining' : '🧘 Pilates/Yoga'} hinzufügen
            </p>
            <div className="flex gap-2">
              <select
                value={addDate}
                onChange={e => setAddDate(e.target.value)}
                className="flex-1 text-sm bg-surface border border-border rounded-lg px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {weekDays.map(d => {
                  const dt = new Date(d + 'T12:00:00')
                  return <option key={d} value={d}>{format(dt, 'EEE d.', { locale: de })}</option>
                })}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={addMin}
                  onChange={e => setAddMin(e.target.value)}
                  placeholder="Min."
                  className="w-20 text-sm bg-surface border border-border rounded-lg px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="text-xs text-text-3">min</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!addDate || !addMin}
                className="flex-1 text-sm font-medium py-1.5 rounded-lg bg-accent text-white disabled:opacity-40 focus:outline-none"
              >
                Speichern
              </button>
              <button
                onClick={() => setAdding(null)}
                className="text-sm text-text-3 px-3 py-1.5 rounded-lg hover:bg-bg focus:outline-none"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Joker & Ausnahme toggles */}
        {!isLocked && (
          <div className="flex flex-col gap-2 pt-1 border-t border-border">
            <CheckRow
              label="Joker-Regel: 1× Pilates statt Kraft"
              checked={jokerUsed}
              onChange={v => starsApi.setWeekTrainingFlag(weekKey, 'jokerUsed', v)}
              disabled={ausnahme}
            />
            <CheckRow
              label="Ausnahme-Modus (kein Gym – 5× Pilates)"
              checked={ausnahme}
              onChange={v => starsApi.setWeekTrainingFlag(weekKey, 'ausnahme', v)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SessionSection({ emoji, label, required, valid, sessions, type, isLocked, ausnahme, weekDays, onRemove, onAdd, formatDate }) {
  const ok = valid >= required
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{emoji}</span>
        <span className="text-sm font-medium text-text">{label}</span>
        <span className={`text-xs ml-auto font-medium tabular-nums ${ok ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
          {valid}/{required}×
        </span>
      </div>
      {sessions.map((s, i) => (
        <div key={i} className="flex items-center justify-between text-xs text-text-2 pl-6">
          <span>✓ {formatDate(s.date)} · {s.minuten} min{type === 'pilates' && ausnahme ? (s.minuten >= 45 ? ' (45+)' : '') : ''}</span>
          {!isLocked && (
            <button
              onClick={() => onRemove(i)}
              className="text-text-3 hover:text-red-500 transition-colors focus:outline-none px-1"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!isLocked && (
        <button
          onClick={onAdd}
          className="text-xs text-accent flex items-center gap-1 pl-6 py-0.5 focus:outline-none hover:underline"
        >
          + Einheit hinzufügen
        </button>
      )}
    </div>
  )
}

function CheckRow({ label, checked, onChange, disabled }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-40' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-[var(--color-accent)] rounded focus:outline-none"
      />
      <span className="text-xs text-text-2">{label}</span>
    </label>
  )
}
