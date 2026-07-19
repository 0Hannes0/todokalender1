import { useState } from 'react'
import { CalendarHeader } from '../calendar/CalendarHeader'
import { CalendarGrid } from '../calendar/CalendarGrid'
import { LeftPanel } from './LeftPanel'
import { DayDetailPanel } from '../day/DayDetailPanel'
import { HabitTracker } from '../habits/HabitTracker'
import { useApp } from '../../store/AppContext'
import { useTheme } from '../../store/ThemeContext'

const TABS = [
  {
    key: 'calendar',
    label: 'Kalender',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 3v4M15 3v4M3 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'today',
    label: 'Heute',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'goals',
    label: 'Ziele',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'habits',
    label: 'Habits',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 19S3 13.5 3 8a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5.5-8 11-8 11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

function HeartToggle() {
  const { dark, toggle } = useTheme()
  return (
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
  )
}

export function AppShell() {
  const { state } = useApp()
  const [mobileTab, setMobileTab] = useState('calendar')

  return (
    <>
      {/* ── Desktop (lg+) ── */}
      <div className="hidden xl:flex h-dvh overflow-hidden bg-bg">
        <div className="w-72 flex-shrink-0">
          <LeftPanel />
        </div>
        <div className="flex-1 flex flex-col min-w-0 bg-surface">
          <CalendarHeader />
          <div className="flex-1 overflow-auto">
            <CalendarGrid />
          </div>
        </div>
      </div>

      {/* ── Mobile/Tablet (< lg) ── */}
      <div className="flex xl:hidden flex-col h-dvh overflow-hidden bg-bg">
        {/* Safe-area top spacer */}
        <div className="safe-top bg-surface flex-shrink-0" />

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Calendar tab */}
          <div className={`absolute inset-0 flex flex-col bg-surface transition-opacity duration-200 ${mobileTab === 'calendar' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <CalendarHeader mobile />
            <div className="flex-1 overflow-auto">
              <CalendarGrid />
            </div>
          </div>

          {/* Today tab */}
          <div className={`absolute inset-0 bg-bg transition-opacity duration-200 ${mobileTab === 'today' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <LeftPanel mobileSection="today" />
          </div>

          {/* Goals tab */}
          <div className={`absolute inset-0 bg-bg transition-opacity duration-200 ${mobileTab === 'goals' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <LeftPanel mobileSection="goals" />
          </div>

          {/* Habits tab */}
          <div className={`absolute inset-0 bg-bg transition-opacity duration-200 ${mobileTab === 'habits' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <HabitTracker />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="flex-shrink-0 bg-surface border-t border-border safe-bottom">
          <div className="flex items-center">
            {TABS.map(tab => {
              const active = mobileTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setMobileTab(tab.key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors focus:outline-none
                    ${active ? 'text-accent' : 'text-text-3'}`}
                  aria-label={tab.label}
                >
                  {tab.icon}
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              )
            })}
            {/* Dark mode toggle in tab bar */}
            <div className="px-3 flex items-center">
              <HeartToggle />
            </div>
          </div>
        </nav>
      </div>

      {/* Day detail panel */}
      {state.selectedDay && <DayDetailPanel />}
    </>
  )
}
