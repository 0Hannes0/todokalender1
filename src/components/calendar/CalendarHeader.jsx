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
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
      {/* Nav + label */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', payload: -1 })}
          aria-label="Zurück"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-3 hover:text-text hover:bg-surface-3 transition-all focus:outline-none"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9.5 11.5L5.5 7.5l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className="text-base font-semibold text-text min-w-52 text-center select-none tracking-tight">
          {label()}
        </span>

        <button
          onClick={() => dispatch({ type: 'NAVIGATE', payload: 1 })}
          aria-label="Weiter"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-3 hover:text-text hover:bg-surface-3 transition-all focus:outline-none"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M5.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          onClick={() => dispatch({ type: 'GO_TO_TODAY' })}
          className="text-xs font-medium text-text-2 hover:text-text border border-border hover:border-border-light rounded-lg px-3 py-1.5 transition-all"
        >
          Heute
        </button>
      </div>

      {/* View switcher */}
      <div className="flex rounded-xl bg-surface-2 p-1 gap-0.5">
        {VIEWS.map(({ key, label: lbl }) => (
          <button
            key={key}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: key })}
            className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-all ${
              view === key
                ? 'bg-wine text-text shadow-sm'
                : 'text-text-3 hover:text-text-2'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}
