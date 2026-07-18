import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { toWeekKey, toMonthKey, toYearKey } from '../../utils/dateHelpers'
import { GoalList } from './GoalList'
import { GoalForm } from './GoalForm'

const SCOPES = [
  { key: 'weekly',  label: 'Woche',  view: 'week'  },
  { key: 'monthly', label: 'Monat',  view: 'month' },
  { key: 'yearly',  label: 'Jahr',   view: 'year'  },
]

function getKey(scope, date) {
  if (scope === 'weekly')  return toWeekKey(date)
  if (scope === 'monthly') return toMonthKey(date)
  return toYearKey(date)
}

export function GoalsPanel() {
  const { state, goals: { getGoals, addGoal, toggleGoal, deleteGoal } } = useApp()
  const { currentDate, view } = state

  const defaultScope = SCOPES.find(s => s.view === view)?.key || 'monthly'
  const [activeScope, setActiveScope] = useState(defaultScope)
  const scopeKey = getKey(activeScope, currentDate)
  const goals = getGoals(activeScope, scopeKey)

  return (
    <div className="px-4">
      {/* Scope tabs */}
      <div className="flex gap-0.5 mb-3 bg-surface-3 rounded-xl p-1">
        {SCOPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveScope(key)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-all ${
              activeScope === key
                ? 'bg-wine text-text shadow-sm'
                : 'text-text-3 hover:text-text-2'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <GoalList
        goals={goals}
        onToggle={id => toggleGoal(activeScope, scopeKey, id)}
        onDelete={id => deleteGoal(activeScope, scopeKey, id)}
      />

      <GoalForm onAdd={label => addGoal(activeScope, scopeKey, label)} />
    </div>
  )
}
