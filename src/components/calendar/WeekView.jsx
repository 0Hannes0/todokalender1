import { isToday } from 'date-fns'
import { useApp } from '../../store/AppContext'
import { buildWeekRow, WEEKDAY_LABELS, toIsoDate } from '../../utils/dateHelpers'

export function WeekView() {
  const { state, dispatch, todos: { getTodos } } = useApp()
  const { currentDate, selectedDay } = state
  const days = buildWeekRow(currentDate)

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((date, i) => {
          const today = isToday(date)
          const iso = toIsoDate(date)
          const isSelected = selectedDay && toIsoDate(selectedDay) === iso
          return (
            <div key={iso} className="text-center py-3 border-r border-border last:border-r-0">
              <p className="text-[11px] font-medium text-text-3 uppercase tracking-wider">{WEEKDAY_LABELS[i]}</p>
              <button
                onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
                className={`mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold transition-all
                  ${today ? 'bg-accent text-white' : isSelected ? 'bg-accent-soft text-accent ring-1 ring-accent' : 'text-text hover:bg-surface-3'}`}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map(date => {
          const iso = toIsoDate(date)
          const todos = getTodos(iso)
          const isSelected = selectedDay && toIsoDate(selectedDay) === iso
          return (
            <button key={iso} onClick={() => dispatch({ type: 'SELECT_DAY', payload: date })}
              className={`p-2 border-r border-border last:border-r-0 flex flex-col gap-1 text-left transition-colors
                ${isSelected ? 'bg-accent-soft/40' : 'hover:bg-accent-soft/20'}`}>
              {todos.map(todo => (
                <div key={todo.id}
                  className={`text-[11px] px-2 py-1 rounded-lg truncate ${todo.completed ? 'opacity-40 line-through' : ''}`}
                  style={{ background: todo.color + '28', color: todo.color, borderLeft: `2px solid ${todo.color}` }}>
                  {todo.label}
                </div>
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
