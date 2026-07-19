import { createContext, useContext, useReducer, useState, useEffect, useRef } from 'react'
import { addMonths, addWeeks, addYears, toWeekKey } from '../utils/dateHelpers'
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
    .select('todos, goals, habits')
    .eq('user_id', uid)
    .single()
  if (error && error.code !== 'PGRST116') console.error('load error', error)
  return data || null
}

async function saveUserData(uid, todos, goals, habits) {
  // Try with habits first, fall back without if column doesn't exist yet
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: uid, todos, goals, habits, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) {
    console.warn('save with habits failed, retrying without:', error.message)
    const { error: error2 } = await supabase
      .from('user_data')
      .upsert({ user_id: uid, todos, goals, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error2) console.error('save error:', error2)
  }
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
  const [goals, setGoalsRaw] = useState(() => lsGet('tk_goals', { daily: {}, weekly: {}, monthly: {}, yearly: {} }))
  const [habits, setHabitsRaw] = useState(() => lsGet('tk_habits', {}))
  const [loaded, setLoaded] = useState(false)

  // Save timer ref for debounced remote writes
  const saveTimer = useRef(null)

  // Load from Supabase when user logs in, clear when logs out
  useEffect(() => {
    if (!user) {
      setTodosRaw({})
      setGoalsRaw({ daily: {}, weekly: {}, monthly: {}, yearly: {} })
      setHabitsRaw({})
      dispatch({ type: 'CLOSE_DAY' })
      setLoaded(true)
      return
    }
    setLoaded(false)
    loadUserData(user.id).then(data => {
      if (data) {
        setTodosRaw(data.todos || {})
        setGoalsRaw(data.goals || { daily: {}, weekly: {}, monthly: {}, yearly: {} })
        setHabitsRaw(data.habits || {})
      }
      // If data is null (no row yet), keep whatever is in state — don't wipe it
      setLoaded(true)
    }).catch(err => {
      console.error('load failed, keeping existing data:', err)
      setLoaded(true)
    })
  }, [user?.id])

  // Debounced sync to Supabase (500ms after last change)
  function persist(newTodos, newGoals, newHabits) {
    if (user) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveUserData(user.id, newTodos, newGoals, newHabits), 500)
    } else {
      lsSet('tk_todos', newTodos)
      lsSet('tk_goals', newGoals)
      lsSet('tk_habits', newHabits)
    }
  }

  function setTodos(updater) {
    setTodosRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, goals, habits)
      return next
    })
  }

  function setGoals(updater) {
    setGoalsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, next, habits)
      return next
    })
  }

  function setHabits(updater) {
    setHabitsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, goals, next)
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
  function addGoal(scope, key, label, targetCount = null, keyword = null) {
    if (!user) { openLogin(); return }
    const newGoal = {
      id: uuid(),
      label: label.trim(),
      completed: false,
      ...(targetCount ? { targetCount: Number(targetCount), keyword: (keyword || '').trim().toLowerCase() } : {}),
    }
    setGoals(prev => ({
      ...prev,
      [scope]: { ...prev[scope], [key]: [...(prev[scope]?.[key] || []), newGoal] },
    }))
  }

  // Returns how many completed todos in the scope's date range match the goal keyword
  function getGoalProgress(scope, scopeKey, goal) {
    if (!goal.targetCount || !goal.keyword) return null
    const kw = goal.keyword.toLowerCase()
    let count = 0
    const entries = Object.entries(todos)
    for (const [isoDate, dayTodos] of entries) {
      // Check if this date belongs to the scope
      let belongs = false
      if (scope === 'daily')   belongs = isoDate === scopeKey
      else if (scope === 'monthly') belongs = isoDate.startsWith(scopeKey)
      else if (scope === 'yearly') belongs = isoDate.startsWith(scopeKey)
      else if (scope === 'weekly') {
        belongs = toWeekKey(new Date(isoDate)) === scopeKey
      }
      if (belongs) {
        count += dayTodos.filter(t => t.completed && t.label.toLowerCase().includes(kw)).length
      }
    }
    return count
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

  // Habit operations
  // habits structure: { [monthKey]: { habitList: [{id, emoji, label}], log: { [habitId]: { [day]: bool } } } }
  function getHabits(monthKey) {
    return habits[monthKey]?.habitList || []
  }
  function getLog(monthKey, habitId) {
    return habits[monthKey]?.log?.[habitId] || {}
  }
  function addHabit(monthKey, emoji, label) {
    if (!user) { openLogin(); return }
    const newHabit = { id: uuid(), emoji, label }
    setHabits(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        habitList: [...(prev[monthKey]?.habitList || []), newHabit],
        log: prev[monthKey]?.log || {},
      },
    }))
  }
  function deleteHabit(monthKey, habitId) {
    if (!user) { openLogin(); return }
    setHabits(prev => {
      const m = prev[monthKey] || {}
      const newLog = { ...m.log }
      delete newLog[habitId]
      return { ...prev, [monthKey]: { ...m, habitList: (m.habitList || []).filter(h => h.id !== habitId), log: newLog } }
    })
  }
  function toggleDay(monthKey, habitId, day) {
    if (!user) { openLogin(); return }
    setHabits(prev => {
      const m = prev[monthKey] || {}
      const log = m.log || {}
      const habitLog = log[habitId] || {}
      return {
        ...prev,
        [monthKey]: { ...m, log: { ...log, [habitId]: { ...habitLog, [day]: !habitLog[day] } } },
      }
    })
  }

  const value = {
    state: uiState,
    dispatch,
    loaded,
    todos: { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo },
    goals: { getGoals, addGoal, toggleGoal, deleteGoal, getGoalProgress },
    habits: { getHabits, addHabit, deleteHabit, toggleDay, getLog },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
