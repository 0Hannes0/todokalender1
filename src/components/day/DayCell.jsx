import { isSameMonth, isToday } from 'date-fns'
import { toIsoDate } from '../../utils/dateHelpers'
import { useApp } from '../../store/AppContext'
import { useTodos } from '../../hooks/useTodos'

export function DayCell({ date, currentMonth }) {
  const { state, dispatch } = useApp()
  const { getTodos } = useTodos()
  const isoDate = toIsoDate(date)
  const today = isToday(date)
  const inMonth = isSameMonth(date, currentMonth)
  const isSelected = state.selectedDay && toIsoDate(state.selectedDay) === isoDate

  const todos = getTodos(isoDate)
  const dots = todos.slice(0, 3)
  const overflow = todos.length - 3

  function handleClick() {
    dispatch({ type: 'SELECT_DAY', payload: date })
  }

  return (
    <button
      onClick={handleClick}
      className={`
        w-full aspect-square sm:aspect-auto sm:min-h-16 p-1.5 rounded-xl text-left transition-all
        flex flex-col gap-0.5 group
        hover:bg-cream-dark
        focus:outline-none focus:ring-2 focus:ring-sage/40
        ${!inMonth ? 'opacity-30' : ''}
        ${isSelected ? 'bg-sage-light ring-2 ring-sage' : ''}
      `}
      aria-label={`${isoDate}${todos.length ? `, ${todos.length} Aufgaben` : ''}`}
    >
      {/* Day number */}
      <span
        className={`
          text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full self-start
          ${today ? 'bg-sage text-white font-semibold' : 'text-charcoal group-hover:text-charcoal'}
        `}
      >
        {date.getDate()}
      </span>

      {/* Color dots */}
      {dots.length > 0 && (
        <div className="flex gap-1 px-0.5 flex-wrap">
          {dots.map(todo => (
            <span
              key={todo.id}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: todo.color }}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[10px] text-charcoal-light leading-none self-center">+{overflow}</span>
          )}
        </div>
      )}
    </button>
  )
}
