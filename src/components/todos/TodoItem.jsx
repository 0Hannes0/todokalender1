export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors hover:bg-cream ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Color accent bar */}
      <div
        className="w-1 h-5 rounded-full flex-shrink-0"
        style={{ backgroundColor: todo.color }}
      />

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Als offen markieren' : 'Als erledigt markieren'}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sage/50`}
        style={{
          borderColor: todo.completed ? todo.color : '#D4DFCF',
          backgroundColor: todo.completed ? todo.color : 'transparent',
        }}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Label */}
      <span
        className={`flex-1 text-sm text-charcoal ${todo.completed ? 'line-through text-charcoal-light' : ''}`}
      >
        {todo.label}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Aufgabe löschen"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-rose-dark focus:opacity-100 focus:outline-none rounded-full p-0.5"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
