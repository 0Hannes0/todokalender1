import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { toIsoDate } from '../../utils/dateHelpers'
import { Modal } from '../ui/Modal'
import { TodoList } from '../todos/TodoList'
import { TodoForm } from '../todos/TodoForm'

export function DayDetailPanel() {
  const { state, dispatch, todos: { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo } } = useApp()
  const { selectedDay } = state
  const isoDate = toIsoDate(selectedDay)
  const todos = getTodos(isoDate)
  const done = todos.filter(t => t.completed).length

  const dayLabel = format(selectedDay, "EEEE", { locale: de })
  const dateLabel = format(selectedDay, "d. MMMM yyyy", { locale: de })

  return (
    <Modal onClose={() => dispatch({ type: 'CLOSE_DAY' })} title={dateLabel}>
      {/* Header */}
      <div className="px-5 pt-3 sm:pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">{dayLabel}</p>
            <h2 className="text-lg font-semibold text-text mt-0.5">{dateLabel}</h2>
            <p className="text-xs text-text-3 mt-1">
              {todos.length === 0
                ? 'Noch keine Aufgaben'
                : `${done} von ${todos.length} erledigt`}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_DAY' })}
            aria-label="Schließen"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 active:bg-surface-3 transition-colors text-text-3 hover:text-text focus:outline-none flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="mt-3 h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(done / todos.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Todo list — scrollable */}
      <div className="px-3 pt-2 pb-1 overflow-y-auto flex-1" style={{ maxHeight: '50dvh' }}>
        <TodoList
          todos={todos}
          onToggle={id => toggleTodo(isoDate, id)}
          onDelete={id => deleteTodo(isoDate, id)}
          onUpdate={(id, changes) => updateTodo(isoDate, id, changes)}
        />
      </div>

      {/* Add form */}
      <div className="px-4 pb-4 pt-2 border-t border-border flex-shrink-0 safe-bottom">
        <TodoForm onAdd={(label, color) => addTodo(isoDate, label, color)} />
      </div>
    </Modal>
  )
}
