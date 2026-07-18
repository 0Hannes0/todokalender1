import { createContext, useContext, useReducer, useState, useEffect, useRef } from 'react'
import { addMonths, addWeeks, addYears } from '../utils/dateHelpers'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useLoginGate } from './LoginGateContext'

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

// --- Supabase helpers ---
async function loadUserData(uid) {
  const { data, error } = await supabase
    .from('user_data')
    .select('todos, goals')
    .eq('user_id', uid)
    .single()
  if (error && error.code !== 'PGRST116') console.error('load error', error)
  return data || null
}

async function saveUserData(uid, todos, goals) {
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: uid, todos, goals, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) console.error('save error', error)
}

// --- localStorage fallback (for when not logged in) ---
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const { openLogin } = useLoginGate()
  const [uiState, dispatch] = useReducer(reducer, initialState)

  const [todos, setTodosRaw] = useState(() => lsGet('tk_todos', {}))
  const [goals, setGoalsRaw] = useState(() => lsGet('tk_goals', { weekly: {}, monthly: {}, yearly: {} }))
  const [loaded, setLoaded] = useState(false)

  // Save timer ref for debounced remote writes
  const saveTimer = useRef(null)

  // Load from Supabase when user logs in, clear when logs out
  useEffect(() => {
    if (!user) {
      // Clear all data on logout
      setTodosRaw({})
      setGoalsRaw({ weekly: {}, monthly: {}, yearly: {} })
      dispatch({ type: 'CLOSE_DAY' })
      setLoaded(true)
      return
    }
    setLoaded(false)
    loadUserData(user.id).then(data => {
      if (data) {
        setTodosRaw(data.todos || {})
        setGoalsRaw(data.goals || { weekly: {}, monthly: {}, yearly: {} })
      }
      setLoaded(true)
    })
  }, [user?.id])

  // Debounced sync to Supabase (500ms after last change)
  function persist(newTodos, newGoals) {
    if (user) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveUserData(user.id, newTodos, newGoals), 500)
    } else {
      lsSet('tk_todos', newTodos)
      lsSet('tk_goals', newGoals)
    }
  }

  function setTodos(updater) {
    setTodosRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, goals)
      return next
    })
  }

  function setGoals(updater) {
    setGoalsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, next)
      return next
    })
  }

  // Todo operations
  function getTodos(isoDate) { return todos[isoDate] || [] }
  function addTodo(isoDate, label, color) {
    if (!user) { openLogin(); return }
    const newTodo = { id: uuid(), label: label.trim(), completed: false, color }
    setTodos(prev => ({ ...prev, [isoDate]: [...(prev[isoDate] || []), newTodo] }))
  }
  function toggleTodo(isoDate, id) {
    if (!user) { openLogin(); return }
    setTodos(prev => ({
      ...prev,
      [isoDate]: (prev[isoDate] || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }))
  }
  function deleteTodo(isoDate, id) {
    if (!user) { openLogin(); return }
    setTodos(prev => ({ ...prev, [isoDate]: (prev[isoDate] || []).filter(t => t.id !== id) }))
  }
  function updateTodo(isoDate, id, changes) {
    if (!user) { openLogin(); return }
    setTodos(prev => ({
      ...prev,
      [isoDate]: (prev[isoDate] || []).map(t => t.id === id ? { ...t, ...changes } : t),
    }))
  }

  // Goal operations
  function getGoals(scope, key) { return goals[scope]?.[key] || [] }
  function addGoal(scope, key, label) {
    if (!user) { openLogin(); return }
    const newGoal = { id: uuid(), label: label.trim(), completed: false }
    setGoals(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [key]: [...(prev[scope]?.[key] || []), newGoal] },
    }))
  }
  function toggleGoal(scope, key, id) {
    if (!user) { openLogin(); return }
    setGoals(prev => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: (prev[scope]?.[key] || []).map(g => g.id === id ? { ...g, completed: !g.completed } : g),
      },
    }))
  }
  function deleteGoal(scope, key, id) {
    if (!user) { openLogin(); return }
    setGoals(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [key]: (prev[scope]?.[key] || []).filter(g => g.id !== id) },
    }))
  }

  const value = {
    state: uiState,
    dispatch,
    loaded,
    todos: { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo },
    goals: { getGoals, addGoal, toggleGoal, deleteGoal },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
