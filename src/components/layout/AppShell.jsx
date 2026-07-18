import { useState } from 'react'
import { CalendarHeader } from '../calendar/CalendarHeader'
import { CalendarGrid } from '../calendar/CalendarGrid'
import { LeftPanel } from './LeftPanel'
import { DayDetailPanel } from '../day/DayDetailPanel'
import { useApp } from '../../store/AppContext'

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
]

export function AppShell() {
  const { state } = useApp()
  const [mobileTab, setMobileTab] = useState('calendar')

  return (
    <>
      {/* ── Desktop/Tablet (md+) ── */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-bg">
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

      {/* ── Mobile (< md) ── */}
      <div className="flex lg:hidden flex-col h-screen overflow-hidden bg-bg">
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
          <div className={`absolute inset-0 overflow-y-auto bg-bg transition-opacity duration-200 ${mobileTab === 'today' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <LeftPanel mobileSection="today" />
          </div>

          {/* Goals tab */}
          <div className={`absolute inset-0 overflow-y-auto bg-bg transition-opacity duration-200 ${mobileTab === 'goals' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
            <LeftPanel mobileSection="goals" />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="flex-shrink-0 bg-surface border-t border-border safe-bottom">
          <div className="flex">
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
          </div>
        </nav>
      </div>

      {/* Day detail panel — shown on both layouts */}
      {state.selectedDay && <DayDetailPanel />}
    </>
  )
}
