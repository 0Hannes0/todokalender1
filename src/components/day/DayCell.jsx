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
  const dots = todos.slice(0, 5)

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
      className={`
        w-full min-h-[90px] p-2 text-left flex flex-col gap-1 transition-all group
        border-b border-r border-border
        focus:outline-none focus:z-10 focus:ring-1 focus:ring-inset focus:ring-accent
        ${!inMonth ? 'bg-surface-2' : 'bg-surface hover:bg-accent-soft/30'}
        ${isSelected ? 'ring-1 ring-inset ring-accent bg-accent-soft/40' : ''}
      `}
    >
      <span className={`
        text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
        ${today ? 'bg-accent text-white' : !inMonth ? 'text-text-4' : isSelected ? 'text-accent' : 'text-text-2 group-hover:text-text'}
      `}>
        {date.getDate()}
      </span>

      {dots.length > 0 && (
        <div className="flex flex-col gap-0.5 w-full">
          {dots.map(todo => (
            <div
              key={todo.id}
              className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate max-w-full ${todo.completed ? 'opacity-40 line-through' : ''}`}
              style={{ background: todo.color + '28', color: todo.color, borderLeft: `2px solid ${todo.color}` }}
            >
              {todo.label}
            </div>
          ))}
          {todos.length > 5 && (
            <span className="text-[10px] text-text-3 px-1">+{todos.length - 5} mehr</span>
          )}
        </div>
      )}
    </button>
  )
}
