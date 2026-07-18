export function GoalItem({ goal, onToggle, onDelete, progress }) {
  const isCounter = goal.targetCount != null
  const pct = isCounter ? Math.min(100, Math.round((progress / goal.targetCount) * 100)) : null

  return (
    <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl group hover:bg-surface-2 active:bg-surface-2 transition-colors ${!isCounter && goal.completed ? 'opacity-50' : ''}`}>
      {/* Checkbox (only for non-counter goals) */}
      {isCounter ? (
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 -ml-1.5">
          <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
            <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
              stroke="#8b1a4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              fill={pct >= 100 ? '#8b1a4a' : 'transparent'} />
          </svg>
        </div>
      ) : (
        <button onClick={() => onToggle(goal.id)}
          className="w-8 h-8 flex items-center justify-center flex-shrink-0 -ml-1.5 focus:outline-none">
          <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
            <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
              stroke="#8b1a4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              fill={goal.completed ? '#8b1a4a' : 'transparent'} />
          </svg>
        </button>
      )}

      <div className="flex-1 min-w-0">
        <span className={`text-[12px] ${!isCounter && goal.completed ? 'line-through text-text-3' : 'text-text-2'}`}>
          {goal.label}
        </span>
        {isCounter && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#8b1a4a' }} />
            </div>
            <span className="text-[11px] text-text-3 flex-shrink-0">{progress}/{goal.targetCount}</span>
          </div>
        )}
      </div>

      <button onClick={() => onDelete(goal.id)} aria-label="Löschen"
        className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity text-text-4 hover:text-red-400 focus:opacity-100 focus:outline-none w-8 h-8 flex items-center justify-center flex-shrink-0">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M8.5 2.5l-6 6M2.5 2.5l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>
    </div>
  )
}
