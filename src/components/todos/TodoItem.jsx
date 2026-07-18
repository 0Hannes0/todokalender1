export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 px-2 py-2.5 rounded-xl group transition-all hover:bg-surface-3/50 ${todo.completed ? 'opacity-50' : ''}`}>
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Als offen markieren' : 'Als erledigt markieren'}
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all focus:outline-none border-2"
        style={{
          borderColor: todo.color,
          backgroundColor: todo.completed ? todo.color : 'transparent',
        }}
      >
        {todo.completed && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Label */}
      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-text-3' : 'text-text-2'}`}>
        {todo.label}
      </span>

      {/* Color dot */}
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.color }} />

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Löschen"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-accent focus:opacity-100 focus:outline-none"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M10 3L3 10M3 3l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
