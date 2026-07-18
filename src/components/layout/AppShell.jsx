import { CalendarHeader } from '../calendar/CalendarHeader'
import { CalendarGrid } from '../calendar/CalendarGrid'
import { Sidebar } from './Sidebar'
import { DayDetailPanel } from '../day/DayDetailPanel'
import { useApp } from '../../store/AppContext'

export function AppShell() {
  const { state } = useApp()

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader />
        <div className="flex-1 overflow-auto">
          <CalendarGrid />
        </div>
      </div>

      {state.selectedDay && <DayDetailPanel />}
    </div>
  )
}
