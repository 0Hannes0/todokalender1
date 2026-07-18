export function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl group transition-colors hover:bg-surface-2 ${todo.completed ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(todo.id)}
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none"
        style={{ borderColor: todo.color, backgroundColor: todo.completed ? todo.color : 'transparent' }}>
        {todo.completed && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span className={`flex-1 text-[13px] ${todo.completed ? 'line-through text-text-3' : 'text-text'}`}>{todo.label}</span>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: todo.color }} />
      <button onClick={() => onDelete(todo.id)} aria-label="Löschen"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:opacity-100 focus:outline-none">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
