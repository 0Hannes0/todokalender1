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
    .select('todos, goals, habits, stars')
    .eq('user_id', uid)
    .single()
  if (error && error.code !== 'PGRST116') console.error('load error', error)
  return data || null
}

async function saveUserData(uid, todos, goals, habits, stars) {
  // Try with stars first, fall back progressively if columns don't exist yet
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: uid, todos, goals, habits, stars, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) {
    console.warn('save with stars failed, retrying without:', error.message)
    const { error: error2 } = await supabase
      .from('user_data')
      .upsert({ user_id: uid, todos, goals, habits, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error2) {
      console.warn('save with habits failed, retrying without:', error2.message)
      const { error: error3 } = await supabase
        .from('user_data')
        .upsert({ user_id: uid, todos, goals, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (error3) console.error('save error:', error3)
    }
  }
}

// --- localStorage fallback + backup cache ---
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
// Backup: saved after every successful Supabase load, used as safety net
function backupSave(todos, goals, habits, stars) {
  lsSet('tk_backup_todos', todos)
  lsSet('tk_backup_goals', goals)
  lsSet('tk_backup_habits', habits)
  lsSet('tk_backup_stars', stars)
}
function backupGet() {
  return {
    todos: lsGet('tk_backup_todos', null),
    goals: lsGet('tk_backup_goals', null),
    habits: lsGet('tk_backup_habits', null),
    stars: lsGet('tk_backup_stars', null),
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const { openLogin } = useLoginGate()
  const [uiState, dispatch] = useReducer(reducer, initialState)

  const [todos, setTodosRaw] = useState(() => lsGet('tk_todos', {}))
  const [goals, setGoalsRaw] = useState(() => lsGet('tk_goals', { daily: {}, weekly: {}, monthly: {}, yearly: {} }))
  const [habits, setHabitsRaw] = useState(() => lsGet('tk_habits', {}))
  const [stars, setStarsRaw] = useState(() => lsGet('tk_stars', {}))
  const [loaded, setLoaded] = useState(false)

  // Save timer ref for debounced remote writes
  const saveTimer = useRef(null)

  // Load from Supabase when user logs in, clear when logs out
  useEffect(() => {
    if (!user) {
      setTodosRaw({})
      setGoalsRaw({ daily: {}, weekly: {}, monthly: {}, yearly: {} })
      setHabitsRaw({})
      setStarsRaw({})
      dispatch({ type: 'CLOSE_DAY' })
      setLoaded(true)
      return
    }
    setLoaded(false)
    loadUserData(user.id).then(data => {
      if (data) {
        const todos = data.todos || {}
        const g = data.goals || {}
        const goals = {
          daily: g.daily || {},
          weekly: g.weekly || {},
          monthly: g.monthly || {},
          yearly: g.yearly || {},
        }
        const habits = data.habits || {}
        const stars = data.stars || {}
        setTodosRaw(todos)
        setGoalsRaw(goals)
        setHabitsRaw(habits)
        setStarsRaw(stars)
        // Save local backup after every successful load
        backupSave(todos, goals, habits, stars)
      } else {
        // No row in DB yet — try local backup to avoid data loss
        const backup = backupGet()
        if (backup.todos) setTodosRaw(backup.todos)
        if (backup.goals) setGoalsRaw(backup.goals)
        if (backup.habits) setHabitsRaw(backup.habits)
        if (backup.stars) setStarsRaw(backup.stars)
      }
      setLoaded(true)
    }).catch(err => {
      console.error('load failed, using backup:', err)
      const backup = backupGet()
      if (backup.todos) setTodosRaw(backup.todos)
      if (backup.goals) setGoalsRaw(backup.goals)
      if (backup.habits) setHabitsRaw(backup.habits)
      if (backup.stars) setStarsRaw(backup.stars)
      setLoaded(true)
    })
  }, [user?.id])

  // Debounced sync to Supabase (500ms after last change)
  function persist(newTodos, newGoals, newHabits, newStars) {
    // Always keep local backup in sync
    backupSave(newTodos, newGoals, newHabits, newStars)
    if (user) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveUserData(user.id, newTodos, newGoals, newHabits, newStars), 500)
    } else {
      lsSet('tk_todos', newTodos)
      lsSet('tk_goals', newGoals)
      lsSet('tk_habits', newHabits)
      lsSet('tk_stars', newStars)
    }
  }

  function setTodos(updater) {
    setTodosRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, goals, habits, stars)
      return next
    })
  }

  function setGoals(updater) {
    setGoalsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, next, habits, stars)
      return next
    })
  }

  function setHabits(updater) {
    setHabitsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, goals, next, stars)
      return next
    })
  }

  function setStars(updater) {
    setStarsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(todos, goals, habits, next)
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

  // Returns the most recent monthKey before `monthKey` that has a habitList
  function findInheritedHabitList(habitsMap, monthKey) {
    const keys = Object.keys(habitsMap)
      .filter(k => k < monthKey && (habitsMap[k]?.habitList?.length ?? 0) > 0)
      .sort()
    if (keys.length === 0) return null
    return habitsMap[keys[keys.length - 1]].habitList
  }

  function getHabits(monthKey) {
    if (habits[monthKey]?.habitList?.length > 0) return habits[monthKey].habitList
    return findInheritedHabitList(habits, monthKey) || []
  }
  function getLog(monthKey, habitId) {
    return habits[monthKey]?.log?.[habitId] || {}
  }

  // Ensures the given month has its own habitList copy (copy-on-write from inherited list)
  function ensureOwnHabitList(prev, monthKey) {
    if (prev[monthKey]?.habitList?.length > 0) return prev
    const inherited = findInheritedHabitList(prev, monthKey) || []
    return {
      ...prev,
      [monthKey]: {
        habitList: inherited.map(h => ({ ...h })),
        log: prev[monthKey]?.log || {},
      },
    }
  }

  function addHabit(monthKey, emoji, label) {
    if (!user) { openLogin(); return }
    const newHabit = { id: uuid(), emoji, label }
    setHabits(prev => {
      const base = ensureOwnHabitList(prev, monthKey)
      return {
        ...base,
        [monthKey]: {
          ...base[monthKey],
          habitList: [...base[monthKey].habitList, newHabit],
        },
      }
    })
  }
  function deleteHabit(monthKey, habitId) {
    if (!user) { openLogin(); return }
    setHabits(prev => {
      const base = ensureOwnHabitList(prev, monthKey)
      const m = base[monthKey]
      const newLog = { ...m.log }
      delete newLog[habitId]
      return { ...base, [monthKey]: { ...m, habitList: m.habitList.filter(h => h.id !== habitId), log: newLog } }
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

  function updateHabit(monthKey, habitId, emoji, label) {
    if (!user) { openLogin(); return }
    setHabits(prev => {
      const base = ensureOwnHabitList(prev, monthKey)
      const m = base[monthKey]
      return {
        ...base,
        [monthKey]: { ...m, habitList: m.habitList.map(h => h.id === habitId ? { ...h, emoji, label } : h) },
      }
    })
  }

  function reorderHabits(monthKey, fromIndex, toIndex) {
    if (!user) { openLogin(); return }
    setHabits(prev => {
      const base = ensureOwnHabitList(prev, monthKey)
      const m = base[monthKey]
      const list = [...m.habitList]
      const [moved] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, moved)
      return { ...base, [monthKey]: { ...m, habitList: list } }
    })
  }

  // --- Stars operations ---
  // stars structure: {
  //   weeks: { [weekKey]: { days: { [isoDate]: { kalorien, eiweiss, schritte, wasser, fieber } },
  //                         training: { kraft: [{date, minuten}], pilates: [{date, minuten}], jokerUsed, ausnahme },
  //                         lockedStars: null | number, lockedHearts: null | number } },
  //   months: { [monthKey]: { jokerDays: [isoDate], gesamtSterne: number, gesamtHerzen: number } }
  // }

  function getWeekStars(weekKey) {
    return stars.weeks?.[weekKey] || null
  }

  function getMonthStars(monthKey) {
    return stars.months?.[monthKey] || null
  }

  function setDayField(weekKey, isoDate, field, value) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const weeks = prev.weeks || {}
      const week = weeks[weekKey] || { days: {}, training: { kraft: [], pilates: [], jokerUsed: false, ausnahme: false }, lockedStars: null, lockedHearts: null }
      if (week.lockedStars !== null && week.lockedStars !== undefined) return prev // locked
      const day = week.days?.[isoDate] || {}
      return {
        ...prev,
        weeks: {
          ...weeks,
          [weekKey]: {
            ...week,
            days: { ...week.days, [isoDate]: { ...day, [field]: value } },
          },
        },
      }
    })
  }

  function addTrainingSession(weekKey, type, date, minuten) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const weeks = prev.weeks || {}
      const week = weeks[weekKey] || { days: {}, training: { kraft: [], pilates: [], jokerUsed: false, ausnahme: false }, lockedStars: null, lockedHearts: null }
      if (week.lockedStars !== null && week.lockedStars !== undefined) return prev
      const training = week.training || {}
      const sessions = [...(training[type] || []), { date, minuten: Number(minuten) }]
      return {
        ...prev,
        weeks: {
          ...weeks,
          [weekKey]: { ...week, training: { ...training, [type]: sessions } },
        },
      }
    })
  }

  function removeTrainingSession(weekKey, type, index) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const weeks = prev.weeks || {}
      const week = weeks[weekKey]
      if (!week || (week.lockedStars !== null && week.lockedStars !== undefined)) return prev
      const training = week.training || {}
      const sessions = (training[type] || []).filter((_, i) => i !== index)
      return {
        ...prev,
        weeks: {
          ...weeks,
          [weekKey]: { ...week, training: { ...training, [type]: sessions } },
        },
      }
    })
  }

  function setWeekTrainingFlag(weekKey, flag, value) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const weeks = prev.weeks || {}
      const week = weeks[weekKey] || { days: {}, training: { kraft: [], pilates: [], jokerUsed: false, ausnahme: false }, lockedStars: null, lockedHearts: null }
      if (week.lockedStars !== null && week.lockedStars !== undefined) return prev
      const training = week.training || {}
      return {
        ...prev,
        weeks: {
          ...weeks,
          [weekKey]: { ...week, training: { ...training, [flag]: value } },
        },
      }
    })
  }

  function lockWeek(weekKey, lockedStars, lockedHearts, monthKey) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const weeks = prev.weeks || {}
      const week = weeks[weekKey]
      if (!week) return prev
      const months = prev.months || {}
      const month = months[monthKey] || { jokerDays: [], gesamtSterne: 0, gesamtHerzen: 0 }
      // Subtract old locked values if re-locking (shouldn't happen but defensive)
      const prevLocked = week.lockedStars ?? 0
      const prevHearts = week.lockedHearts ?? 0
      return {
        ...prev,
        weeks: { ...weeks, [weekKey]: { ...week, lockedStars, lockedHearts } },
        months: {
          ...months,
          [monthKey]: {
            ...month,
            gesamtSterne: (month.gesamtSterne || 0) - prevLocked + lockedStars,
            gesamtHerzen: (month.gesamtHerzen || 0) - prevHearts + lockedHearts,
          },
        },
      }
    })
  }

  function setJokerDay(monthKey, isoDate, active) {
    if (!user) { openLogin(); return }
    setStars(prev => {
      const months = prev.months || {}
      const month = months[monthKey] || { jokerDays: [], gesamtSterne: 0, gesamtHerzen: 0 }
      let jokerDays = month.jokerDays || []
      if (active) {
        if (jokerDays.length >= 3) return prev // max 3 Joker per month
        if (!jokerDays.includes(isoDate)) jokerDays = [...jokerDays, isoDate]
      } else {
        jokerDays = jokerDays.filter(d => d !== isoDate)
      }
      return { ...prev, months: { ...months, [monthKey]: { ...month, jokerDays } } }
    })
  }

  function setKrankDay(weekKey, isoDate, active) {
    setDayField(weekKey, isoDate, 'fieber', active)
  }

  function getStreakData() {
    return stars.streak || null
  }

  function setStreakData(data) {
    setStars(prev => ({ ...prev, streak: data }))
  }

  const value = {
    state: uiState,
    dispatch,
    loaded,
    todos: { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo },
    goals: { getGoals, addGoal, toggleGoal, deleteGoal, getGoalProgress },
    habits: { getHabits, addHabit, deleteHabit, updateHabit, toggleDay, getLog, reorderHabits },
    stars: {
      getWeekStars, getMonthStars, setDayField,
      addTrainingSession, removeTrainingSession, setWeekTrainingFlag,
      lockWeek, setJokerDay, setKrankDay,
      getStreakData, setStreakData,
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() { return useContext(AppContext) }
