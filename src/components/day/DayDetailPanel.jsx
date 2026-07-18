import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useApp } from '../../store/AppContext'
import { toIsoDate } from '../../utils/dateHelpers'
import { Modal } from '../ui/Modal'
import { TodoList } from '../todos/TodoList'
import { TodoForm } from '../todos/TodoForm'
import { useTodos } from '../../hooks/useTodos'

export function DayDetailPanel() {
  const { state, dispatch } = useApp()
  const { selectedDay } = state
  const isoDate = toIsoDate(selectedDay)
  const { getTodos, addTodo, toggleTodo, deleteTodo } = useTodos()
  const todos = getTodos(isoDate)

  const title = format(selectedDay, "EEEE, d. MMMM yyyy", { locale: de })

  function handleClose() {
    dispatch({ type: 'CLOSE_DAY' })
  }

  return (
    <Modal onClose={handleClose} title={title}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cream-dark">
        <div>
          <h2 className="text-base font-semibold text-charcoal capitalize">{title}</h2>
          <p className="text-xs text-charcoal-light mt-0.5">
            {todos.length === 0
              ? 'Keine Aufgaben'
              : `${todos.filter(t => t.completed).length} von ${todos.length} erledigt`}
          </p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Schließen"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-dark transition-colors text-charcoal-light focus:outline-none focus:ring-2 focus:ring-sage/40"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Todo list */}
      <div className="px-3 pt-3 max-h-72 overflow-y-auto">
        <TodoList
          todos={todos}
          onToggle={id => toggleTodo(isoDate, id)}
          onDelete={id => deleteTodo(isoDate, id)}
        />
      </div>

      {/* Add form */}
      <div className="px-4 py-4 border-t border-cream-dark">
        <TodoForm onAdd={(label, color) => addTodo(isoDate, label, color)} />
      </div>
    </Modal>
  )
}
