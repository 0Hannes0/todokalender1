import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { toWeekKey, toMonthKey, toYearKey } from '../../utils/dateHelpers'
import { GoalList } from './GoalList'
import { GoalForm } from './GoalForm'

const SCOPES = [
  { key: 'weekly',  label: 'Woche' },
  { key: 'monthly', label: 'Monat' },
  { key: 'yearly',  label: 'Jahr'  },
]

function getKey(scope, date) {
  if (scope === 'weekly')  return toWeekKey(date)
  if (scope === 'monthly') return toMonthKey(date)
  return toYearKey(date)
}

export function GoalsPanel() {
  const { state, goals: { getGoals, addGoal, toggleGoal, deleteGoal, getGoalProgress } } = useApp()
  const [activeScope, setActiveScope] = useState('monthly')
  const scopeKey = getKey(activeScope, state.currentDate)
  const goals = getGoals(activeScope, scopeKey)

  return (
    <div className="px-4 pt-4">
      <p className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-2">Ziele</p>
      <div className="flex bg-surface-3 rounded-lg p-0.5 gap-0.5 mb-3">
        {SCOPES.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveScope(key)}
            className={`flex-1 text-[11px] font-medium py-1 rounded-md transition-all
              ${activeScope === key ? 'bg-white text-accent shadow-sm' : 'text-text-3 hover:text-text-2'}`}>
            {label}
          </button>
        ))}
      </div>
      <GoalList goals={goals}
        onToggle={id => toggleGoal(activeScope, scopeKey, id)}
        onDelete={id => deleteGoal(activeScope, scopeKey, id)}
        getProgress={g => getGoalProgress(activeScope, scopeKey, g)} />
      <GoalForm onAdd={(label, targetCount, keyword) => addGoal(activeScope, scopeKey, label, targetCount, keyword)} />
    </div>
  )
}
