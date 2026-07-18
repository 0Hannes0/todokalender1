import { TodoItem } from './TodoItem'

export function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="py-7 text-center">
        <div className="w-10 h-10 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 9h8M5 5h8M5 13h5" stroke="#5a4050" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm text-text-3">Noch keine Aufgaben</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  )
}
