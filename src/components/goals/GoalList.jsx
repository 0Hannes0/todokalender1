import { GoalItem } from './GoalItem'

export function GoalList({ goals, onToggle, onDelete }) {
  if (goals.length === 0) {
    return (
      <div className="py-5 text-center">
        <p className="text-xs text-text-muted">Noch keine Ziele</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col">
      {goals.map(goal => (
        <GoalItem key={goal.id} goal={goal} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  )
}
