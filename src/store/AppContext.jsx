import { createContext, useContext, useReducer } from 'react'
import { addMonths, addWeeks, addYears } from '../utils/dateHelpers'
import { useStorage } from '../hooks/useStorage'

const AppContext = createContext(null)

const initialState = {
  view: 'month',
  currentDate: new Date(),
  selectedDay: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload }
    case 'NAVIGATE': {
      const delta = action.payload
      let next
      if (state.view === 'month') next = addMonths(state.currentDate, delta)
      else if (state.view === 'week') next = addWeeks(state.currentDate, delta)
      else next = addYears(state.currentDate, delta)
      return { ...state, currentDate: next }
    }
    case 'GO_TO_DATE':
      return { ...state, currentDate: action.payload }
    case 'GO_TO_TODAY':
      return { ...state, currentDate: new Date() }
    case 'SELECT_DAY':
      return { ...state, selectedDay: action.payload }
    case 'CLOSE_DAY':
      return { ...state, selectedDay: null }
    default:
      return state
  }
}

function uuid() { return crypto.randomUUID() }

export function AppProvider({ children }) {
  const [uiState, dispatch] = useReducer(reducer, initialState)

  // Shared todo and goal storage — single source of truth
  const [todos, setTodos] = useStorage('tk_todos', {})
  const [goals, setGoals] = useStorage('tk_goals', { weekly: {}, monthly: {}, yearly: {} })

  // Todo operations
  function getTodos(isoDate) { return todos[isoDate] || [] }
  function addTodo(isoDate, label, color) {
    const newTodo = { id: uuid(), label: label.trim(), completed: false, color }
    setTodos(prev => ({ ...prev, [isoDate]: [...(prev[isoDate] || []), newTodo] }))
  }
  function toggleTodo(isoDate, id) {
    setTodos(prev => ({
      ...prev,
      [isoDate]: (prev[isoDate] || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }))
  }
  function deleteTodo(isoDate, id) {
    setTodos(prev => ({ ...prev, [isoDate]: (prev[isoDate] || []).filter(t => t.id !== id) }))
  }

  // Goal operations
  function getGoals(scope, key) { return goals[scope]?.[key] || [] }
  function addGoal(scope, key, label) {
    const newGoal = { id: uuid(), label: label.trim(), completed: false }
    setGoals(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [key]: [...(prev[scope]?.[key] || []), newGoal] },
    }))
  }
  function toggleGoal(scope, key, id) {
    setGoals(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: (prev[scope]?.[key] || []).map(g => g.id === id ? { ...g, completed: !g.completed } : g),
      },
    }))
  }
  function deleteGoal(scope, key, id) {
    setGoals(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [key]: (prev[scope]?.[key] || []).filter(g => g.id !== id) },
    }))
  }

  const value = {
    state: uiState,
    dispatch,
    todos: { getTodos, addTodo, toggleTodo, deleteTodo },
    goals: { getGoals, addGoal, toggleGoal, deleteGoal },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
