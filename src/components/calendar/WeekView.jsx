import { isToday } from 'date-fns'
import { useApp } from '../../store/AppContext'
import { buildWeekRow, WEEKDAY_LABELS, toIsoDate } from '../../utils/dateHelpers'

export function WeekView() {
  const { state, dispatch, todos: { getTodos } } = useApp()
  const { currentDate, selectedDay } = state
  const days = buildWeekRow(currentDate)

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS.map(label => (
          <div key={label} className="text-xs font-medium text-text-muted text-center py-1 uppercase tracking-widest">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map(date => {
          const isoDate = toIsoDate(date)
          const todos = getTodos(isoDate)
          const today = isToday(date)
          const isSelected = selectedDay && toIsoDate(selectedDay) === isoDate

          return (
            <button
              key={isoDate}
              onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
              className={`
                rounded-2xl p-3 flex flex-col gap-2 text-left transition-all
                focus:outline-none focus:ring-1 focus:ring-wine
                ${isSelected ? 'bg-wine/20 ring-1 ring-wine' : 'bg-surface-2 hover:bg-surface-3'}
              `}
              aria-label={`${isoDate}${todos.length ? `, ${todos.length} Aufgaben` : ''}`}
            >
              <span className={`
                text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-xl self-start flex-shrink-0
                ${today
                  ? 'bg-gradient-to-br from-wine-bright to-plum text-white shadow-lg shadow-wine/30'
                  : 'text-text-2'
                }
              `}>
                {date.getDate()}
              </span>

              {todos.length > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  {todos.slice(0, 4).map(todo => (
                    <div
                      key={todo.id}
                      className={`text-xs px-2 py-1 rounded-lg truncate ${todo.completed ? 'line-through opacity-40' : 'text-text-2'}`}
                      style={{
                        background: todo.color + '22',
                        borderLeft: `2px solid ${todo.color}`,
                      }}
                    >
                      {todo.label}
                    </div>
                  ))}
                  {todos.length > 4 && (
                    <span className="text-[11px] text-text-3 px-1">+{todos.length - 4} weitere</span>
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
