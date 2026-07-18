import { TodoItem } from './TodoItem'

export function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  if (todos.length === 0) {
    return <div className="py-4 text-center text-[12px] text-text-4">Keine Aufgaben</div>
  }
  return (
    <div className="flex flex-col">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  )
}
