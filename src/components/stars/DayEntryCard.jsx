import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { getDayStatus } from '../../utils/starCalc'
import { toIsoDate } from '../../utils/dateHelpers'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

/**
 * DayEntryCard — per-day input card with toggles, steps input, Joker/Krank buttons.
 *
 * Props:
 *   isoDate  {string}   - 'YYYY-MM-DD'
 *   weekKey  {string}   - 'YYYY-Www'
 *   monthKey {string}   - 'YYYY-MM'
 *   dayData  {object}   - day entry from stars.weeks[weekKey].days[isoDate]
 *   jokerDays {string[]} - joker days for this month
 *   isLocked {boolean}  - week is locked (read-only)
 */
export function DayEntryCard({ isoDate, weekKey, monthKey, dayData, jokerDays = [], isLocked }) {
  const { stars: starsApi } = useApp()
  const [expanded, setExpanded] = useState(false)

  const today = toIsoDate(new Date())
  const isToday = isoDate === today
  const isFuture = isoDate > today

  const isJoker = jokerDays.includes(isoDate)
  const isKrank = !!(dayData?.fieber)
  const status = getDayStatus(isoDate, dayData, jokerDays, today)

  // Parse date for display
  const dateObj = new Date(isoDate + 'T12:00:00')
  const dayLabel = format(dateObj, 'EEE', { locale: de }) // Mo, Di, etc.
  const dayNum = format(dateObj, 'd. MMM', { locale: de }) // 27. Jul

  const schritte = dayData?.schritte || ''
  const schritteNum = Number(schritte) || 0

  function toggle(field) {
    if (isLocked || isFuture) return
    starsApi.setDayField(weekKey, isoDate, field, !dayData?.[field])
  }

  function handleSchritte(val) {
    if (isLocked || isFuture) return
    starsApi.setDayField(weekKey, isoDate, 'schritte', val === '' ? '' : Number(val))
  }

  function toggleJoker() {
    if (isLocked) return
    starsApi.setJokerDay(monthKey, isoDate, !isJoker)
  }

  function toggleKrank() {
    if (isLocked) return
    starsApi.setKrankDay(weekKey, isoDate, !isKrank)
  }

  // Status-based card tint
  const cardBg = isJoker
    ? 'bg-surface opacity-60'
    : isKrank
    ? 'bg-red-50 dark:bg-red-950/30'
    : 'bg-surface'

  const ringClass = isToday ? 'ring-1 ring-accent' : ''

  return (
    <div
      className={`rounded-2xl border border-border ${cardBg} ${ringClass} overflow-hidden transition-all`}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none"
        onClick={() => !isFuture && setExpanded(e => !e)}
        disabled={isFuture}
      >
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <StatusDot status={status} />
          <div>
            <span className="font-semibold text-text capitalize">{dayLabel}</span>
            <span className="text-text-3 text-sm ml-1.5">{dayNum}</span>
          </div>
          {isToday && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent text-white ml-1">Heute</span>
          )}
          {isLocked && (
            <span className="text-[10px] text-text-3 ml-1">🔒</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Joker pill */}
          {!isFuture && !isLocked && (
            <button
              onClick={e => { e.stopPropagation(); toggleJoker() }}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors focus:outline-none ${
                isJoker
                  ? 'bg-accent text-white border-accent'
                  : 'text-text-3 border-border hover:border-accent hover:text-accent'
              }`}
            >
              Joker
            </button>
          )}
          {/* Krank pill */}
          {!isFuture && !isLocked && (
            <button
              onClick={e => { e.stopPropagation(); toggleKrank() }}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors focus:outline-none ${
                isKrank
                  ? 'bg-red-500 text-white border-red-500'
                  : 'text-text-3 border-border hover:border-red-400 hover:text-red-500'
              }`}
            >
              Krank
            </button>
          )}
          {/* Expand arrow */}
          {!isFuture && (
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-text-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && !isFuture && !isJoker && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
          {isKrank ? (
            <p className="text-sm text-red-500 font-medium">🤒 Entschuldigt — Genesungswünsche!</p>
          ) : (
            <>
              <ToggleRow
                emoji="🍽️" label="Kalorien ≤ 1350 kcal"
                checked={!!dayData?.kalorien} onToggle={() => toggle('kalorien')}
                disabled={isLocked}
              />
              <ToggleRow
                emoji="🥩" label="Eiweiß ≥ 80g"
                checked={!!dayData?.eiweiss} onToggle={() => toggle('eiweiss')}
                disabled={isLocked}
              />
              <ToggleRow
                emoji="💧" label="Wasser ≥ 1.5L"
                checked={!!dayData?.wasser} onToggle={() => toggle('wasser')}
                disabled={isLocked}
              />
              {/* Schritte */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">👟</span>
                  <span className="text-sm text-text">Schritte</span>
                </div>
                <div className="flex items-center gap-2">
                  {schritteNum >= 15000 && (
                    <span className="text-xs font-medium text-accent">+❤️</span>
                  )}
                  {schritteNum > 0 && schritteNum < 6000 && (
                    <span className="text-xs font-medium text-red-500">−1⭐</span>
                  )}
                  {schritteNum >= 6000 && schritteNum < 8000 && (
                    <span className="text-xs font-medium text-orange-500">−½⭐</span>
                  )}
                  <input
                    type="number"
                    min="0"
                    max="99999"
                    value={schritte}
                    onChange={e => handleSchritte(e.target.value)}
                    disabled={isLocked}
                    placeholder="0"
                    className="w-24 text-right text-sm bg-bg border border-border rounded-lg px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Joker active message */}
      {isJoker && !isFuture && (
        <div className="px-4 pb-3 text-xs text-text-3 italic">Joker verwendet ✓</div>
      )}
    </div>
  )
}

function ToggleRow({ emoji, label, checked, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <span className="text-sm text-text">{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
          checked ? 'bg-accent' : 'bg-surface-3'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = {
    perfect: 'bg-green-500',
    partial: 'bg-orange-400',
    fail: 'bg-red-500',
    joker: 'bg-accent',
    krank: 'bg-red-300',
    future: 'bg-surface-3',
    empty: 'bg-surface-3',
  }
  return (
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-surface-3'}`} />
  )
}
