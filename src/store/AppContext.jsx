import { createContext, useContext, useReducer } from 'react'
import { addMonths, addWeeks, addYears } from '../utils/dateHelpers'

const AppContext = createContext(null)

const initialState = {
  view: 'month',       // 'month' | 'week' | 'year'
  currentDate: new Date(),
  selectedDay: null,   // Date | null
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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
