import { isSameMonth, isToday } from 'date-fns'
import { toIsoDate } from '../../utils/dateHelpers'
import { useApp } from '../../store/AppContext'

export function DayCell({ date, currentMonth }) {
  const { state, dispatch, todos: { getTodos } } = useApp()
  const isoDate = toIsoDate(date)
  const today = isToday(date)
  const inMonth = isSameMonth(date, currentMonth)
  const isSelected = state.selectedDay && toIsoDate(state.selectedDay) === isoDate
  const todos = getTodos(isoDate)
  const dots = todos.slice(0, 4)
  const overflow = todos.length - 4

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
      className={`
        w-full min-h-20 p-2.5 rounded-xl text-left transition-all flex flex-col gap-1.5 group
        focus:outline-none focus:ring-1 focus:ring-wine
        ${!inMonth ? 'opacity-20' : ''}
        ${isSelected
          ? 'bg-wine/20 ring-1 ring-wine'
          : 'hover:bg-surface-2'
        }
      `}
      aria-label={`${isoDate}${todos.length ? `, ${todos.length} Aufgaben` : ''}`}
    >
      {/* Day number */}
      <span className={`
        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full self-start flex-shrink-0
        ${today
          ? 'bg-gradient-to-br from-wine-bright to-plum text-white font-semibold shadow-lg shadow-wine/30'
          : isSelected ? 'text-accent' : 'text-text-2 group-hover:text-text'
        }
      `}>
        {date.getDate()}
      </span>

      {/* Todo dots */}
      {dots.length > 0 && (
        <div className="flex gap-1 flex-wrap px-0.5">
          {dots.map(todo => (
            <span
              key={todo.id}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: todo.color }}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[9px] text-text-muted self-center leading-none">+{overflow}</span>
          )}
        </div>
      )}
    </button>
  )
}
