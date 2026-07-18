import {
  startOfYear,
  addMonths,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isToday,
  format,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { MONTH_NAMES_SHORT } from '../../utils/dateHelpers'

function MiniMonth({ date, onMonthClick }) {
  const monthStart = startOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const cells = Array.from({ length: 35 }, (_, i) => addDays(gridStart, i))

  return (
    <button
      onClick={() => onMonthClick(date)}
      className="p-3 rounded-2xl bg-cream-dark/40 hover:bg-sage-light transition-all text-left focus:outline-none focus:ring-2 focus:ring-sage/40"
      aria-label={format(date, 'MMMM yyyy', { locale: de })}
    >
      <p className="text-xs font-semibold text-charcoal mb-2">
        {MONTH_NAMES_SHORT[date.getMonth()]}
      </p>
      <div className="grid grid-cols-7 gap-px">
        {['M','D','M','D','F','S','S'].map((d, i) => (
          <span key={i} className="text-[8px] text-center text-muted font-medium">{d}</span>
        ))}
        {cells.map((cell, i) => (
          <span
            key={i}
            className={`
              text-[9px] text-center leading-4 rounded-full w-4 h-4 mx-auto flex items-center justify-center
              ${!isSameMonth(cell, date) ? 'opacity-20' : isToday(cell) ? 'bg-sage text-white font-bold' : 'text-charcoal'}
            `}
          >
            {cell.getDate()}
          </span>
        ))}
      </div>
    </button>
  )
}

export function YearView() {
  const { state, dispatch } = useApp()
  const yearStart = startOfYear(state.currentDate)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i))

  function handleMonthClick(date) {
    dispatch({ type: 'GO_TO_DATE', payload: date })
    dispatch({ type: 'SET_VIEW', payload: 'month' })
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {months.map(month => (
          <MiniMonth
            key={month.toISOString()}
            date={month}
            onMonthClick={handleMonthClick}
          />
        ))}
      </div>
    </div>
  )
}
