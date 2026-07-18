import { useApp } from '../../store/AppContext'
import { formatMonthYear, formatWeekRange, toYearKey } from '../../utils/dateHelpers'
import { IconButton } from '../ui/IconButton'

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
    <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
      {/* Nav + label */}
      <div className="flex items-center gap-2">
        <IconButton label="Zurück" onClick={() => dispatch({ type: 'NAVIGATE', payload: -1 })}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
        <span className="text-lg font-semibold text-charcoal min-w-48 text-center select-none">
          {label()}
        </span>
        <IconButton label="Weiter" onClick={() => dispatch({ type: 'NAVIGATE', payload: 1 })}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
        <button
          onClick={() => dispatch({ type: 'GO_TO_TODAY' })}
          className="ml-2 text-xs font-medium text-charcoal-light border border-cream-dark rounded-full px-3 py-1 hover:bg-cream-dark transition-colors"
        >
          Heute
        </button>
      </div>

      {/* View switcher */}
      <div className="flex rounded-full bg-cream-dark p-1 gap-1">
        {VIEWS.map(({ key, label: lbl }) => (
          <button
            key={key}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: key })}
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all ${
              view === key
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}
