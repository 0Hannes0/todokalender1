import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { toIsoDate } from '../../utils/dateHelpers'
import { Modal } from '../ui/Modal'
import { TodoList } from '../todos/TodoList'
import { TodoForm } from '../todos/TodoForm'

export function DayDetailPanel() {
  const { state, dispatch, todos: { getTodos, addTodo, toggleTodo, deleteTodo } } = useApp()
  const { selectedDay } = state
  const isoDate = toIsoDate(selectedDay)
  const todos = getTodos(isoDate)
  const done = todos.filter(t => t.completed).length

  const title = format(selectedDay, "EEEE, d. MMMM yyyy", { locale: de })

  return (
    <Modal onClose={() => dispatch({ type: 'CLOSE_DAY' })} title={title}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-text capitalize leading-tight">{title}</h2>
            <p className="text-xs text-text-3 mt-1">
              {todos.length === 0
                ? 'Noch keine Aufgaben'
                : `${done} von ${todos.length} erledigt`}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_DAY' })}
            aria-label="Schließen"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-3 transition-colors text-text-3 hover:text-text focus:outline-none flex-shrink-0 mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="mt-3 h-0.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-wine to-plum-light rounded-full transition-all duration-500"
              style={{ width: `${(done / todos.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border mx-5" />

      {/* Todo list */}
      <div className="px-3 pt-2 pb-1 max-h-64 overflow-y-auto">
        <TodoList
          todos={todos}
          onToggle={id => toggleTodo(isoDate, id)}
          onDelete={id => deleteTodo(isoDate, id)}
        />
      </div>

      {/* Add form */}
      <div className="px-4 pb-4 pt-2">
        <TodoForm onAdd={(label, color) => addTodo(isoDate, label, color)} />
      </div>
    </Modal>
  )
}
