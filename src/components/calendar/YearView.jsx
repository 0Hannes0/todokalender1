import { startOfYear, addMonths, startOfMonth, startOfWeek, addDays, isSameMonth, isToday, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { MONTH_NAMES_SHORT } from '../../utils/dateHelpers'

function MiniMonth({ date, onMonthClick }) {
  const monthStart = startOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const cells = Array.from({ length: 35 }, (_, i) => addDays(gridStart, i))
  return (
    <button onClick={() => onMonthClick(date)}
      className="p-3 rounded-2xl bg-surface hover:bg-accent-soft/40 border border-border hover:border-accent-mid transition-all text-left focus:outline-none"
      aria-label={format(date, 'MMMM yyyy', { locale: de })}>
      <p className="text-xs font-semibold text-text mb-2">{MONTH_NAMES_SHORT[date.getMonth()]}</p>
      <div className="grid grid-cols-7 gap-px">
        {['M','D','M','D','F','S','S'].map((d, i) => (
          <span key={i} className="text-[8px] text-center text-text-4 font-medium">{d}</span>
        ))}
        {cells.map((cell, i) => (
          <span key={i} className={`text-[9px] text-center leading-4 rounded-full w-4 h-4 mx-auto flex items-center justify-center
            ${!isSameMonth(cell, date) ? 'opacity-0' : isToday(cell) ? 'bg-accent text-white font-bold' : 'text-text-2'}`}>
            {isSameMonth(cell, date) ? cell.getDate() : ''}
          </span>
        ))}
      </div>
    </button>
  )
}

export function YearView() {
  const { state, dispatch } = useApp()
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(state.currentDate), i))
  function handleMonthClick(date) {
    dispatch({ type: 'GO_TO_DATE', payload: date })
    dispatch({ type: 'SET_VIEW', payload: 'month' })
  }
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {months.map(m => <MiniMonth key={m.toISOString()} date={m} onMonthClick={handleMonthClick} />)}
      </div>
    </div>
  )
}
