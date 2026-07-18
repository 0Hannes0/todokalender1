export function GoalItem({ goal, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl group hover:bg-surface-2 active:bg-surface-2 transition-colors ${goal.completed ? 'opacity-50' : ''}`}>
      {/* Larger touch target wrapping checkbox */}
      <button onClick={() => onToggle(goal.id)}
        className="w-8 h-8 flex items-center justify-center flex-shrink-0 -ml-1.5 focus:outline-none">
        <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{ borderColor: '#8b1a4a', backgroundColor: goal.completed ? '#8b1a4a' : 'transparent' }}>
          {goal.completed && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      </button>
      <span className={`flex-1 text-[12px] ${goal.completed ? 'line-through text-text-3' : 'text-text-2'}`}>{goal.label}</span>
      <button onClick={() => onDelete(goal.id)} aria-label="Löschen"
        className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:opacity-100 focus:outline-none w-8 h-8 flex items-center justify-center flex-shrink-0">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M8.5 2.5l-6 6M2.5 2.5l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>
    </div>
  )
}
