import { isToday, isSameDay } from 'date-fns'
import { useApp } from '../../store/AppContext'
import { buildWeekRow, WEEKDAY_LABELS, toIsoDate, toWeekKey } from '../../utils/dateHelpers'
import { useTodos } from '../../hooks/useTodos'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export function WeekView() {
  const { state, dispatch } = useApp()
  const { currentDate, selectedDay } = state
  const { getTodos } = useTodos()
  const days = buildWeekRow(currentDate)

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={label} className="text-xs font-medium text-charcoal-light text-center py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map(date => {
          const isoDate = toIsoDate(date)
          const todos = getTodos(isoDate)
          const today = isToday(date)
          const isSelected = selectedDay && toIsoDate(selectedDay) === isoDate
          const dots = todos.slice(0, 5)
          const overflow = todos.length - 5

          return (
            <button
              key={isoDate}
              onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
              className={`
                rounded-2xl p-3 flex flex-col gap-2 text-left transition-all min-h-40
                hover:bg-cream-dark focus:outline-none focus:ring-2 focus:ring-sage/40
                ${isSelected ? 'bg-sage-light ring-2 ring-sage' : 'bg-cream-dark/40'}
              `}
              aria-label={`${isoDate}${todos.length ? `, ${todos.length} Aufgaben` : ''}`}
            >
              {/* Day number */}
              <span
                className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full self-start
                  ${today ? 'bg-sage text-white' : 'text-charcoal'}`}
              >
                {date.getDate()}
              </span>

              {/* Todo previews */}
              {todos.length > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  {todos.slice(0, 3).map(todo => (
                    <div
                      key={todo.id}
                      className={`text-xs px-2 py-1 rounded-lg truncate ${todo.completed ? 'line-through text-charcoal-light' : 'text-charcoal'}`}
                      style={{ backgroundColor: todo.color + '33', borderLeft: `2px solid ${todo.color}` }}
                    >
                      {todo.label}
                    </div>
                  ))}
                  {todos.length > 3 && (
                    <span className="text-[11px] text-charcoal-light px-1">+{todos.length - 3} weitere</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
