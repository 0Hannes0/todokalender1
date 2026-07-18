import { TodoItem } from './TodoItem'

export function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-charcoal-light">Noch keine Aufgaben.</p>
        <p className="text-xs text-muted mt-1">Füge deine erste Aufgabe hinzu.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
