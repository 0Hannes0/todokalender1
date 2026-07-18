export function GoalItem({ goal, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 px-2 py-2 rounded-xl group hover:bg-cream transition-colors ${goal.completed ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(goal.id)}
        aria-label={goal.completed ? 'Als offen markieren' : 'Als erreicht markieren'}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose/50`}
        style={{
          borderColor: goal.completed ? '#C9A9A6' : '#D4DFCF',
          backgroundColor: goal.completed ? '#C9A9A6' : 'transparent',
        }}
      >
        {goal.completed && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Label */}
      <span className={`flex-1 text-sm text-charcoal ${goal.completed ? 'line-through text-charcoal-light' : ''}`}>
        {goal.label}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(goal.id)}
        aria-label="Ziel löschen"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-rose-dark focus:opacity-100 focus:outline-none rounded-full p-0.5"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
