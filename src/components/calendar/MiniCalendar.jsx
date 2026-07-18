import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { buildMonthGrid, WEEKDAY_LABELS, toIsoDate, formatMonthYear, addMonths } from '../../utils/dateHelpers'
import { isToday, isSameMonth } from 'date-fns'

// Mini-Kalender für die linke Spalte
export function MiniCalendar() {
  const { state, dispatch } = useApp()
  const { currentDate, selectedDay } = state
  const [miniDate, setMiniDate] = useState(currentDate)
  const cells = buildMonthGrid(miniDate)

  return (
    <div className="p-4">
      {/* Mini header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text">{formatMonthYear(miniDate)}</span>
        <div className="flex gap-1">
          <button onClick={() => setMiniDate(d => addMonths(d, -1))}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text-3 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => setMiniDate(d => addMonths(d, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text-3 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-text-4 py-0.5">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(date => {
          const iso = toIsoDate(date)
          const inMonth = isSameMonth(date, miniDate)
          const today = isToday(date)
          const selected = selectedDay && toIsoDate(selectedDay) === iso
          return (
            <button
              key={iso}
              onClick={() => {
                dispatch({ type: 'SELECT_DAY', payload: date })
                dispatch({ type: 'GO_TO_DATE', payload: date })
              }}
              className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[11px] font-medium transition-all
                ${!inMonth ? 'text-text-4' : ''}
                ${today && !selected ? 'text-accent font-semibold' : ''}
                ${selected ? 'bg-accent text-white' : inMonth ? 'hover:bg-surface-3 text-text-2' : ''}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
