import { GoalItem } from './GoalItem'

export function GoalList({ goals, onToggle, onDelete, getProgress }) {
  if (goals.length === 0) return <div className="py-3 text-center text-[11px] text-text-4">Noch keine Ziele</div>
  return <div className="flex flex-col">{goals.map(g => <GoalItem key={g.id} goal={g} onToggle={onToggle} onDelete={onDelete} progress={getProgress ? getProgress(g) : null} />)}</div>
}
