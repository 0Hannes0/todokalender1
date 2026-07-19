import { useApp } from '../../store/AppContext'
import { useAuth } from '../../store/AuthContext'
import { useLoginGate } from '../../store/LoginGateContext'
import { useTheme } from '../../store/ThemeContext'
import { formatMonthYear, formatWeekRange, toYearKey } from '../../utils/dateHelpers'

const VIEWS = [
  { key: 'week',  label: 'Woche' },
  { key: 'month', label: 'Monat' },
  { key: 'year',  label: 'Jahr'  },
]

export function CalendarHeader({ mobile = false }) {
  const { state, dispatch } = useApp()
  const { user, signOut } = useAuth()
  const { openLogin } = useLoginGate()
  const { dark, toggle } = useTheme()
  const { view, currentDate } = state

  function label() {
    if (view === 'month') return formatMonthYear(currentDate)
    if (view === 'week')  return formatWeekRange(currentDate)
    return toYearKey(currentDate)
  }

  return (
    <div className={`flex items-center justify-between border-b border-border bg-surface ${mobile ? 'px-4 py-3' : 'px-6 py-3'}`}>
      <div className="flex items-center gap-1.5">
        <button onClick={() => dispatch({ type: 'NAVIGATE', payload: -1 })} aria-label="Zurück"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 active:bg-surface-3 text-text-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 10.5L5.5 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className={`font-semibold text-text select-none text-center ${mobile ? 'text-sm min-w-36' : 'text-sm min-w-44'}`}>{label()}</span>
        <button onClick={() => dispatch({ type: 'NAVIGATE', payload: 1 })} aria-label="Weiter"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 active:bg-surface-3 text-text-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {!mobile && (
          <button onClick={() => dispatch({ type: 'GO_TO_TODAY' })}
            className="text-[11px] font-medium text-text-3 hover:text-text border border-border rounded-lg px-2.5 py-1 transition-all hover:border-border-2 ml-1">
            Heute
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* View switcher */}
        <div className="flex bg-surface-3 rounded-xl p-1 gap-0.5">
          {VIEWS.map(({ key, label: lbl }) => (
            <button key={key} onClick={() => dispatch({ type: 'SET_VIEW', payload: key })}
              className={`text-[11px] font-medium rounded-lg transition-all ${mobile ? 'px-2.5 py-1.5' : 'px-3 py-1.5'}
                ${view === key ? 'bg-white text-accent shadow-sm font-semibold' : 'text-text-3 hover:text-text-2'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Auth button */}
        {user ? (
          <button onClick={signOut} aria-label="Ausloggen"
            title={user.email}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 active:bg-surface-3 text-text-3 transition-colors flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-2.5L10 5M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <button onClick={openLogin}
            className="text-[11px] font-medium text-accent border border-accent/30 rounded-lg px-2.5 py-1.5 hover:bg-accent-soft transition-all flex-shrink-0">
            Einloggen
          </button>
        )}

        {/* Dark mode heart toggle (desktop only) */}
        {!mobile && (
          <button
            onClick={toggle}
            aria-label={dark ? 'Light Mode' : 'Dark Mode'}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${dark ? 'bg-accent' : 'bg-surface-3'}`}
          >
            <span className={`absolute top-0.5 flex items-center justify-center w-5 h-5 rounded-full shadow transition-transform duration-300 ${dark ? 'translate-x-6 bg-surface' : 'translate-x-0.5 bg-white'}`}>
              <svg width="12" height="11" viewBox="0 0 18 17" fill="none">
                <path d="M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"
                  stroke={dark ? '#e05c8a' : '#8b1a4a'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={dark ? '#e05c8a' : 'transparent'}
                />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
