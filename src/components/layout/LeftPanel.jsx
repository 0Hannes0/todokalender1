import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { toIsoDate } from '../../utils/dateHelpers'
import { TodoList } from '../todos/TodoList'
import { TodoForm } from '../todos/TodoForm'
import { MiniCalendar } from '../calendar/MiniCalendar'
import { GoalsPanel } from '../goals/GoalsPanel'

export function LeftPanel({ mobileSection }) {
  const { state, dispatch, todos: { getTodos, addTodo, toggleTodo, deleteTodo } } = useApp()
  const { selectedDay } = state

  const today = new Date()
  const activeDay = selectedDay || today
  const isoDate = toIsoDate(activeDay)
  const todos = getTodos(isoDate)
  const done = todos.filter(t => t.completed).length

  const dayLabel = format(activeDay, "EEEE", { locale: de })
  const dateLabel = format(activeDay, "d. MMMM", { locale: de })

  // On mobile, mobileSection is 'today' or 'goals' — render only that section full-screen
  if (mobileSection === 'goals') {
    return (
      <div className="min-h-full bg-bg pb-6">
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-base font-semibold text-text">Ziele</h2>
        </div>
        <GoalsPanel />
      </div>
    )
  }

  if (mobileSection === 'today') {
    return (
      <div className="min-h-full bg-bg flex flex-col">
        {/* Mini calendar */}
        <div className="bg-surface border-b border-border flex-shrink-0">
          <MiniCalendar />
        </div>

        {/* Day todos */}
        <div className="flex-1 flex flex-col px-4 pt-4 bg-bg">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <p className="text-[11px] font-medium text-text-3 uppercase tracking-wider">{dayLabel}</p>
              <p className="text-base font-semibold text-text">{dateLabel}</p>
            </div>
            {todos.length > 0 && (
              <span className="text-[11px] text-text-3">{done}/{todos.length}</span>
            )}
          </div>

          {todos.length > 0 && (
            <div className="h-0.5 bg-surface-3 rounded-full mt-2 mb-3">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(done / todos.length) * 100}%` }}
              />
            </div>
          )}

          <div className="flex-1 pb-2">
            <TodoList
              todos={todos}
              onToggle={id => toggleTodo(isoDate, id)}
              onDelete={id => deleteTodo(isoDate, id)}
            />
          </div>

          <div className="py-3 border-t border-border mt-2">
            <TodoForm onAdd={(label, color) => addTodo(isoDate, label, color)} />
          </div>
        </div>
      </div>
    )
  }

  // Desktop sidebar (no mobileSection prop)
  return (
    <div className="h-full flex flex-col bg-surface border-r border-border overflow-y-auto">
      {/* App name */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-[13px] font-semibold text-text-3 uppercase tracking-widest">TodoKalender</h1>
      </div>

      {/* Mini calendar */}
      <div className="flex-shrink-0">
        <MiniCalendar />
      </div>

      <div className="h-px bg-border mx-4 flex-shrink-0" />

      {/* Day todos */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-baseline justify-between mb-1">
          <div>
            <p className="text-[11px] font-medium text-text-3 uppercase tracking-wider">{dayLabel}</p>
            <p className="text-base font-semibold text-text">{dateLabel}</p>
          </div>
          {todos.length > 0 && (
            <span className="text-[11px] text-text-3">{done}/{todos.length}</span>
          )}
        </div>

        {todos.length > 0 && (
          <div className="h-0.5 bg-surface-3 rounded-full mt-2 mb-3">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(done / todos.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <TodoList
          todos={todos}
          onToggle={id => toggleTodo(isoDate, id)}
          onDelete={id => deleteTodo(isoDate, id)}
        />
      </div>

      {/* Add todo */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <TodoForm onAdd={(label, color) => addTodo(isoDate, label, color)} />
      </div>

      <div className="h-px bg-border mx-4 flex-shrink-0" />

      {/* Goals */}
      <div className="flex-shrink-0 pb-4">
        <GoalsPanel />
      </div>
    </div>
  )
}
