import { useApp } from '../../store/AppContext'
import { formatMonthYear, formatWeekRange, toYearKey } from '../../utils/dateHelpers'

const VIEWS = [
  { key: 'month', label: 'Monat' },
  { key: 'week',  label: 'Woche' },
  { key: 'year',  label: 'Jahr'  },
]

export function CalendarHeader() {
  const { state, dispatch } = useApp()
  const { view, currentDate } = state

  function label() {
    if (view === 'month') return formatMonthYear(currentDate)
    if (view === 'week')  return formatWeekRange(currentDate)
    return toYearKey(currentDate)
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-2">
        <button onClick={() => dispatch({ type: 'NAVIGATE', payload: -1 })} aria-label="Zurück"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 10.5L5.5 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-sm font-semibold text-text min-w-44 text-center select-none">{label()}</span>
        <button onClick={() => dispatch({ type: 'NAVIGATE', payload: 1 })} aria-label="Weiter"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => dispatch({ type: 'GO_TO_TODAY' })}
          className="text-[11px] font-medium text-text-3 hover:text-text border border-border rounded-lg px-2.5 py-1 transition-all hover:border-border-2 ml-1">
          Heute
        </button>
      </div>

      {/* View switcher */}
      <div className="flex bg-surface-3 rounded-xl p-1 gap-0.5">
        {VIEWS.map(({ key, label: lbl }) => (
          <button key={key} onClick={() => dispatch({ type: 'SET_VIEW', payload: key })}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all ${
              view === key ? 'bg-white text-accent shadow-sm font-semibold' : 'text-text-3 hover:text-text-2'
            }`}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}
