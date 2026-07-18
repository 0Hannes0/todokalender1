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

  // Default active tab mirrors current calendar view
  const defaultScope = SCOPES.find(s => s.view === view)?.key || 'monthly'
  const [activeScope, setActiveScope] = useState(defaultScope)

  // Sync tab when view changes from outside
  const scopeKey = getKey(activeScope, currentDate)

  const goals = getGoals(activeScope, scopeKey)

  return (
    <div className="p-4">
      {/* Section label */}
      <p className="text-xs font-medium text-charcoal-light uppercase tracking-wide mb-3">Ziele</p>

      {/* Scope tabs */}
      <div className="flex rounded-lg bg-cream p-0.5 gap-0.5 mb-4">
        {SCOPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveScope(key)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
              activeScope === key
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <GoalList
        goals={goals}
        onToggle={id => toggleGoal(activeScope, scopeKey, id)}
        onDelete={id => deleteGoal(activeScope, scopeKey, id)}
      />

      {/* Add goal */}
      <GoalForm onAdd={label => addGoal(activeScope, scopeKey, label)} />
    </div>
  )
}
