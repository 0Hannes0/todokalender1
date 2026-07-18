import { useStorage } from './useStorage'

function uuid() {
  return crypto.randomUUID()
}

const INITIAL = { weekly: {}, monthly: {}, yearly: {} }

export function useGoals() {
  const [goals, setGoals] = useStorage('tk_goals', INITIAL)

  function getGoals(scope, key) {
    return goals[scope]?.[key] || []
  }

  function addGoal(scope, key, label) {
    const newGoal = { id: uuid(), label: label.trim(), completed: false }
    setGoals(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: [...(prev[scope]?.[key] || []), newGoal],
      },
    }))
  }

  function toggleGoal(scope, key, id) {
    setGoals(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: (prev[scope]?.[key] || []).map(g =>
          g.id === id ? { ...g, completed: !g.completed } : g
        ),
      },
    }))
  }

  function deleteGoal(scope, key, id) {
    setGoals(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: (prev[scope]?.[key] || []).filter(g => g.id !== id),
      },
    }))
  }

  return { goals, getGoals, addGoal, toggleGoal, deleteGoal }
}
